import { z } from "zod";

export const COUNTRIES = [
  { code: "CM", name: "Cameroun", flag: "🇨🇲", dialCode: "+237" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", dialCode: "+225" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳", dialCode: "+221" },
  { code: "CD", name: "RDC", flag: "🇨🇩", dialCode: "+243" },
  { code: "BJ", name: "Bénin", flag: "🇧🇯", dialCode: "+229" },
  { code: "TG", name: "Togo", flag: "🇹🇬", dialCode: "+228" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", dialCode: "+226" },
  { code: "ML", name: "Mali", flag: "🇲🇱", dialCode: "+223" },
  { code: "GA", name: "Gabon", flag: "🇬🇦", dialCode: "+241" },
  { code: "CG", name: "Congo", flag: "🇨🇬", dialCode: "+242" },
  { code: "OTHER", name: "Autre", flag: "🌍", dialCode: "+" },
] as const;

export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as [string, ...string[]];

export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;
export const WHATSAPP_REGEX = /^\+[0-9]{8,15}$/;

// ===== PRODUCT CONSTANTS =====

export const PRODUCT_CATEGORIES = [
  { code: "mode", label: "Mode & Vêtements", iconName: "Shirt" },
  { code: "beaute", label: "Beauté & Cosmétiques", iconName: "Sparkle" },
  { code: "alimentation", label: "Alimentation & Boissons", iconName: "UtensilsCrossed" },
  { code: "tech", label: "Tech & Électronique", iconName: "Smartphone" },
  { code: "artisanat", label: "Artisanat & Fait main", iconName: "Palette" },
  { code: "bijoux", label: "Bijoux & Accessoires", iconName: "Gem" },
  { code: "maison", label: "Maison & Décoration", iconName: "Home" },
  { code: "sport", label: "Sport & Loisirs", iconName: "Dumbbell" },
  { code: "enfant", label: "Enfants & Bébés", iconName: "Baby" },
  { code: "service", label: "Services", iconName: "Wrench" },
  { code: "autre", label: "Autre / Personnalisé", iconName: "Boxes" },
] as const;

export const PRODUCT_CATEGORY_CODES = PRODUCT_CATEGORIES.map((c) => c.code) as [string, ...string[]];

export const PRODUCT_TYPES = [
  { code: "physical", label: "Produit physique", emoji: "📦", description: "Objet à livrer ou retirer" },
  { code: "digital", label: "Produit digital", emoji: "💾", description: "Fichier livré par téléchargement" },
  { code: "service", label: "Service", emoji: "🛠️", description: "Prestation, consultation, abonnement" },
] as const;

export const PRODUCT_TYPE_CODES = PRODUCT_TYPES.map((t) => t.code) as [string, ...string[]];

export const PRODUCT_SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/;

export const SKU_REGEX = /^[A-Za-z0-9-_]{0,30}$/;

export const AI_DESCRIPTION_TONES = [
  {
    code: "commerce" as const,
    label: "Vente directe",
    emoji: "🛒",
    description: "Bénéfices clairs, ton commercial, appel à l’action",
  },
  {
    code: "story" as const,
    label: "Histoire & émotion",
    emoji: "✨",
    description: "Narratif, valeurs, ce qui rend le produit unique",
  },
  {
    code: "tech" as const,
    label: "Détail & confiance",
    emoji: "📋",
    description: "Infos précises, matières, usage, transparence",
  },
] as const;

export type AiDescriptionTone = (typeof AI_DESCRIPTION_TONES)[number]["code"];

export const RESERVED_SLUGS = [
  "www",
  "api",
  "admin",
  "dashboard",
  "app",
  "auth",
  "login",
  "signup",
  "register",
  "help",
  "support",
  "docs",
  "blog",
  "about",
  "contact",
  "privacy",
  "terms",
  "legal",
  "cdn",
  "static",
  "assets",
  "mail",
  "billing",
  "checkout",
  "account",
  "settings",
  "sellia",
  "getsellia",
  "store",
  "shop",
  "boutique",
  "panier",
  "commande",
  "apercu",
  "personnaliser-ma-boutique",
  "onboarding",
  "boutique-creee",
];

export const step1Schema = z.object({
  slug: z
    .string()
    .min(3, "Au moins 3 caractères")
    .max(30, "Maximum 30 caractères")
    .regex(SLUG_REGEX, "Lettres minuscules, chiffres et tirets uniquement")
    .refine((s) => !RESERVED_SLUGS.includes(s), "Ce nom est réservé"),
  logoUrl: z.string().nullable().optional(),
});

export const variantAxisSchema = z.object({
  name: z.string().min(1).max(40),
  values: z.array(z.string().min(1).max(40)).min(1).max(20),
  swatches: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).optional(),
});

