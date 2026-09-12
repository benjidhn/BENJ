/* ============================================================
   BENJ. — Medical Couture · payment.js
   Page commande.html — livraison (notre propre formulaire) puis
   paiement par carte (Stripe Payment Element, habillé aux couleurs
   et à la police du site). Contrairement à l'Embedded Checkout,
   Stripe ne gère plus ici que la case carte bancaire elle-même —
   tout le reste de la page est du HTML/CSS maison.
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

  // Habillage du Payment Element aux couleurs et à la police du site
  // (variables --ink/--cream/--gold/--line du CSS principal).
  var APPEARANCE = {
    theme: "flat",
    variables: {
      colorPrimary: "#a5843f",
      colorBackground: "#f6f2ea",
      colorText: "#292319",
      colorTextSecondary: "#625a4b",
      colorDanger: "#a6542c",
      fontFamily: '"Jost", "Helvetica Neue", Arial, sans-serif',
      fontSizeBase: "16px",
      borderRadius: "1px",
      spacingUnit: "4px"
    },
    rules: {
      ".Label": {
        fontSize: ".66rem",
        letterSpacing: ".16em",
        textTransform: "uppercase",
        color: "#625a4b",
        marginBottom: ".5rem"
      },
      ".Input": {
        border: "1px solid rgba(41,35,25,.16)",
        boxShadow: "none",
        padding: "13px 14px"
      },
      ".Input:focus": {
        border: "1px solid #a5843f",
        boxShadow: "none"
      },
      ".Tab": {
        border: "1px solid rgba(41,35,25,.16)",
        boxShadow: "none"
      },
      ".Tab:hover": { border: "1px solid #292319" },
      ".Tab--selected": {
        border: "1px solid #292319",
        boxShadow: "none"
      }
    }
  };
  var STRIPE_FONTS = [{
    cssSrc: "https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap"
  }];

  var elements = null;
  var stripe = null;

  /* ================= RÉCAPITULATIF (étape 2) ================= */
  function renderRecap() {
    var root = document.getElementById("checkout-items");
    var totalEl = document.getElementById("checkout-total");
    var form = document.getElementById("shipping-form");
    if (!root) return;
    var lines = window.BENJ_Cart.lines();

    if (!lines.length) {
      root.innerHTML = '<p class="lede">Votre panier est vide.</p><a href="panier.html" class="link">Retour au panier</a>';
      if (totalEl) totalEl.textContent = fmt(0);
      if (form) form.hidden = true;
      return;
    }

    root.innerHTML = lines.map(function (l) {
      return '<div class="checkout-item">' +
        '<span class="checkout-item__name">' + l.qty + " × " + l.product.name + "</span>" +
        '<span class="checkout-item__price">' + fmt(l.lineTotal) + "</span>" +
      "</div>";
    }).join("");
    if (totalEl) totalEl.textContent = fmt(window.BENJ_Cart.total());
  }

  function renderPaymentSummary() {
    var el = document.getElementById("payment-summary");
    if (!el) return;
    var count = window.BENJ_Cart.count();
    el.innerHTML =
      '<div class="cart-aside__row cart-aside__row--total" style="border-top:0;padding-top:0;">' +
        "<span>Total à payer (" + count + (count > 1 ? " pièces" : " pièce") + ")</span>" +
        "<span>" + fmt(window.BENJ_Cart.total()) + "</span>" +
      "</div>";
  }

  function setSteps(paymentActive) {
    var recapStep = document.getElementById("step-recap");
    var payStep = document.getElementById("step-payment");
    if (recapStep) recapStep.classList.toggle("is-active", !paymentActive);
    if (recapStep) recapStep.classList.toggle("is-done", paymentActive);
    if (payStep) payStep.classList.toggle("is-active", paymentActive);
  }

  /* ================= ÉTAPE 2 → 3 : livraison puis carte ================= */
  function initShippingForm() {
    var form = document.getElementById("shipping-form");
    var errorBox = document.getElementById("shipping-error");
    var recapSection = document.getElementById("commande-recap");
    var paymentSection = document.getElementById("commande-paiement");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!window.BENJ_Cart.lines().length) return;

      if (!STRIPE_PUBLISHABLE_KEY || !window.Stripe) {
        errorBox.textContent = "Le paiement en ligne n'est pas encore configuré. Écrivez-nous directement à " + OWNER_EMAIL + " pour finaliser votre commande.";
        errorBox.className = "order__note";
        return;
      }

      var shipping = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        address: form.address.value.trim(),
        city: form.city.value.trim(),
        postal: form.postal.value.trim(),
        country: form.country.value,
        notes: form.notes ? form.notes.value.trim() : ""
      };
      var emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(shipping.email);
      if (!shipping.name || !emailOk || !shipping.address || !shipping.city || !shipping.postal) {
        errorBox.textContent = "Merci de renseigner tous les champs requis (nom, email valide, adresse complète).";
        errorBox.className = "order__note";
        return;
      }

      var submitBtn = document.getElementById("shipping-continue");
      submitBtn.disabled = true;
      submitBtn.textContent = "Préparation du paiement…";
      errorBox.textContent = "";

      var items = window.BENJ_Cart.lines().map(function (l) {
        return { id: l.product.id, qty: l.qty };
      });

      fetch("/.netlify/functions/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items, shipping: shipping })
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) throw new Error(data.error || "Impossible de préparer le paiement.");
            return data;
          });
        })
        .then(function (data) {
          stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
          elements = stripe.elements({ clientSecret: data.clientSecret, appearance: APPEARANCE, fonts: STRIPE_FONTS });
          var paymentElement = elements.create("payment");
          var mountPoint = document.getElementById("payment-element");
          mountPoint.innerHTML = ""; // conteneur vide requis avant montage
          paymentElement.mount("#payment-element");
          paymentElement.on("ready", function () {
            var payBtn = document.getElementById("payment-submit");
            if (payBtn) payBtn.disabled = false;
          });

          renderPaymentSummary();
          recapSection.hidden = true;
          paymentSection.hidden = false;
          setSteps(true);
          paymentSection.scrollIntoView({ behavior: "smooth", block: "start" });
        })
        .catch(function (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Continuer vers le paiement";
          errorBox.textContent = err.message || "Une erreur est survenue. Merci de réessayer, ou écrivez-nous à " + OWNER_EMAIL + ".";
          errorBox.className = "order__note";
        });
    });
  }

  /* ================= ÉTAPE 3 : confirmer le paiement ================= */
  function initPaymentForm() {
    var form = document.getElementById("payment-form");
    if (!form) return;
    var errorBox = document.getElementById("payment-error");
    var submitBtn = document.getElementById("payment-submit");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!stripe || !elements) return;

      submitBtn.disabled = true;
      submitBtn.textContent = "Paiement en cours…";
      errorBox.textContent = "";

      var returnUrl = window.location.origin + "/merci.html";

      stripe.confirmPayment({
        elements: elements,
        confirmParams: { return_url: returnUrl },
        redirect: "if_required"
      }).then(function (result) {
        if (result.error) {
          errorBox.textContent = result.error.message || "Le paiement n'a pas pu être validé. Vérifiez vos informations et réessayez.";
          errorBox.className = "order__note";
          submitBtn.disabled = false;
          submitBtn.textContent = "Payer";
          return;
        }
        // Paiement validé sans redirection nécessaire (pas d'authentification
        // supplémentaire demandée par la banque) : on file vers la confirmation.
        var pi = result.paymentIntent;
        window.location.href = returnUrl + (pi ? "?payment_intent=" + encodeURIComponent(pi.id) : "");
      });
    });
  }

  /* ================= MERCI (merci.html) ================= */
  function initMerci() {
    var box = document.getElementById("merci-ref");
    if (!box) return;
    var ref = new URLSearchParams(location.search).get("payment_intent");
    if (ref) box.textContent = ref;
    window.BENJ_Cart.clear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderRecap();
    initShippingForm();
    initPaymentForm();
    initMerci();
    document.addEventListener("benj:cart-change", renderRecap);
  });
})();
