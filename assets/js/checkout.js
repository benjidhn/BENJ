/* ============================================================
   BENJ. — Medical Couture · checkout.js
   Page panier (panier.html) + page commande (commande.html).
   ============================================================

   ⚠️  CONFIGURATION REQUISE — voir README.md « Paiement Stripe »
   Un lien de paiement Stripe dédié par modèle : le client n'a
   jamais à re-préciser quel coloris il a choisi, Stripe le sait
   déjà via le produit. Tant qu'un modèle n'a pas de lien, le site
   utilise STRIPE_MIXED_CART_LINK à sa place (avec son champ
   personnalisé, seul cas où le coloris doit être reprécisé).
   ------------------------------------------------------------ */
var STRIPE_PAYMENT_LINKS = {
  // ⚠️ liens de TEST — à remplacer par les liens du compte de production avant un vrai lancement
  sable: "https://buy.stripe.com/test_fZu5kF1N1cQR5cA1wx9bO00",
  olive: "https://buy.stripe.com/test_fZucN7dvJ8ABbAY0st9bO01",
  nuit:  "https://buy.stripe.com/test_fZu3cxgHV0458oM4IJ9bO02"
};
// Repli pour une commande qui mélangerait plusieurs coloris : le seul cas
// où l'on redemande encore le détail, via le champ personnalisé du lien.
var STRIPE_MIXED_CART_LINK = STRIPE_PAYMENT_LINKS.sable;
var OWNER_EMAIL = "benji.dhn@gmail.com";

