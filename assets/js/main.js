/* ============================================================
   BENJ. — Medical Couture · main.js
   ============================================================ */
(function () {
  "use strict";

  var IMG = "assets/img/";
  var IMG_V = "?v=3"; // cache-busting : incrémenter à chaque remplacement de photo
  var PRODUCTS = window.BENJ_PRODUCTS || [];

  // Grille lookbook : image + classe de mise en page (masonry)
  var LOOKBOOK = [
    { src:"back.jpg",  alt:"Sahara Sable, dos et nœud",        cls:"big" },
    { src:"front.jpg", alt:"Sahara Sable, face",               cls:"tall" },
    { src:"bow.jpg",   alt:"Nœud du lien ajustable",           cls:"wide" },
    { src:"top.jpg",   alt:"Sahara Sable, dessus",             cls:"" },
    { src:"lining.jpg",alt:"Doublure intérieure",              cls:"" }
  ];

  // Grille savoir-faire : gros plans commentés de la confection
  var CRAFT = [
    { src:"fabric.jpg", alt:"Détail de l'imprimé léopard", title:"L'imprimé",
      desc:"Un motif léopard dessiné maison, imprimé en petite série sur un coton doux et résistant." }
  ];

  function el(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }
  // Collage produit : 5 vues (héro, dos, profil, dessus, intérieur)
  function galleryFor(p) {
    return [
      { src: p.id + "-g1.jpg", alt: p.name + " — trois-quarts",            cls: "feature" },
      { src: p.id + "-g2.jpg", alt: p.name + " — vue arrière et nœud",     cls: "" },
      { src: p.id + "-g3.jpg", alt: p.name + " — profil",                  cls: "" },
      { src: p.id + "-g4.jpg", alt: p.name + " — vue de dessus",           cls: "" },
      { src: p.id + "-g5.jpg", alt: p.name + " — intérieur doublé",        cls: "c5" }
    ];
  }

  /* ---------- Collection ---------- */
  function buildCollection() {
    var grid = document.getElementById("collection-grid");
    if (!grid) return;
    PRODUCTS.forEach(function (p, i) {
      var main = p.id + ".jpg";
      var card = el(
        '<button class="card" aria-label="Voir ' + p.name + '">' +
          '<div class="card__visual">' +
            '<span class="card__num">' + p.num + "</span>" +
            '<span class="card__view">Voir le modèle</span>' +
            '<img src="' + IMG + main + IMG_V + '" alt="Calot ' + p.name + '" loading="lazy" />' +
          "</div>" +
          '<div class="card__body">' +
            '<h3 class="card__name">' + p.name + "</h3>" +
            '<p class="card__hue">' + p.hue + "</p>" +
            '<p class="card__words">' + p.words + "</p>" +
          "</div>" +
        "</button>"
      );
      card.addEventListener("click", function () { openLightbox(p); });
      grid.appendChild(card);
    });
  }

  /* ---------- Lookbook ---------- */
  function buildLookbook() {
    var grid = document.getElementById("lookbook-grid");
    if (!grid) return;
    LOOKBOOK.forEach(function (item, i) {
      var b = el(
        '<button class="lb-item ' + item.cls + ' reveal" style="transition-delay:' + (i * 40) + 'ms" aria-label="Agrandir : ' + item.alt + '">' +
          '<img src="' + IMG + item.src + IMG_V + '" alt="' + item.alt + '" loading="lazy" />' +
        "</button>"
      );
      b.addEventListener("click", function () { openImage(item.src, item.alt); });
      grid.appendChild(b);
    });
  }

  /* ---------- Savoir-faire ---------- */
  function buildCraft() {
    var grid = document.getElementById("craft-grid");
    if (!grid) return;
    grid.classList.toggle("craft__grid--single", CRAFT.length === 1);
    CRAFT.forEach(function (item, i) {
      var card = el(
        '<button class="craft__card reveal" style="transition-delay:' + (i * 80) + 'ms" aria-label="Agrandir : ' + item.alt + '">' +
          '<span class="craft__ph"><img src="' + IMG + item.src + IMG_V + '" alt="' + item.alt + '" loading="lazy" /></span>' +
          "<h3>" + item.title + "</h3>" +
          "<p>" + item.desc + "</p>" +
        "</button>"
      );
      card.addEventListener("click", function () { openImage(item.src, item.alt); });
      grid.appendChild(card);
    });
  }

  /* ---------- Lightbox / vue produit ---------- */
  var lb = document.getElementById("lightbox");
  var lbGrid = document.getElementById("lb-grid");
  var lbFoot = document.querySelector(".lb__foot");
  var lastFocus = null;

  function lbShow() {
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lb.scrollTop = 0;
    document.getElementById("lb-close").focus();
  }
  function closeLightbox() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  // Vue produit : collage des 5 photos du coloris
  function openLightbox(p) {
    lastFocus = document.activeElement;
    document.getElementById("lb-num").textContent = "N° " + p.num + " — Édition I";
    document.getElementById("lb-name").textContent = p.name;
    document.getElementById("lb-words").textContent = p.words;
    var lbOrder = document.getElementById("lb-order");
    if (lbOrder) lbOrder.href = "contact.html?modele=" + encodeURIComponent(p.name);
    var lbPrice = document.getElementById("lb-price");
    if (lbPrice) lbPrice.textContent = window.BENJ_formatPrice(p.price);
    var lbQty = document.getElementById("lb-qty");
    var lbAdded = document.getElementById("lb-added");
    if (lbQty) lbQty.value = "1";
    if (lbAdded) lbAdded.textContent = "";
    var lbEdition = document.getElementById("lb-edition");
    var lbMaterial = document.getElementById("lb-material");
    var lbCare = document.getElementById("lb-care");
    if (lbEdition) lbEdition.textContent = window.BENJ_EDITION || "";
    if (lbMaterial) lbMaterial.textContent = window.BENJ_MATERIAL || "";
    if (lbCare) lbCare.textContent = window.BENJ_CARE || "";
    lbGrid.className = "pv-grid";
    lbGrid.innerHTML = galleryFor(p).map(function (g) {
      return '<figure class="cell ' + g.cls + '"><img src="' + IMG + g.src + IMG_V + '" alt="' + g.alt + '" loading="lazy" /></figure>';
    }).join("");
    if (lbFoot) lbFoot.style.display = "";
    var lbAdd = document.getElementById("lb-add");
    if (lbAdd) {
      lbAdd.onclick = function () {
        var qty = parseInt((lbQty && lbQty.value) || "1", 10) || 1;
        window.BENJ_Cart.add(p.id, qty);
        if (lbAdded) lbAdded.textContent = qty + " × " + p.name + " ajouté" + (qty > 1 ? "s" : "") + " au panier.";
      };
    }
    lbShow();
  }

  // Aperçu d'une image seule (lookbook)
  function openImage(src, alt) {
    lastFocus = document.activeElement;
    document.getElementById("lb-num").textContent = "Lookbook";
    document.getElementById("lb-name").textContent = "Collection Sahara";
    document.getElementById("lb-words").textContent = alt;
    lbGrid.className = "pv-grid single";
    lbGrid.innerHTML = '<figure class="cell"><img src="' + IMG + src + IMG_V + '" alt="' + alt + '" /></figure>';
    if (lbFoot) lbFoot.style.display = "none";
    lbShow();
  }

  if (lb) {
    document.getElementById("lb-close").addEventListener("click", closeLightbox);
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) closeLightbox(); });
  }

  /* ---------- Sélecteur de quantité (lightbox) ---------- */
  function initLightboxQty() {
    var qtyInput = document.getElementById("lb-qty");
    var dec = document.getElementById("lb-qty-dec");
    var inc = document.getElementById("lb-qty-inc");
    if (!qtyInput) return;
    dec && dec.addEventListener("click", function () {
      qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
    });
    inc && inc.addEventListener("click", function () {
      qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + 1;
    });
  }

  /* ---------- Révélation au scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Nav + menu plein écran ---------- */
  function initNav() {
    var nav = document.getElementById("nav");
    var burger = document.getElementById("burger");
    var menu = document.getElementById("menu");
    if (!nav || !burger) return;
    var overCapable = nav.classList.contains("nav--over");

    var onScroll = function () {
      if (!overCapable) return;
      if (menu && menu.classList.contains("open")) return;
      var past = window.scrollY > (window.innerHeight - 90);
      nav.classList.toggle("nav--solid", past);
      nav.classList.toggle("nav--over", !past);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    function setMenu(open) {
      if (menu) menu.classList.toggle("open", open);
      nav.classList.toggle("is-menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
      if (!open) onScroll();
    }
    burger.addEventListener("click", function () {
      setMenu(!(menu && menu.classList.contains("open")));
    });
    if (menu) {
      menu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { setMenu(false); });
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && menu.classList.contains("open")) setMenu(false);
      });
    }
  }

  /* ---------- Pré-remplir le modèle (page contact) ---------- */
  function initModelParam() {
    var sel = document.getElementById("f-model");
    if (!sel) return;
    var m = new URLSearchParams(location.search).get("modele");
    if (!m) return;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].text.indexOf(m) > -1) { sel.selectedIndex = i; break; }
    }
  }

  /* ---------- Diaporama du hero (fondu enchaîné) ---------- */
  function initHero() {
    var slides = document.querySelectorAll("#hero-media .hero__slide");
    if (slides.length < 2) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
    }, 4200);
  }

  /* ---------- Carrousel collection (flèches) ---------- */
  function initCarousel() {
    var track = document.getElementById("collection-grid");
    if (!track) return;
    var arrows = document.querySelectorAll(".carousel__arrow");
    function step() {
      var card = track.querySelector(".card");
      return card ? card.offsetWidth + 24 : 300;
    }
    arrows.forEach(function (btn) {
      btn.addEventListener("click", function () {
        track.scrollBy({ left: parseInt(btn.getAttribute("data-dir"), 10) * step() * 1, behavior: "smooth" });
      });
    });
    function update() {
      var max = track.scrollWidth - track.clientWidth - 4;
      // Peu de modèles : la rangée tient dans l'écran, on la centre.
      // Dès qu'il y en a assez pour défiler, on repasse à l'alignement
      // gauche (indispensable pour que le défilement reste utilisable).
      track.classList.toggle("carousel--centered", track.scrollWidth <= track.clientWidth + 2);
      arrows.forEach(function (b) {
        var dir = parseInt(b.getAttribute("data-dir"), 10);
        b.disabled = dir < 0 ? track.scrollLeft <= 4 : track.scrollLeft >= max;
      });
    }
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    setTimeout(update, 100);
  }

  /* ---------- Formulaire ---------- */
  function initForm() {
    var form = document.getElementById("order-form");
    if (!form) return;
    var note = document.getElementById("order-note");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        note.textContent = "Merci d'indiquer votre nom et un email valide.";
        note.className = "order__note";
        return;
      }
      note.textContent = "Merci " + name + ". Votre demande a bien été enregistrée — la maison BENJ. vous recontacte très vite.";
      note.className = "order__note ok";
      form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildCollection();
    buildCraft();
    buildLookbook();
    initReveal();
    initNav();
    initHero();
    initCarousel();
    initForm();
    initModelParam();
    initLightboxQty();
  });
})();
