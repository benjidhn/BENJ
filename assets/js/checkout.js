/* ============================================================
   BENJ. — Medical Couture · checkout.js
   Page panier (panier.html). Le paiement lui-même (page
   commande.html) est géré par embedded-checkout.js — voir ce
   fichier pour la configuration Stripe.
   ============================================================ */
(function () {
  "use strict";

  function fmt(n) { return window.BENJ_formatPrice ? window.BENJ_formatPrice(n) : n + " €"; }
  function el(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }

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

  document.addEventListener("DOMContentLoaded", function () {
    renderCart();
    document.addEventListener("benj:cart-change", renderCart);
  });
})();
