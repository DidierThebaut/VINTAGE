# VINTAGE
Essai de site E-commerce maillots de foot vintage

## Développement local

1. Copier `.env.example` vers `.env.local`.
2. Renseigner l’URL et la clé publishable Supabase ainsi que les variables Stripe.
3. Installer les dépendances avec `npm install`.
4. Lancer `npm run dev`.

Ne jamais publier `.env.local` ni la clé secrète Stripe.

## Hébergement

Ce projet utilise le rendu serveur Next.js, `proxy.ts` pour les sessions Supabase et une route serveur `/api/checkout` qui a besoin de `STRIPE_SECRET_KEY`. GitHub Pages ne peut héberger que des fichiers statiques et ne peut donc pas exécuter ces fonctionnalités. Le dépôt peut être hébergé sur GitHub, mais le site doit être déployé sur une plateforme compatible avec Next.js, par exemple Vercel ou un serveur Node.js.
