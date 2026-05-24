"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepHeader from "./StepHeader";
import Step1Logo from "./Step1Logo";
import StepAppearance from "./StepAppearance";
import Step2Products from "./Step2Products";
import Step3Contact from "./Step3Contact";
import Step35Shipping from "./Step35Shipping";
import Step4Description from "./Step4Description";
import Step5Recap from "./Step5Recap";
import { publishShopAction } from "@/app/actions/personnalisation";
import "@/app/personnaliser-ma-boutique/personnalisation.css";
import {
  PRODUCT_CATEGORY_CODES,
  COUNTRY_DEFAULT_NATIONAL_PRICE,
  type ProductEditInput,
  type Step1Input,
  type Step2Input,
  type Step3Input,
  type Step35Input,
  type Step4Input,
  type StepAppearanceInput,
} from "@/lib/validations/personnalisation";

type DraftShop = {
  id: string;
  name: string | null;
  tagline: string | null;
  description: string | null;
  category: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  backgroundStyle?: "ivory" | "white" | "cream" | null;
  fontStyle?: "classic" | "modern" | "editorial" | null;
  products: unknown;
};

interface Props {
  draft: DraftShop;
  userEmail: string;
}

type DraftProductRow = {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  emoji?: string;
  category?: string;
};

const CATEGORY_CODE_SET = new Set<string>(PRODUCT_CATEGORY_CODES);

function mapDraftCategory(raw?: string): ProductEditInput["category"] | undefined {
  if (!raw?.trim()) return undefined;
  const n = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (CATEGORY_CODE_SET.has(n)) {
    return n as ProductEditInput["category"];
  }
  const t = n.replace(/\s+/g, " ");
  const rules: [RegExp, NonNullable<ProductEditInput["category"]>][] = [
    [/\b(mode|vetement|vetements|pret|pret-a-porter|fashion)\b/, "mode"],
    [/\b(beaut|cosmet|cosmetic|maquillage|soin)\b/, "beaute"],
    [/\b(aliment|boisson|food|cuisine|restaurant|epicerie)\b/, "alimentation"],
    [/\b(tech|electronique|gsm|smartphone|ordi)\b/, "tech"],
    [/\b(artisan|fait\s*main|handmade)\b/, "artisanat"],
    [/\b(bijou|accessor|montre)\b/, "bijoux"],
    [/\b(maison|deco|rangement)\b/, "maison"],
    [/\b(sport|fitness|loisir)\b/, "sport"],
    [/\b(enfant|bebe|bebé)\b/, "enfant"],
    [/\b(service|prestation|consult)\b/, "service"],
    [/\b(autre)\b/, "autre"],
  ];
  for (const [re, code] of rules) {
    if (re.test(t)) return code;
  }
  return undefined;
}

function plainDraftDescriptionToRichHtml(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  const escaped = t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join("");
}