export const variantSchema = z.object({
  id: z.string().optional(),
  attributes: z.record(z.string(), z.string()),
  label: z.string(),
  stock: z.number().int().min(0).nullable().optional(),
  priceDelta: z.number().int().default(0),
  imageUrl: z.string().nullable().optional(),
  sku: z.string().max(50).nullable().optional(),
  isActive: z.boolean().default(true),
  position: z.number().int().default(0),
});

export type VariantAxisInput = z.infer<typeof variantAxisSchema>;
export type VariantInput = z.infer<typeof variantSchema>;

export const productEditSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1, "Nom obligatoire").max(120, "Maximum 120 caractères"),
    slug: z
      .string()
      .max(60)
      .refine((s) => s === "" || PRODUCT_SLUG_REGEX.test(s), "Format invalide (a-z, 0-9, tirets)"),
    shortDescription: z.string().max(200, "Maximum 200 caractères").optional().or(z.literal("")),
    description: z.string().max(10000, "Description trop longue").optional().or(z.literal("")),
    emoji: z.string().max(8).optional().or(z.literal("")),

    price: z
      .number()
      .int("Prix entier en FCFA")
      .min(100, "Minimum 100 FCFA")
      .max(50_000_000, "Maximum 50 000 000 FCFA"),
    comparePrice: z.number().int().min(0).max(50_000_000).nullable().optional(),

    category: z.enum(PRODUCT_CATEGORY_CODES).optional(),
    customCategory: z.string().max(60).optional().or(z.literal("")),
    tags: z.array(z.string().max(30)).max(10, "Maximum 10 tags").default([]),

    type: z.enum(PRODUCT_TYPE_CODES).default("physical"),
    sku: z
      .string()
      .regex(SKU_REGEX, "SKU invalide (lettres, chiffres, - _)")
      .max(30)
      .optional()
      .or(z.literal("")),
    stock: z.number().int().min(0).max(999_999).nullable().optional(),
    unlimitedStock: z.boolean().default(true),
    weight: z.number().int().min(0).max(100_000).nullable().optional(),

    digitalFileUrl: z.string().max(2000).optional().or(z.literal("")),
    downloadLimit: z.number().int().min(0).max(1000).nullable().optional(),

    imageUrl: z.string().max(2_500_000, "Image trop lourde").nullable().optional(),
    galleryUrls: z.array(z.string().max(2_500_000)).max(4).default([]),

    hasVariants: z.boolean().default(false),
    variantAxes: z.array(variantAxisSchema).max(2).default([]),
    variants: z.array(variantSchema).default([]),

    feeMode: z
      .enum(["merchant_absorbs", "customer_pays", "split_50_50"])
      .default("merchant_absorbs"),
    codAvailable: z.boolean().default(false),

    included: z.boolean(),
  })
  .refine((p) => !p.comparePrice || p.comparePrice > p.price, {
    message: "Le prix barré doit être supérieur au prix actuel",
    path: ["comparePrice"],
  })
  .refine((p) => p.unlimitedStock || (typeof p.stock === "number" && p.stock >= 0), {
    message: "Indique un stock ou coche illimité",
    path: ["stock"],
  })
  .refine((p) => !p.hasVariants || p.type === "physical", {
    message: "Les variantes sont uniquement disponibles pour les produits physiques",
    path: ["hasVariants"],
  });

export const step2Schema = z.object({
  products: z
    .array(productEditSchema)
    .min(1, "Au moins 1 produit")
    .max(20, "Maximum 20 produits à cette étape (tu en ajouteras d'autres depuis ton dashboard)")
    .refine((list) => list.some((p) => p.included), "Sélectionne au moins 1 produit à publier"),
});

export const step3Schema = z.object({
  whatsappNumber: z.string().regex(WHATSAPP_REGEX, "Format : +237XXXXXXXXX (avec indicatif pays)"),
  contactEmail: z.string().email("Email invalide"),
  country: z.enum(COUNTRY_CODES),
  city: z.string().min(2, "Ville obligatoire").max(60),
  address: z.string().max(200).optional(),
  instagramUrl: z.string().url("URL Instagram invalide").optional().or(z.literal("")),
  facebookUrl: z.string().url("URL Facebook invalide").optional().or(z.literal("")),
});

export const step4Schema = z.object({
  description: z.string().min(20, "Au moins 20 caractères").max(2000, "Maximum 2000 caractères"),
});

export const appearanceBackgroundSchema = z.enum(["ivory", "white", "cream"]);
export const appearanceFontSchema = z.enum(["classic", "modern", "editorial"]);

