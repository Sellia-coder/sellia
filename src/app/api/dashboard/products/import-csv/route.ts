import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

interface CsvRow {
  nom?: string;
  prix?: string;
  prix_barre?: string;
  description?: string;
  categorie?: string;
  stock?: string;
  sku?: string;
}

interface ImportResult {
  total: number;
  created: number;
  errors: Array<{ row: number; error: string }>;
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]).map((h) =>
    h
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  );
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      (row as Record<string, string>)[h] = values[idx] || "";
    });
    rows.push(row);
  }

  return rows;
}

function slugFromName(name: string, index: number): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return base ? `${base}-${index + 1}` : `produit-${index + 1}`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true, slug: true, currency: true },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Aucune boutique trouvée" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 2MB)" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const rows = parseCsv(text);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Aucune ligne valide dans le CSV" },
        { status: 400 }
      );
    }

    if (rows.length > 200) {
      return NextResponse.json(
        { error: "Maximum 200 produits par import. Divisez votre fichier." },
        { status: 400 }
      );
    }

    const result: ImportResult = {
      total: rows.length,
      created: 0,
      errors: [],
    };

    const currency = shop.currency || "XAF";

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNum = i + 2;

      try {
        if (!row.nom?.trim()) {
          result.errors.push({ row: lineNum, error: "Nom manquant" });
          continue;
        }

        const price = parseInt((row.prix || "").replace(/\s/g, ""), 10);
        if (Number.isNaN(price) || price < 0) {
          result.errors.push({ row: lineNum, error: "Prix invalide" });
          continue;
        }

        const compareRaw = row.prix_barre?.replace(/\s/g, "") ?? "";
        const comparePrice = compareRaw
          ? parseInt(compareRaw, 10)
          : null;

        const stockRaw = row.stock?.trim();
        const stock =
          stockRaw && stockRaw.length > 0 ? parseInt(stockRaw, 10) : null;
        const hasStock = stock !== null && !Number.isNaN(stock);

        await db.product.create({
          data: {
            shopId: shop.id,
            name: row.nom.trim(),
            slug: slugFromName(row.nom.trim(), i),
            description: row.description?.trim() || null,
            price,
            comparePrice:
              comparePrice !== null && !Number.isNaN(comparePrice)
                ? comparePrice
                : null,
            currency,
            category: row.categorie?.trim() || null,
            stock: hasStock ? stock : null,
            unlimitedStock: !hasStock,
            sku: row.sku?.trim() || null,
            type: "physical",
            status: "active",
          },
        });

        result.created++;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Erreur de création";
        result.errors.push({ row: lineNum, error: message });
      }
    }

    if (shop.slug) {
      revalidatePath(`/shop/${shop.slug}`, "page");
    }
    revalidatePath("/dashboard/produits", "page");

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[import-csv]", err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