export default function PersonnalisationWizard({ draft, userEmail }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(1);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const productsRaw = Array.isArray(draft.products) ? (draft.products as DraftProductRow[]) : [];
  const initialProducts: ProductEditInput[] = productsRaw.map((p, idx) => {
    const parsedPrice = typeof p.price === "number" ? p.price : 100;
    return {
      id: p.id ?? `draft-${idx}`,
      name: p.name ?? "Produit",
      slug: "",
      shortDescription: "",
      description: plainDraftDescriptionToRichHtml(p.description ?? ""),
      emoji: p.emoji?.trim() || "",
      price: parsedPrice >= 100 ? parsedPrice : 100,
      comparePrice: null,
      category: mapDraftCategory(p.category),
      customCategory: "",
      tags: [],
      type: "physical",
      sku: "",
      stock: null,
      unlimitedStock: true,
      weight: null,
      digitalFileUrl: "",
      downloadLimit: null,
      imageUrl: null,
      galleryUrls: [],
      hasVariants: false,
      variantAxes: [],
      variants: [],
      feeMode: "merchant_absorbs" as const,
      codAvailable: false,
      included: true,
    };
  });

  const [step1, setStep1] = useState<Step1Input>({
    slug: slugify(draft.name ?? "ma-boutique"),
    logoUrl: null,
  });
  const [stepAppearance, setStepAppearance] = useState<StepAppearanceInput>({
    primaryColor: draft.primaryColor ?? "#E84B1F",
    accentColor: draft.accentColor ?? "#0A0E13",
    backgroundStyle: draft.backgroundStyle ?? "ivory",
    fontStyle: draft.fontStyle ?? "classic",
    heroTemplate: "universal",
    heroImageUrl: null,
  });
  const [step2, setStep2] = useState<Step2Input>({ products: initialProducts });
  const [step3, setStep3] = useState<Step3Input>({
    whatsappNumber: "",
    contactEmail: userEmail,
    country: "CM",
    city: "",
    address: "",
    instagramUrl: "",
    facebookUrl: "",
  });
  const [step35, setStep35] = useState<Step35Input>({
    shippingZones: [
      {
        id: "zone-default-national",
        name: "Tout le pays",
        price: COUNTRY_DEFAULT_NATIONAL_PRICE.CM,
        eta: "3-5 jours",
      },
    ],
    paymentCashOnDelivery: false,
    paymentOnlineEscrow: true,
  });
  const [step4, setStep4] = useState<Step4Input>({
    description: draft.description ?? "",
  });

  const hasPhysicalProducts = step2.products.some(
    (p) => p.included && p.type === "physical"
  );

  useEffect(() => {
    const defaultPrice =
      COUNTRY_DEFAULT_NATIONAL_PRICE[step3.country] ??
      COUNTRY_DEFAULT_NATIONAL_PRICE.OTHER;

    setStep35((prev) => {
      const nationalZone = prev.shippingZones.find(
        (z) => z.id === "zone-default-national"
      );
      if (!nationalZone || nationalZone.price !== 0) return prev;
      return {
        ...prev,
        shippingZones: prev.shippingZones.map((z) =>
          z.id === "zone-default-national" ? { ...z, price: defaultPrice } : z
        ),
      };
    });
  }, [step3.country]);

  const handleNext = () => {
    setGlobalError(null);
    if (currentStep === 4) {
      setCurrentStep(hasPhysicalProducts ? 35 : 5);
      return;
    }
    if (currentStep === 35) {
      setCurrentStep(5);
      return;
    }
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };
  const handleBack = () => {
    setGlobalError(null);
    if (currentStep === 5) {
      setCurrentStep(hasPhysicalProducts ? 35 : 4);
      return;
    }
    if (currentStep === 35) {
      setCurrentStep(4);
      return;
    }
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handlePublish = () => {
    setGlobalError(null);
    startTransition(async () => {
      const payload = {
        step1,
        stepAppearance,
        step2,
        step3,
        ...(hasPhysicalProducts ? { step35 } : {}),
        step4,
      };
      const result = await publishShopAction(payload);
      if (!result.ok) {
        setGlobalError(result.error ?? "Une erreur est survenue");
        return;
      }
      router.push("/boutique-creee");
    });
  };

  return (
    <div className="perso-page">
      <StepHeader
        currentStep={currentStep}
        shopName={draft.name}
        shopLogoUrl={step1.logoUrl ?? null}
        shopPrimaryColor={stepAppearance.primaryColor ?? draft.primaryColor}
        hasPhysicalProducts={hasPhysicalProducts}
      />

      <main className="perso-main">
        {globalError && <div className="perso-alert-error">{globalError}</div>}

        {currentStep === 1 && (
          <Step1Logo
            value={step1}
            onChange={setStep1}
            shopName={draft.name ?? "Ma boutique"}
            primaryColor={stepAppearance.primaryColor ?? draft.primaryColor ?? "#E84B1F"}
            onNext={handleNext}
          />
        )}
        {currentStep === 2 && (
          <StepAppearance
            value={stepAppearance}
            onChange={setStepAppearance}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && (
          <Step2Products
            value={step2}
            onChange={setStep2}
            onNext={handleNext}
            onBack={handleBack}
            shopContext={{ name: draft.name ?? null, category: draft.category ?? null }}
          />
        )}
        {currentStep === 4 && (
          <Step3Contact
            value={step3}
            onChange={setStep3}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 35 && (
          <Step35Shipping
            value={step35}
            onChange={setStep35}
            onNext={handleNext}
            onBack={handleBack}
            countryCode={step3.country}
          />
        )}
        {currentStep === 5 && (
          <Step4Description
            value={step4}
            onChange={setStep4}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 6 && (
          <Step5Recap
            step1={step1}
            stepAppearance={stepAppearance}
            step2={step2}
            step3={step3}
            step35={hasPhysicalProducts ? step35 : null}
            step4={step4}
            draft={draft}
            isPublishing={isPending}
            onPublish={handlePublish}
            onBack={handleBack}
            onEditStep={(s) => setCurrentStep(s)}
          />
        )}
      </main>
    </div>
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}
