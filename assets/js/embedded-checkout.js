/* ============================================================
   BENJ. — Medical Couture · embedded-checkout.js
   Page commande.html — récapitulatif puis paiement Stripe intégré
   (Embedded Checkout : carte + adresse de livraison directement
   sur cette page, aucune redirection vers un site externe).
   ============================================================

   ⚠️  CONFIGURATION REQUISE
   Renseignez votre clé PUBLIABLE Stripe ci-dessous (celle qui
   commence par pk_… — elle est faite pour être visible dans le
   code du site, contrairement à la clé secrète qui, elle, ne vit
   que côté serveur, dans les variables d'environnement Netlify).
   ------------------------------------------------------------ */
var STRIPE_PUBLISHABLE_KEY = "pk_test_51UDSXYRp4H3HB4DwW7GjM06qyKsIm1go8WFM506Yb2YZuUDymMIiCbbERBdXhidw2lCBbjdl4hKiQeL8v1siQY3F00VHwE1ICd"; // ⚠️ clé de TEST — à remplacer par la clé pk_live_... du compte de production avant un vrai lancement
var OWNER_EMAIL = "benji.dhn@gmail.com";

(function () {
  "use strict";

  function fmt(n) { return window.BENJ_formatPrice ? window.BENJ_formatPrice(n) : n + " €"; }

  function renderRecap() {
    var root = document.getElementById("checkout-items");
    var totalEl = document.getElementById("checkout-total");
    var startBtn = document.getElementById("checkout-start");
    if (!root) return;
    var lines = window.BENJ_Cart.lines();

    if (!lines.length) {
      root.innerHTML = '<p class="lede">Votre panier est vide.</p><a href="panier.html" class="link">Retour au panier</a>';
      if (totalEl) totalEl.textContent = fmt(0);
      if (startBtn) startBtn.hidden = true;
      return;
    }

    root.innerHTML = lines.map(function (l) {
      return '<div class="checkout-item">' +
        '<span class="checkout-item__name">' + l.qty + " × " + l.product.name + "</span>" +
        '<span class="checkout-item__price">' + fmt(l.lineTotal) + "</span>" +
      "</div>";
    }).join("");
    if (totalEl) totalEl.textContent = fmt(window.BENJ_Cart.total());
    if (startBtn) startBtn.hidden = false;
  }

  function setSteps(paymentActive) {
    var recapStep = document.getElementById("step-recap");
    var payStep = document.getElementById("step-payment");
    if (recapStep) recapStep.classList.toggle("is-active", !paymentActive);
    if (recapStep) recapStep.classList.toggle("is-done", paymentActive);
    if (payStep) payStep.classList.toggle("is-active", paymentActive);
  }

  function initCheckoutFlow() {
    var startBtn = document.getElementById("checkout-start");
    var errorBox = document.getElementById("checkout-error");
    var recapSection = document.getElementById("commande-recap");
    var paymentSection = document.getElementById("commande-paiement");
    var embedNote = document.getElementById("checkout-embed-note");
    if (!startBtn) return;

    startBtn.addEventListener("click", function () {
      if (!window.BENJ_Cart.lines().length) return;

      if (!STRIPE_PUBLISHABLE_KEY || !window.Stripe) {
        errorBox.textContent = "Le paiement en ligne n'est pas encore configuré. Écrivez-nous directement à " + OWNER_EMAIL + " pour finaliser votre commande.";
        errorBox.className = "order__note";
        return;
      }

      startBtn.disabled = true;
      startBtn.textContent = "Préparation du paiement…";
      errorBox.textContent = "";

      var items = window.BENJ_Cart.lines().map(function (l) {
        return { id: l.product.id, qty: l.qty };
      });

      fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items })
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) throw new Error(data.error || "Impossible de préparer le paiement.");
            return data;
          });
        })
        .then(function (data) {
          var stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
          return stripe.initEmbeddedCheckout({ clientSecret: data.clientSecret });
        })
        .then(function (checkout) {
          // On ne bascule vers l'écran de paiement qu'une fois Stripe
          // prêt — si une erreur survient avant ce point, elle reste
          // visible sur le récapitulatif (voir le .catch ci-dessous),
          // jamais cachée derrière un écran resté vide.
          recapSection.hidden = true;
          paymentSection.hidden = false;
          setSteps(true);
          paymentSection.scrollIntoView({ behavior: "smooth", block: "start" });
          checkout.mount("#checkout-embed");

          // Filet de sécurité : si l'iframe Stripe n'apparaît toujours
          // pas après quelques secondes (bloqueur de publicités/
          // traqueurs le plus souvent), on le signale au lieu de
          // laisser « Chargement… » tourner indéfiniment sans rien dire.
          setTimeout(function () {
            var loaded = document.querySelector("#checkout-embed iframe");
            if (!loaded && embedNote) {
              embedNote.textContent = "Le paiement met du temps à s'afficher. Si rien n'apparaît, désactivez votre bloqueur de publicités/traqueurs pour ce site, ou réessayez dans un autre navigateur. Vous pouvez aussi nous écrire directement à " + OWNER_EMAIL + ".";
              embedNote.className = "order__note";
            }
          }, 7000);
        })
        .catch(function (err) {
          // Toujours revenir sur un état visible et compréhensible,
          // quel que soit le moment où l'échec s'est produit.
          recapSection.hidden = false;
          paymentSection.hidden = true;
          setSteps(false);
          startBtn.disabled = false;
          startBtn.textContent = "Procéder au paiement sécurisé";
          errorBox.textContent = err.message || "Une erreur est survenue. Merci de réessayer, ou écrivez-nous à " + OWNER_EMAIL + ".";
          errorBox.className = "order__note";
        });
    });
  }

  /* ================= MERCI (merci.html) ================= */
  function initMerci() {
    var box = document.getElementById("merci-ref");
    if (!box) return;
    var sessionId = new URLSearchParams(location.search).get("session_id");
    if (sessionId) box.textContent = sessionId;
    window.BENJ_Cart.clear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderRecap();
    initCheckoutFlow();
    initMerci();
    document.addEventListener("benj:cart-change", renderRecap);
  });
})();