(function () {
  "use strict";

  function fmt(n) { return window.BENJ_formatPrice ? window.BENJ_formatPrice(n) : n + " €"; }
  function el(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }

  /* ================= PANIER (panier.html) ================= */
  function renderCart() {
    var root = document.getElementById("cart-root");
    if (!root) return;
    var lines = window.BENJ_Cart.lines();

    if (!lines.length) {
      root.innerHTML =
        '<div class="cart-empty reveal in">' +
          '<p class="lede">Votre panier est vide pour le moment.</p>' +
          '<a href="index.html#collection" class="btn btn--dark">Découvrir la collection</a>' +
        "</div>";
      var summary = document.getElementById("cart-summary");
      if (summary) summary.hidden = true;
      return;
    }

    var IMG = "assets/img/";
    root.innerHTML = "";
    lines.forEach(function (line) {
      var p = line.product;
      var row = el(
        '<div class="cart-row reveal in" data-id="' + p.id + '">' +
          '<div class="cart-row__visual"><img src="' + IMG + p.id + '.jpg" alt="Calot ' + p.name + '" loading="lazy" /></div>' +
          '<div class="cart-row__body">' +
            '<p class="cart-row__hue">' + p.hue + "</p>" +
            '<h3 class="cart-row__name">' + p.name + "</h3>" +
            '<p class="cart-row__unit">' + fmt(p.price) + " / pièce</p>" +
          "</div>" +
          '<div class="cart-row__qty">' +
            '<button type="button" class="qty__btn" data-act="dec" aria-label="Retirer une unité">&minus;</button>' +
            '<input type="text" inputmode="numeric" class="qty__val" value="' + line.qty + '" aria-label="Quantité — ' + p.name + '" />' +
            '<button type="button" class="qty__btn" data-act="inc" aria-label="Ajouter une unité">+</button>' +
          "</div>" +
          '<p class="cart-row__total">' + fmt(line.lineTotal) + "</p>" +
          '<button type="button" class="cart-row__remove" aria-label="Retirer ' + p.name + ' du panier">&times;</button>' +
        "</div>"
      );
      root.appendChild(row);
    });

    root.querySelectorAll(".cart-row").forEach(function (row) {
      var id = row.getAttribute("data-id");
      var input = row.querySelector(".qty__val");
      row.querySelector('[data-act="inc"]').addEventListener("click", function () {
        window.BENJ_Cart.setQty(id, parseInt(input.value, 10) + 1);
      });
      row.querySelector('[data-act="dec"]').addEventListener("click", function () {
        window.BENJ_Cart.setQty(id, parseInt(input.value, 10) - 1);
      });
      input.addEventListener("change", function () {
        window.BENJ_Cart.setQty(id, input.value);
      });
      row.querySelector(".cart-row__remove").addEventListener("click", function () {
        window.BENJ_Cart.remove(id);
      });
    });

    renderSummary();
  }

  function renderSummary() {
    var summary = document.getElementById("cart-summary");
    if (!summary) return;
    var lines = window.BENJ_Cart.lines();
    summary.hidden = lines.length === 0;
    var count = window.BENJ_Cart.count();
    var total = window.BENJ_Cart.total();
    var countEl = document.getElementById("cart-count-label");
    var totalEl = document.getElementById("cart-total");
    if (countEl) countEl.textContent = count + (count > 1 ? " pièces" : " pièce");
    if (totalEl) totalEl.textContent = fmt(total);
  }

  /* ================= COMMANDE (commande.html) ================= */
  function orderRecapText(data) {
    var lines = window.BENJ_Cart.lines();
    var items = lines.map(function (l) {
      return "· " + l.qty + " × " + l.product.name + " (" + l.product.hue + ") — " + fmt(l.lineTotal);
    }).join("\n");
    return (
      "Commande BENJ. Medical Couture\n" +
      "Référence : " + data.ref + "\n\n" +
      items + "\n\n" +
      "Total : " + fmt(window.BENJ_Cart.total()) + "\n\n" +
      "Livraison à :\n" +
      data.name + "\n" +
      data.address + "\n" +
      data.postal + " " + data.city + ", " + data.country + "\n" +
      "Tél. " + data.phone + "\n" +
      "Email : " + data.email +
      (data.notes ? "\n\nNote : " + data.notes : "")
    );
  }

  function makeRef() {
    return "BENJ-" + Date.now().toString(36).toUpperCase();
  }

  function renderCheckoutSummary() {
    var root = document.getElementById("checkout-items");
    var totalEl = document.getElementById("checkout-total");
    var form = document.getElementById("checkout-form");
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

  // Un seul modèle dans le panier ? Son lien dédié sait déjà lequel —
  // rien à repréciser. Plusieurs modèles différents : repli sur le lien
  // générique, seul cas où le champ personnalisé reste utile.
  function resolvePaymentLink() {
    var lines = window.BENJ_Cart.lines();
    if (lines.length === 1) {
      var dedicated = STRIPE_PAYMENT_LINKS[lines[0].product.id];
      if (dedicated) return { url: dedicated, needsModelField: false };
    }
    return { url: STRIPE_MIXED_CART_LINK, needsModelField: true };
  }

  function buildStripeUrl(link, data) {
    var params = new URLSearchParams();
    params.set("client_reference_id", data.ref);
    if (data.email) params.set("prefilled_email", data.email);
    var qty = window.BENJ_Cart.count();
    if (qty) params.set("quantity", String(qty));
    var sep = link.indexOf("?") > -1 ? "&" : "?";
    return link + sep + params.toString();
  }

  function initCheckoutForm() {
    var form = document.getElementById("checkout-form");
    if (!form) return;
    var note = document.getElementById("checkout-note");
    var recapBox = document.getElementById("checkout-recap");
    var recapText = document.getElementById("checkout-recap-text");
    var copyBtn = document.getElementById("checkout-copy");
    var continueBtn = document.getElementById("checkout-continue");

    if (!window.BENJ_Cart.lines().length) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        address: form.address.value.trim(),
        city: form.city.value.trim(),
        postal: form.postal.value.trim(),
        country: form.country.value.trim(),
        notes: form.notes ? form.notes.value.trim() : "",
        ref: makeRef()
      };
      var emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email);
      if (!data.name || !emailOk || !data.address || !data.city || !data.postal) {
        note.textContent = "Merci de renseigner tous les champs requis (nom, email valide, adresse complète).";
        note.className = "order__note";
        return;
      }

      var recap = orderRecapText(data);
      try {
        window.localStorage.setItem("benj_last_order", JSON.stringify({ ref: data.ref, recap: recap, email: data.email }));
      } catch (err) {}

      var resolved = resolvePaymentLink();

      if (!resolved.url) {
        if (recapBox) { recapBox.hidden = false; recapText.value = recap; }
        note.textContent = "Le paiement en ligne sera activé très prochainement. En attendant, votre récapitulatif est prêt ci-dessous : copiez-le et envoyez-le nous, ou écrivez-nous directement.";
        note.className = "order__note ok";
        var mailBtn = document.getElementById("checkout-mail");
        if (mailBtn) {
          mailBtn.hidden = false;
          mailBtn.href = "mailto:" + OWNER_EMAIL + "?subject=" + encodeURIComponent("Commande " + data.ref + " — BENJ.") + "&body=" + encodeURIComponent(recap);
        }
        return;
      }

      if (!resolved.needsModelField) {
        // Un seul modèle : Stripe le connaît déjà via le lien dédié,
        // rien à recopier — direction le paiement immédiatement.
        window.location.href = buildStripeUrl(resolved.url, data);
        return;
      }

      // Plusieurs coloris différents dans la commande : cas rare où le
      // lien générique doit encore recevoir le détail. On ne redirige
      // qu'après que le client a pu copier le récapitulatif.
      if (recapBox) { recapBox.hidden = false; recapText.value = recap; }
      note.textContent = "Votre commande combine plusieurs coloris : copiez le récapitulatif ci-dessous, puis collez-le dans le champ dédié sur la page de paiement.";
      note.className = "order__note ok";
      if (continueBtn) {
        continueBtn.hidden = false;
        continueBtn.onclick = function (ev) {
          ev.preventDefault();
          window.location.href = buildStripeUrl(resolved.url, data);
        };
      }
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        recapText.select();
        var ok = false;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(recapText.value);
            ok = true;
          } else {
            ok = document.execCommand("copy");
          }
        } catch (e) {}
        copyBtn.textContent = ok ? "Copié ✓" : "Copier";
        setTimeout(function () { copyBtn.textContent = "Copier le récapitulatif"; }, 2200);
      });
    }
  }

  /* ================= MERCI (merci.html) ================= */
  function initMerci() {
    var box = document.getElementById("merci-ref");
    if (!box) return;
    try {
      var raw = window.localStorage.getItem("benj_last_order");
      var order = raw ? JSON.parse(raw) : null;
      if (order && order.ref) box.textContent = order.ref;
    } catch (e) {}
    window.BENJ_Cart.clear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderCart();
    renderCheckoutSummary();
    initCheckoutForm();
    initMerci();
    document.addEventListener("benj:cart-change", function () {
      renderCart();
      renderCheckoutSummary();
    });
  });
})();
