/* ============================================================
   BENJ. — Medical Couture · _products.js (catalogue côté serveur)
   ============================================================
   ⚠️ Copie volontairement séparée de assets/js/products.js.
   La fonction de paiement ne doit JAMAIS faire confiance au prix
   envoyé par le navigateur (facile à falsifier) — elle recalcule
   toujours le montant à partir de CETTE liste. Si vous changez un
   prix ou un modèle dans assets/js/products.js, reportez le même
   changement ici.
   ============================================================ */
module.exports = [
  { id: "sable", name: "Sahara Sable", price: 50 },
  { id: "olive", name: "Sahara Olive", price: 50 },
  { id: "nuit", name: "Sahara Nuit", price: 50 }
];
