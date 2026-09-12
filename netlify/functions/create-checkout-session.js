/* ============================================================
   BENJ. — Medical Couture · create-checkout-session.js
   Fonction serveur Netlify — crée une session Stripe Embedded
   Checkout pour le panier reçu. Tourne uniquement côté serveur :
   c'est le seul endroit où la clé secrète Stripe est utilisée.
   ============================================================
   Configuration requise sur Netlify (Site settings → Environment
   variables) : STRIPE_SECRET_KEY = sk_test_... (ou sk_live_... en
   production). Ne JAMAIS mettre cette clé dans le code du dépôt.
   ============================================================ */
const Stripe = require("stripe");
const PRODUCTS = require("./_products.js");

const MAX_QTY_PER_LINE = 20;
const ALLOWED_COUNTRIES = ["FR", "BE", "CH", "LU", "MC", "DE", "ES", "IT", "GB"];

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

    if (!items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: "Le panier est vide." }) };
    }

    // Le prix et le nom viennent TOUJOURS de notre catalogue serveur,
    // jamais de ce que le navigateur a pu envoyer.
    var line_items = items.map(function (item) {
      var product = PRODUCTS.filter(function (p) { return p.id === item.id; })[0];
      if (!product) throw new Error("Modèle inconnu : " + item.id);
      var qty = Math.max(1, Math.min(MAX_QTY_PER_LINE, parseInt(item.qty, 10) || 1));
      return {
        quantity: qty,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(product.price * 100),
          product_data: {
            name: product.name + " — BENJ. Medical Couture",
            metadata: { product_id: product.id }
          }
        }
      };
    });

    var origin = event.headers.origin ||
      (event.headers.host ? "https://" + event.headers.host : null);
    if (!origin) throw new Error("Origine de la requête introuvable.");

    var session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items: line_items,
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ALLOWED_COUNTRIES },
      return_url: origin + "/merci.html?session_id={CHECKOUT_SESSION_ID}"
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientSecret: session.client_secret })
    };
  } catch (err) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message || "Erreur lors de la création du paiement." })
    };
  }
};
