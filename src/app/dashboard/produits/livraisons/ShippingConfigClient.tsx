"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CaretLeft,
  Truck,
  Plus,
  X,
  Bank,
  ShieldCheck,
  Crown,
  CheckCircle,
} from "@phosphor-icons/react";
import ProUpgradeModal from "@/components/personnalisation/ProUpgradeModal";
import { saveShippingConfigAction } from "@/app/actions/shipping-config";
import {
  step35Schema,
  COUNTRY_CITIES,
  type Step35Input,
  type ShippingZone,
} from "@/lib/validations/personnalisation";
import styles from "./shipping-config.module.css";

const MAX_ZONES = 10;

interface Props {
  initial: Step35Input;
  countryCode: string;
  codUnlocked: boolean;
  hasPhysicalProducts: boolean;
  currency: string;
}

export default function ShippingConfigClient({
  initial,
  countryCode,
  codUnlocked: initialCodUnlocked,
  hasPhysicalProducts,
  currency,
}: Props) {
  const router = useRouter();
  const [config, setConfig] = useState<Step35Input>(initial);
  const [codUnlocked, setCodUnlocked] = useState(initialCodUnlocked);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [pending, startTransition] = useTransition();

  const usedNames = new Set(
    config.shippingZones.map((z) => z.name.trim().toLowerCase())
  );
  const suggestions = (COUNTRY_CITIES[countryCode] ?? COUNTRY_CITIES.OTHER ?? []).filter(
    (city) => !usedNames.has(city.toLowerCase())
  );

  const updateZone = (id: string, patch: Partial<ShippingZone>) => {
    setConfig({
      ...config,
      shippingZones: config.shippingZones.map((z) =>
        z.id === id ? { ...z, ...patch } : z
      ),
    });
  };

  const addZone = (name = "") => {
    if (config.shippingZones.length >= MAX_ZONES) return;
    setConfig({
      ...config,
      shippingZones: [
        ...config.shippingZones,
        {
          id: `zone-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: name.trim(),
          price: 0,
          eta: "",
        },
      ],
    });
  };

  const removeZone = (id: string) => {
    setConfig({
      ...config,
      shippingZones: config.shippingZones.filter((z) => z.id !== id),
    });
  };

  const togglePayment = (
    key: "paymentCashOnDelivery" | "paymentOnlineEscrow",
    checked: boolean
  ) => {
    setConfig({ ...config, [key]: checked });
  };

  const handleSave = () => {
    setError(null);
    setSuccess(false);
    const parsed = step35Schema.safeParse(config);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Vérifiez la configuration");
      return;
    }
    startTransition(async () => {
      const res = await saveShippingConfigAction(parsed.data);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 4000);
    });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <Link href="/dashboard/produits" className={styles.backLink}>
          <CaretLeft size={15} weight="bold" /> Retour aux produits
        </Link>
      </div>

      <header className={styles.header}>
        <span className={styles.eyebrow}>— LOGISTIQUE</span>
        <h1 className={styles.title}>Livraisons & paiement</h1>
        <p className={styles.subtitle}>
          Zones, frais et délais pour vos produits physiques. Cette configuration
          reprend celle de votre personnalisation et s&apos;applique au checkout.
        </p>
      </header>

      {!hasPhysicalProducts && (
        <div className={styles.card}>
          <p className={styles.cardDesc} style={{ marginBottom: 0 }}>
            Vous n&apos;avez pas encore de produit physique. Ces réglages
            s&apos;appliqueront dès que vous en ajouterez un.
          </p>
        </div>
      )}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <Truck size={18} weight="duotone" />
          Zones de livraison
        </h2>
        <p className={styles.cardDesc}>
          Définissez vos zones, tarifs ({currency}) et délais estimés affichés au
          client.
        </p>

        <div className={styles.zoneList}>
          {config.shippingZones.map((zone) => (
            <div key={zone.id} className={styles.zoneRow}>
              <input
                type="text"
                value={zone.name}
                placeholder="Nom de la zone"
                onChange={(e) => updateZone(zone.id, { name: e.target.value })}
              />
              <input
                type="number"
                min={0}
                value={zone.price}
                placeholder="Prix"
                onChange={(e) =>
                  updateZone(zone.id, {
                    price: Number(e.target.value) || 0,
                  })
                }
              />
              <input
                type="text"
                value={zone.eta ?? ""}
                placeholder="Délai (ex. 2-3 jours)"
                onChange={(e) => updateZone(zone.id, { eta: e.target.value })}
              />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeZone(zone.id)}
                disabled={config.shippingZones.length === 1}
                aria-label="Supprimer la zone"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {config.shippingZones.length < MAX_ZONES && (
          <button type="button" className={styles.addBtn} onClick={() => addZone()}>
            <Plus size={14} weight="bold" />
            Ajouter une zone
          </button>
        )}

        {suggestions.length > 0 && config.shippingZones.length < MAX_ZONES && (
          <div className={styles.suggestions}>
            {suggestions.slice(0, 6).map((city) => (
              <button
                key={city}
                type="button"
                className={styles.suggestionBtn}
                onClick={() => addZone(city)}
              >
                + {city}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <Bank size={18} weight="duotone" />
          Options de paiement (physique)
        </h2>
        <p className={styles.cardDesc}>
          Le paiement à la livraison (COD) concerne uniquement les produits
          physiques. L&apos;activation est unique et permanente.
        </p>

        <div
          className={`${styles.paymentOption} ${
            config.paymentCashOnDelivery && codUnlocked
              ? styles.paymentOptionActive
              : ""
          } ${!codUnlocked ? styles.paymentOptionLocked : ""}`}
        >
          <div className={styles.paymentIcon}>
            <Bank size={20} />
          </div>
          <div className={styles.paymentBody}>
            <div className={styles.paymentTitle}>
              Paiement à la livraison
              {codUnlocked ? (
                <span className={styles.activatedBadge}>
                  <CheckCircle size={12} weight="fill" />
                  Activé
                </span>
              ) : (
                <span className={styles.proBadge}>
                  <Crown size={10} weight="fill" />
                  1 900 FCFA
                </span>
              )}
            </div>
            <p className={styles.paymentDesc}>
              {codUnlocked
                ? "Le client règle en espèces ou Mobile Money au livreur à la réception."
                : "Débloquez cette option une fois pour l'activer sur votre boutique (1 900 FCFA, paiement unique)."}
            </p>
          </div>
          {!codUnlocked ? (
            <button
              type="button"
              className={styles.unlockBtn}
              onClick={() => setShowProModal(true)}
            >
              <Crown size={14} weight="fill" />
              Débloquer
            </button>
          ) : (
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={config.paymentCashOnDelivery}
                onChange={(e) =>
                  togglePayment("paymentCashOnDelivery", e.target.checked)
                }
              />
              <span className={styles.toggleSlider} />
            </label>
          )}
        </div>

        <div
          className={`${styles.paymentOption} ${
            config.paymentOnlineEscrow ? styles.paymentOptionActive : ""
          }`}
        >
          <div className={styles.paymentIcon}>
            <ShieldCheck size={20} />
          </div>
          <div className={styles.paymentBody}>
            <div className={styles.paymentTitle}>Paiement en ligne sécurisé</div>
            <p className={styles.paymentDesc}>
              Le client paie à l&apos;avance. Les fonds sont sécurisés par Sellia
              jusqu&apos;à la confirmation de livraison par le client.
            </p>
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={config.paymentOnlineEscrow}
              onChange={(e) =>
                togglePayment("paymentOnlineEscrow", e.target.checked)
              }
            />
            <span className={styles.toggleSlider} />
          </label>
        </div>
      </section>

      {error && <div className={styles.error}>{error}</div>}
      {success && (
        <div className={styles.success}>Configuration enregistrée.</div>
      )}

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={pending}
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      <ProUpgradeModal
        open={showProModal}
        onClose={() => setShowProModal(false)}
        onUnlocked={() => {
          setCodUnlocked(true);
          setConfig((c) => ({ ...c, paymentCashOnDelivery: true }));
          router.refresh();
        }}
      />
    </div>
  );
}
