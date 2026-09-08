# BENJ. — Medical Couture

Site vitrine de luxe pour **BENJ. Medical Couture** : le calot de chirurgie réinventé en pièce de couture. Présentation de la **Collection Sahara** (édition limitée) dans un esprit maison de couture, avec panier et commande en ligne.

## Aperçu

- Palette sable / or / anthracite, typographie Bodoni Moda + Jost
- Animations de révélation au scroll, navigation collante, menu mobile
- **Panier persistant** (localStorage) et **page de commande** avec paiement sécurisé Stripe
- Formulaire de contact pour les demandes particulières
- Entièrement responsive et accessible (respecte `prefers-reduced-motion`)

## Structure

```
index.html                Accueil — hero, collection, lookbook
maison.html                La Maison
contact.html                Contact / demandes particulières
panier.html                 Panier
commande.html                Commande — coordonnées + paiement
merci.html                   Confirmation après paiement

assets/css/style.css         Feuille de style
assets/js/products.js        Source unique des modèles (id, nom, prix…)
assets/js/cart.js            Panier (localStorage), badge nav
assets/js/checkout.js        Rendu panier/commande + lien de paiement Stripe
assets/js/main.js            Collection, lookbook, lightbox, interactions
```

## Lancer en local

Aucune dépendance. Ouvrir `index.html`, ou servir le dossier :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Coloris de la collection

| # | Modèle | Coloris | Prix |
|---|--------|---------|------|
| 01 | Sahara Sable | Léopard sable | 50 € |
| 02 | Sahara Olive | Léopard olive | 50 € |
| 03 | Sahara Nuit | Léopard nocturne | 50 € |

*Sahara Terracotta et Sahara Graphite ne sont plus proposés à la vente pour le moment (retirés du catalogue).*

## Personnaliser

- **Modèles, coloris, prix** : tableau `window.BENJ_PRODUCTS` dans `assets/js/products.js` — c'est la seule source à modifier, tout le site (fiches, panier, commande) se met à jour automatiquement. Pour réactiver un ancien modèle, il suffit de l'ajouter de nouveau à ce tableau (les photos `assets/img/<id>-*.jpg` existent déjà pour terracotta et graphite).
- **Couleurs, typo, espacements** : variables `:root` dans `assets/css/style.css`

---

## 💳 Configuration du paiement Stripe (à faire une seule fois)

Le site est hébergé sur GitHub Pages : c'est un site **statique**, sans serveur. On ne peut donc pas y stocker de clé secrète pour encaisser une carte directement. La solution retenue — utilisée par de nombreuses petites maisons — est un **lien de paiement Stripe** (« Payment Link ») : Stripe héberge la page de paiement, encaisse la carte en toute sécurité, et redirige le client vers `merci.html` une fois payé.

### 1. Créer le lien de paiement

1. Créez un compte sur [stripe.com](https://stripe.com) (gratuit, aucun engagement).
2. Dans le dashboard : **Paiements → Liens de paiement → Créer un lien de paiement**.
3. Ajoutez un produit : *« Calot de chirurgie — Collection Sahara »*, prix **50,00 €**.
4. Activez **« Le client peut ajuster la quantité »**.
5. Activez **« Collecter l'adresse de livraison du client »**.
6. Section **« Champs personnalisés »** : ajoutez un champ texte obligatoire, ex. *« Modèle(s) et coloris souhaités »* — le client y recopie le récapitulatif que notre page de commande lui prépare automatiquement (bouton « Copier le récapitulatif »).
7. Section **« Après le paiement »** : choisissez *« Rediriger les clients vers votre site »* et indiquez :
   `https://benjidhn.github.io/BENJ/merci.html`
8. Enregistrez, puis copiez l'URL du lien obtenu (ex. `https://buy.stripe.com/xxxxxxxx`).

### 2. Brancher le lien sur le site

Ouvrir `assets/js/checkout.js` et renseigner tout en haut du fichier :

```js
var STRIPE_PAYMENT_LINK = "https://buy.stripe.com/xxxxxxxx"; // votre lien
var OWNER_EMAIL = "votre-email@exemple.fr"; // reçoit les commandes tant que Stripe n'est pas branché
```

Tant que `STRIPE_PAYMENT_LINK` est vide, la page de commande affiche un message d'attente et propose d'envoyer le récapitulatif par email à la place — le site reste donc fonctionnel avant même que Stripe soit configuré.

### 3. Comment ça fonctionne pour le client

1. Il ajoute un ou plusieurs modèles au panier (`panier.html`).
2. Il renseigne ses coordonnées de livraison (`commande.html`).
3. Il est redirigé vers Stripe avec la quantité totale et son email pré-remplis ; il recopie le récapitulatif de commande dans le champ Stripe prévu à cet effet, ajuste si besoin, puis paie par carte.
4. Après paiement, Stripe le redirige vers `merci.html`.

⚠️ Le site ne peut pas vérifier automatiquement qu'un paiement a bien eu lieu (il n'y a pas de serveur) : c'est votre dashboard Stripe qui fait foi pour la préparation des commandes.

*L'alliance du style et de l'exigence.*
