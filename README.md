# BENJ. — Medical Couture

Site vitrine de luxe pour **BENJ. Medical Couture** : le calot de chirurgie réinventé en pièce de couture. Présentation de la **Collection Sahara** (édition limitée, 6 coloris léopard) dans un esprit maison de couture.

## Aperçu

- Page unique élégante, longue à défiler
- Palette sable / or / anthracite, typographie Bodoni Moda + Jost
- **Imprimés léopard générés en SVG** (aucune photo externe requise) — 6 coloris
- Animations de révélation au scroll, navigation collante, menu mobile
- Formulaire de contact / commande (validation côté client)
- Entièrement responsive et accessible (respecte `prefers-reduced-motion`)

## Structure

```
index.html            Page principale
assets/css/style.css  Feuille de style
assets/js/main.js     Léopards SVG, cartes collection, interactions
```

## Lancer en local

Aucune dépendance. Ouvrir `index.html`, ou servir le dossier :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Coloris de la collection

| # | Modèle | Coloris |
|---|--------|---------|
| 01 | Sahara | Léopard sable |
| 02 | Oasis | Léopard olive |
| 03 | Nuit Fauve | Léopard nocturne |
| 04 | Dune | Léopard doré |
| 05 | Terracotta | Léopard brun |
| 06 | Graphite | Léopard cendré |

## Personnaliser

- **Coloris & imprimés** : objet `COLORWAYS` dans `assets/js/main.js`
- **Modèles / textes** : tableau `MODELS` dans `assets/js/main.js`
- **Couleurs, typo, espacements** : variables `:root` dans `assets/css/style.css`
- **Email de contact** : dans la section `#commande` de `index.html`

*L'alliance du style et de l'exigence.*
