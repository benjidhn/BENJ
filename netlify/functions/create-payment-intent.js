/* ============================================================
   BENJ. — Medical Couture · create-payment-intent.js
   Fonction serveur Netlify — crée un PaymentIntent Stripe pour le
   panier reçu. Utilisée avec le Payment Element (assets/js/payment.js),
   habillé aux couleurs du site : contrairement à l'Embedded Checkout,
   c'est notre propre page qui affiche récapitulatif, adresse de
   livraison et bouton — Stripe ne gère que la saisie de la carte,
   invisible dans une iframe stylée à l'identique du reste du site.
   ============================================================
   Configuration requise sur Netlify (Site settings → Environment
   variables) : STRIPE_SECRET_KEY = sk_test_... (ou sk_live_... en
   production). Ne JAMAIS mettre cette clé dans le code du dépôt.
   ============================================================ */
const Stripe = require("stripe");
const PRODUCTS = require("./_products.js");

const MAX_QTY_PER_LINE = 20;
const COUNTRY_CODES = ["FR", "BE", "CH", "LU", "MC", "DE", "ES", "IT", "GB"];

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Méthode non autorisée." }) };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Paiement non configuré : STRIPE_SECRET_KEY est absente des variables d'environnement Netlify." })
    };
  }

  var stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    var payload = JSON.parse(event.body || "{}");
    var items = Array.isArray(payload.items) ? payload.items : [];
    var shipping = payload.shipping || {};

    if (!items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: "Le panier est vide." }) };
    }
    if (!shipping.name || !shipping.email || !shipping.address || !shipping.city || !shipping.postal) {
      return { statusCode: 400, body: JSON.stringify({ error: "Coordonnées de livraison incomplètes." }) };
    }

    // Le montant vient TOUJOURS de notre catalogue serveur, jamais de
    // ce que le navigateur a pu envoyer — impossible à falsifier.
    var amount = 0;
    var descriptionParts = [];
    items.forEach(function (item) {
      var product = PRODUCTS.filter(function (p) { return p.id === item.id; })[0];
      if (!product) throw new Error("Modèle inconnu : " + item.id);
      var qty = Math.max(1, Math.min(MAX_QTY_PER_LINE, parseInt(item.qty, 10) || 1));
      amount += Math.round(product.price * 100) * qty;
      descriptionParts.push(qty + "× " + product.name);
    });

    var country = COUNTRY_CODES.indexOf(shipping.country) > -1 ? shipping.country : "FR";

    var intent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      description: descriptionParts.join(", ") + " — BENJ. Medical Couture",
      receipt_email: shipping.email,
      shipping: {
        name: shipping.name,
        phone: shipping.phone || undefined,
        address: {
          line1: shipping.address,
          city: shipping.city,
          postal_code: shipping.postal,
          country: country
        }
      },
      metadata: { note: (shipping.notes || "").slice(0, 480) }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientSecret: intent.client_secret })
    };
  } catch (err) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message || "Erreur lors de la création du paiement." })
    };
  }
};