export const heroTemplateSchema = z.enum([
  "jewelry",
  "tech",
  "beauty",
  "food",
  "home",
  "universal",
]);

export const stepAppearanceSchema = z.object({
  primaryColor: z.string().min(4).max(32),
  accentColor: z.string().min(4).max(32),
  backgroundStyle: appearanceBackgroundSchema,
  fontStyle: appearanceFontSchema,
  heroTemplate: heroTemplateSchema.default("universal"),
  heroImageUrl: z.string().max(500).nullable().optional(),
});

export type StepAppearanceInput = z.infer<typeof stepAppearanceSchema>;

// ===== ZONES DE LIVRAISON & PAIEMENT (Step Livraison) =====

export const COUNTRY_CITIES: Record<string, string[]> = {
  CM: ["Douala", "Yaoundé", "Bafoussam", "Bamenda", "Garoua", "Maroua", "Kribi", "Limbé"],
  CI: ["Abidjan", "Bouaké", "Yamoussoukro", "Korhogo", "San-Pédro", "Daloa"],
  SN: ["Dakar", "Thiès", "Saint-Louis", "Touba", "Mbour", "Ziguinchor"],
  CD: ["Kinshasa", "Lubumbashi", "Goma", "Bukavu", "Mbuji-Mayi", "Kisangani"],
  BJ: ["Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi"],
  TG: ["Lomé", "Sokodé", "Kara", "Kpalimé"],
  BF: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou"],
  ML: ["Bamako", "Sikasso", "Mopti", "Ségou"],
  GA: ["Libreville", "Port-Gentil", "Franceville"],
  CG: ["Brazzaville", "Pointe-Noire", "Dolisie"],
  OTHER: [],
};

export const COUNTRY_DEFAULT_NATIONAL_PRICE: Record<string, number> = {
  CM: 5000,
  CI: 4000,
  SN: 3500,
  CD: 8000,
  BJ: 3000,
  TG: 2500,
  BF: 3000,
  ML: 4000,
  GA: 5000,
  CG: 5000,
  OTHER: 5000,
};

export const SHIPPING_ZONE_NAME_REGEX = /^[a-zA-ZÀ-ÿ0-9\s\-',.()]{2,50}$/;
export const ETA_REGEX = /^[0-9a-zA-ZÀ-ÿ\s\-]{0,40}$/;

export const shippingZoneSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, "Nom de zone trop court")
    .max(50, "Nom de zone trop long")
    .regex(SHIPPING_ZONE_NAME_REGEX, "Caractères invalides dans le nom"),
  price: z
    .number()
    .int("Prix entier en FCFA")
    .min(0, "Prix négatif impossible")
    .max(500_000, "Prix maximum 500 000 FCFA"),
  eta: z.string().max(40, "Délai trop long").optional().or(z.literal("")),
});

export const step35Schema = z
  .object({
    shippingZones: z
      .array(shippingZoneSchema)
      .min(1, "Au moins une zone de livraison")
      .max(10, "Maximum 10 zones (tu pourras en ajouter d'autres depuis ton dashboard)"),
    paymentCashOnDelivery: z.boolean(),
    paymentOnlineEscrow: z.boolean(),
  })
  .refine((s) => s.paymentCashOnDelivery || s.paymentOnlineEscrow, {
    message: "Active au moins une option de paiement",
    path: ["paymentCashOnDelivery"],
  });

export type ShippingZone = z.infer<typeof shippingZoneSchema>;
export type Step35Input = z.infer<typeof step35Schema>;

export const publishShopSchema = z
  .object({
    step1: step1Schema,
    stepAppearance: stepAppearanceSchema,
    step2: step2Schema,
    step3: step3Schema,
    step35: step35Schema.optional(),
    step4: step4Schema,
  })
  .superRefine((data, ctx) => {
    const hasPhysical = data.step2.products.some((p) => p.included && p.type === "physical");
    if (!hasPhysical) return;
    if (!data.step35) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La configuration livraison et paiement est requise pour tes produits physiques.",
        path: ["step35"],
      });
      return;
    }
    const parsed = step35Schema.safeParse(data.step35);
    if (!parsed.success) {
      for (const iss of parsed.error.issues) {
        ctx.addIssue({ ...iss, path: ["step35", ...iss.path] });
      }
    }
  });

export type Step1Input = z.infer<typeof step1Schema>;
export type Step2Input = z.infer<typeof step2Schema>;
export type Step3Input = z.infer<typeof step3Schema>;
export type Step4Input = z.infer<typeof step4Schema>;
export type ProductEditInput = z.infer<typeof productEditSchema>;
export type PublishShopInput = z.infer<typeof publishShopSchema>;
