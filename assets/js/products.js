/* ============================================================
   BENJ. — Medical Couture · products.js
   Source unique des modèles — utilisée par main.js, cart.js et
   checkout.js. Modifier ici pour ajouter/retirer/actualiser un
   modèle : le reste du site se met à jour automatiquement.
   ============================================================ */
(function () {
  "use strict";

  window.BENJ_CURRENCY = "€";

  // Fiche produit — informations communes à toute la collection
  window.BENJ_EDITION = "Édition limitée à 150 exemplaires par coloris — numérotée à la main par l'atelier avant expédition.";
  window.BENJ_MATERIAL = "65 % coton, 35 % polyester. Impression léopard exclusive, doublure intérieure teintée, plaque métallique dorée cousue main.";
  window.BENJ_CARE = "Lavage en machine à 60°C (cycle médical), sans adoucissant. Repassage doux sur l'envers. Ne pas javelliser.";

  window.BENJ_PRODUCTS = [
    { id:"sable", num:"01", name:"Sahara Sable", hue:"Léopard sable",
      words:"Élégant. Intemporel. Iconique.", price:50,
      desc:"Le coloris fondateur. Un léopard sable sur bandeau crème, rehaussé d'une doublure orange brûlé et de la plaque dorée BENJ. La pièce iconique de la maison." },
    { id:"olive", num:"02", name:"Sahara Olive", hue:"Léopard olive",
      words:"Naturel. Profond. Raffiné.", price:50,
      desc:"Un vert olive profond qui enveloppe le léopard d'une aura naturelle et raffinée. Pour une allure organique et distinguée." },
    { id:"nuit", num:"03", name:"Sahara Nuit", hue:"Léopard nocturne",
      words:"Discret. Puissant. Sophistiqué.", price:50,
      desc:"Le noir absolu, tendu sur un léopard nocturne. La sophistication à l'état pur — discret, puissant, intemporel." }
  ];

  window.BENJ_findProduct = function (id) {
    for (var i = 0; i < window.BENJ_PRODUCTS.length; i++) {
      if (window.BENJ_PRODUCTS[i].id === id) return window.BENJ_PRODUCTS[i];
    }
    return null;
  };

  window.BENJ_formatPrice = function (n) {
    return n.toFixed(2).replace(/\.00$/, "") + " " + window.BENJ_CURRENCY;
  };
})();
