# BENJ. — Medical Couture

Site vitrine de luxe pour **BENJ. Medical Couture** : le calot de chirurgie réinventé en pièce de couture. Présentation de la **Collection Sahara** (édition limitée) dans un esprit maison de couture, avec panier et paiement intégré.

## Aperçu

- Palette sable / or / anthracite, typographie Bodoni Moda + Jost
- Animations de révélation au scroll, navigation collante, menu mobile
- **Panier persistant** (localStorage) et **paiement Stripe intégré** (Embedded Checkout — carte et adresse directement sur le site, aucune redirection)
- Formulaire de contact pour les demandes particulières
- Entièrement responsive et accessible (respecte `prefers-reduced-motion`)

## Structure

```
index.html                    Accueil — hero, collection, lookbook
maison.html                    La Maison
contact.html                   Contact / demandes particulières
panier.html                    Panier
commande.html                  Commande — récapitulatif + paiement intégré
merci.html                     Confirmation après paiement

assets/css/style.css           Feuille de style
assets/js/products.js          Source unique des modèles (id, nom, prix…)
assets/js/cart.js              Panier (localStorage), badge nav
assets/js/checkout.js          Rendu du panier (panier.html)
assets/js/embedded-checkout.js Paiement intégré (commande.html + merci.html)
assets/js/main.js              Collection, lookbook, lightbox, interactions

netlify/functions/
  create-checkout-session.js   Fonction serveur : crée la session Stripe
  _products.js                 Catalogue serveur (prix de référence, anti-triche)

netlify.toml                   Configuration Netlify
package.json                   Dépendance de la fonction serveur (stripe)
```

## Lancer en local

Le site (pages + styles + JS) n'a besoin d'aucune dépendance :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

⚠️ Le paiement (page `commande.html`) a besoin de la fonction serveur, qui ne tourne que sur Netlify (ou via `netlify dev` en local, avec Netlify CLI). Sans elle, le bouton de paiement affiche un message d'attente.

## Coloris de la collection

| # | Modèle | Coloris | Prix |
|---|--------|---------|------|
| 01 | Sahara Sable | Léopard sable | 50 € |
| 02 | Sahara Olive | Léopard olive | 50 € |
| 03 | Sahara Nuit | Léopard nocturne | 50 € |

*Sahara Terracotta et Sahara Graphite ne sont plus proposés à la vente pour le moment (retirés du catalogue).*

## Personnaliser

- **Modèles, coloris, prix** : tableau `window.BENJ_PRODUCTS` dans `assets/js/products.js` — pensez à reporter le même changement dans `netlify/functions/_products.js` (le prix facturé vient toujours de ce second fichier, jamais de ce qu'envoie le navigateur).
- **Couleurs, typo, espacements** : variables `:root` dans `assets/css/style.css`

---

## 💳 Paiement intégré — Stripe Embedded Checkout + Netlify

Le paiement se fait **directement sur le site** (carte bancaire + adresse de livraison dans une zone intégrée à la page, jamais de redirection vers un site externe). Techniquement, cela demande un petit bout de code serveur pour créer la session de paiement avec la clé secrète Stripe — une clé secrète ne doit jamais apparaître dans le code d'un site, donc ce calcul ne peut pas se faire dans le navigateur ni sur un hébergement purement statique comme GitHub Pages. C'est pour ça que le site est hébergé sur **Netlify** (gratuit), qui sait exécuter cette fonction serveur tout en servant les mêmes fichiers qu'avant.

### 1. Créer le site sur Netlify

1. Créez un compte sur [netlify.com](https://netlify.com) (gratuit).
2. **Add new site → Import an existing project** → connectez votre compte GitHub → choisissez le dépôt `BENJ`.
3. Laissez les réglages de build par défaut (le fichier `netlify.toml` du dépôt les configure déjà : pas de commande de build, dossier publié = racine, fonctions = `netlify/functions`).
4. Déployez. Vous obtenez une adresse du type `https://un-nom-au-hasard.netlify.app` (personnalisable dans les réglages du site, ou reliable à un nom de domaine que vous possédez).

### 2. Renseigner la clé secrète Stripe

1. Sur Netlify : **Site settings → Environment variables → Add a variable**.
2. Nom : `STRIPE_SECRET_KEY` — valeur : votre clé secrète Stripe (`sk_test_...` pour tester, `sk_live_...` pour de vrais paiements).
3. Redéployez le site (Netlify le fait généralement automatiquement après l'ajout d'une variable).

⚠️ Cette clé ne doit **jamais** être collée dans un fichier du dépôt — uniquement ici, dans les réglages Netlify.

### 3. Renseigner la clé publiable Stripe (sans risque, elle est faite pour être publique)

Ouvrir `assets/js/embedded-checkout.js` et renseigner tout en haut du fichier :

```js
var STRIPE_PUBLISHABLE_KEY = "pk_test_..."; // votre clé publiable Stripe
```

### 4. Comment ça fonctionne pour le client

1. Il compose son panier (`panier.html`), peu importe le mélange de modèles.
2. Il vérifie son récapitulatif sur `commande.html` et clique sur « Procéder au paiement sécurisé ».
3. Le site demande à la fonction serveur de préparer le paiement (le prix vient toujours du catalogue serveur, jamais du navigateur), puis affiche le paiement Stripe **directement dans la page** : adresse de livraison et carte bancaire, sans quitter le site.
4. Une fois payé, il est redirigé vers `merci.html`.

### Mode test → mode production

Tant que `STRIPE_SECRET_KEY` (Netlify) et `STRIPE_PUBLISHABLE_KEY` (dans le code) sont vos clés **test** (`sk_test_`/`pk_test_`), aucun vrai paiement n'a lieu — utilisez une carte de test comme `4242 4242 4242 4242`. Le jour où vous êtes prêt à vendre pour de vrai : activez votre compte Stripe (infos bancaires/société), remplacez les deux clés par leurs équivalents `sk_live_`/`pk_live_`, et c'est tout — le reste du code ne change pas.

*L'alliance du style et de l'exigence.*
