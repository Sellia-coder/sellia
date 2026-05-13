# Cartevo Payment Security — Sellia

## Stratégie : VERIFY-ON-PULL

Cartevo n'envoie PAS de signature HMAC sur les webhooks. Plutôt que de faire
confiance aveuglément au contenu, on applique le pattern Verify-on-Pull :

1. Webhook arrive → on extrait UNIQUEMENT le `transaction_id`
2. On refait un `GET /payment/transactions/{id}` authentifié avec NOTRE token
3. Cartevo répond avec la VRAIE donnée
4. On compare au montant attendu de notre Order
5. On met à jour la BDD avec les données AUTHENTIQUES

Un attaquant qui POST un faux webhook :

- Avec un fake `transaction_id` → GET retourne 404 → ignoré
- Avec un vrai `transaction_id` deviné → GET retourne la VRAIE donnée
  (status PENDING ou FAILED si client n'a pas vraiment payé)

## 17+1 Vecteurs d'attaque

### Webhook (5)

| # | Vecteur | Mitigation | Fichier |
|---|---------|------------|---------|
| 1 | Webhook spoofing | Verify-on-Pull (refait un GET) | `verify.ts` |
| 2 | Replay attack | Idempotency par hash du body + UNIQUE | `webhook.ts` + `CartevoWebhookLog` |
| 3 | Race condition | Prisma `$transaction` + UNIQUE constraint | webhook receiver G2 |
| 4 | IP whitelisting | Code prêt, désactivé (Cartevo pas d'IPs) | `ip-whitelist.ts` |
| 5 | Body tampering | N/A (on ignore le body sauf tx_id) | N/A |

### API interne (5)

| # | Vecteur | Mitigation | Fichier |
|---|---------|------------|---------|
| 6 | CSRF | Origin/Referer check + sous-domaines | `csrf.ts` |
| 7 | IDOR | `verifyShopOwnership` partout | `shop-auth.ts` |
| 8 | Double-spend | Optimistic lock `Payout.version` + transaction | G3 |
| 9 | Type juggling | Zod stricts (positif, fini, max) | `validation.ts` |
| 10 | SQL injection | Prisma + regex phone par pays | `validation.ts` |

### Business (4)

| # | Vecteur | Mitigation | Fichier |
|---|---------|------------|---------|
| 11 | Balance manipulation | Calcul atomique transaction Prisma | `balance.ts` |
| 12 | Stale balance | `checkPayoutAllowed` dans transaction | `balance.ts` |
| 13 | Fee bypass | Commission 100% server-side | `commission.ts` |
| 14 | Refund abuse | Flag + manual review, no auto-debit | `refund-handler.ts` |

### Infrastructure (3)

| # | Vecteur | Mitigation | Fichier |
|---|---------|------------|---------|
| 15 | Credentials leak | `redactSecrets` + Sentry beforeSend | `redact.ts`, `sentry-filter.ts` |
| 16 | Timing attack HMAC | N/A (pas de HMAC actuellement) | `webhook.ts` |
| 17 | DoS webhook flood | Rate-limit + Nginx (à config après) | `rate-limit.ts` |

### Bonus

| # | Vecteur | Mitigation | Fichier |
|---|---------|------------|---------|
| 18 | Webhook perdu/zombie | Réconciliation périodique (cron) | `reconciliation.ts` |

## Variables d'environnement

```env
# Cartevo
CARTEVO_BASE_URL=https://api.cartevo.co/api/v1
CARTEVO_CLIENT_ID=<secret>
CARTEVO_CLIENT_KEY=<secret>
CARTEVO_WEBHOOK_SECRET=NOT_USED_NO_HMAC  # Pas de HMAC actuellement
CARTEVO_NOTIFY_URL=https://getsellia.com/api/webhooks/cartevo
CARTEVO_WEBHOOK_IPS=  # Vide tant que Cartevo ne fournit pas d'IPs

# Security
ALLOWED_ORIGINS=https://getsellia.com,https://www.getsellia.com
```

## Nginx rate limit (à ajouter sur VPS)

```nginx
limit_req_zone $binary_remote_addr zone=webhook:10m rate=20r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

server {
  location = /api/webhooks/cartevo {
    limit_req zone=webhook burst=50 nodelay;
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location ~ ^/api/dashboard/payouts {
    limit_req zone=api burst=10 nodelay;
    proxy_pass http://localhost:3000;
  }
}
```

## Audit log

- 2026-05-13 G1 : Foundation (lib + Prisma + auth cache)
- 2026-05-13 G1.5 : Security hardening Verify-on-Pull + 16 vecteurs
- TBD : Migrer vers HMAC quand Cartevo l'implémentera
- TBD : Activer IP whitelist quand Cartevo fournira les IPs
- TBD : Migrer rate-limit vers Upstash Redis si multi-instance
