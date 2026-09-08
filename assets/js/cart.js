/* ============================================================
   BENJ. — Medical Couture · cart.js
   Panier client (localStorage) — partagé par toutes les pages.
   ============================================================ */
(function () {
  "use strict";

  var KEY = "benj_cart_v1";

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      var data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  }
  function write(items) {
    try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
    updateBadges();
    document.dispatchEvent(new CustomEvent("benj:cart-change"));
  }

  function add(id, qty) {
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var items = read();
    var found = null;
    for (var i = 0; i < items.length; i++) { if (items[i].id === id) { found = items[i]; break; } }
    if (found) { found.qty += qty; } else { items.push({ id: id, qty: qty }); }
    write(items);
  }
  function setQty(id, qty) {
    qty = parseInt(qty, 10) || 0;
    var items = read();
    if (qty <= 0) { items = items.filter(function (it) { return it.id !== id; }); }
    else { items.forEach(function (it) { if (it.id === id) it.qty = qty; }); }
    write(items);
  }
  function remove(id) { setQty(id, 0); }
  function clear() { write([]); }

  // Lignes de panier jointes aux produits — ignore silencieusement
  // les identifiants de modèles retirés du catalogue.
  function lines() {
    var products = window.BENJ_PRODUCTS || [];
    var out = [];
    read().forEach(function (it) {
      var p = null;
      for (var i = 0; i < products.length; i++) { if (products[i].id === it.id) { p = products[i]; break; } }
      if (!p) return;
      out.push({ product: p, qty: it.qty, lineTotal: p.price * it.qty });
    });
    return out;
  }
  function count() { var n = 0; lines().forEach(function (l) { n += l.qty; }); return n; }
  function total() { var t = 0; lines().forEach(function (l) { t += l.lineTotal; }); return t; }

  function updateBadges() {
    var n = count();
    document.querySelectorAll(".nav__cart-count").forEach(function (b) {
      b.textContent = String(n);
      b.hidden = n === 0;
    });
    document.querySelectorAll(".nav__cart").forEach(function (a) {
      a.classList.toggle("has-items", n > 0);
    });
  }

  window.BENJ_Cart = {
    lines: lines, add: add, setQty: setQty, remove: remove, clear: clear,
    count: count, total: total, updateBadges: updateBadges
  };

  document.addEventListener("DOMContentLoaded", updateBadges);
})();
