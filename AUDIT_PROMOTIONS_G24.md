# AUDIT PROMOTIONS G2.4

## ✅ Ce qui marche

### Coupons
- [x] `createCouponAction` OK
- [x] `/api/shop/[slug]/apply-coupon` valide les codes
- [x] Champs `couponCode` / `couponDiscount` sauvegardés dans `Order` à la création
- [x] `coupon.currentUses` incrémenté après commande (transaction dans `createOrderAction`)
- [x] `CouponUsage` créé avec `orderId` + `customerPhone`

**Note :** La logique coupon dans `src/app/actions/order.ts` existait déjà et correspond au spec :
- validation via `validateCouponForCheckout`
- `couponCode` / `couponDiscount` persistés sur l'Order à la création
- transaction post-création : increment `currentUses` + création `CouponUsage`

### Pixels marketing
- [x] `ShopPixelScripts` injecté dans `src/app/shop/[slug]/layout.tsx`
- [x] GA4 PageView émis (gtag config)
- [x] FB Pixel PageView émis
- [x] TikTok page() émis
- [x] Snapchat PAGE_VIEW émis
- [x] `ViewContent` sur page produit (`ProductDetail.tsx`)
- [x] `AddToCart` sur bouton panier (`ProductDetail.tsx`)
- [x] `InitiateCheckout` sur checkout (`CheckoutClient.tsx`)
- [x] `Purchase` sur confirmation commande (`OrderConfirmationClient.tsx`, idempotent via sessionStorage)

### Pages légales & footer
- [x] `generateLegalPagesAction` — CGV, Confidentialité, Mentions légales personnalisées
- [x] Banner dashboard si pages légales manquantes
- [x] Footer boutique dynamique (`ShopFooter.tsx` + route `/shop/[slug]/[pageSlug]`)

## ⚠️ À tester manuellement

1. Créer un coupon TEST20 (-20%)
2. Ajouter produit panier
3. Passer commande avec code TEST20
4. Vérifier `Order.couponCode === "TEST20"` en BDD
5. Vérifier `coupon.currentUses === 1`
6. Ouvrir Facebook Events Manager → Test Events
7. Visiter une page produit → vérifier ViewContent
8. Acheter → vérifier Purchase
9. Générer pages légales depuis `/dashboard/pages`
10. Vérifier liens footer boutique publique

## 📝 À faire manuellement (FB CAPI server-side)

Le `fbCapiToken` est stocké en BDD mais l'envoi server-side n'est pas implémenté.

Pour activer Facebook Conversions API (iOS 14+ tracking) :
- Créer endpoint POST `/api/internal/fb-capi`
- Envoyer event Purchase server-side avec hashed user data
- Nécessite `event_id` pour déduplication avec le pixel client

## Packages optionnels

- `react-markdown` non installé — rendu markdown léger via `ShopPageMarkdown.tsx` (sans dépendance npm)
