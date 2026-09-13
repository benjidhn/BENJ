/* ============================================================
   BENJ. — Medical Couture · main.js
   ============================================================ */
(function () {
  "use strict";

  var IMG = "assets/img/";
  var IMG_V = "?v=4"; // cache-busting : incrémenter à chaque remplacement de photo
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
        '<a class="card" href="produit.html?id=' + p.id + '" aria-label="Voir ' + p.name + '">' +
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
        "</a>"
      );
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

  /* ---------- Lightbox (aperçu lookbook/savoir-faire — une image) ---------- */
  var lb = document.getElementById("lightbox");
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

  // Aperçu d'une image seule (lookbook / savoir-faire)
  function openImage(src, alt) {
    lastFocus = document.activeElement;
    document.getElementById("lb-stage").innerHTML = '<img src="' + IMG + src + IMG_V + '" alt="' + alt + '" />';
    var caption = document.getElementById("lb-caption");
    if (caption) caption.textContent = alt;
    lbShow();
  }

  if (lb) {
    document.getElementById("lb-close").addEventListener("click", closeLightbox);
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("open")) closeLightbox();
    });
  }

  /* ---------- Fiche produit en page à part entière (produit.html) ---------- */
  function initProductPage() {
    var stage = document.getElementById("pd-stage");
    if (!stage) return; // pas sur cette page

    var images = [];
    var index = 0;

    function render() {
      if (!images.length) return;
      var g = images[index];
      stage.innerHTML = '<img src="' + IMG + g.src + IMG_V + '" alt="' + g.alt + '" />';
      document.querySelectorAll("#pd-dots .lb__dot").forEach(function (d, i) {
        d.classList.toggle("is-active", i === index);
      });
    }
    function renderDots() {
      var dots = document.getElementById("pd-dots");
      var multi = images.length > 1;
      if (dots) {
        dots.style.display = multi ? "" : "none";
        dots.innerHTML = images.map(function (g, i) {
          return '<button type="button" class="lb__dot' + (i === 0 ? " is-active" : "") + '" data-i="' + i + '" aria-label="Voir la vue ' + (i + 1) + '"></button>';
        }).join("");
        dots.querySelectorAll(".lb__dot").forEach(function (d) {
          d.addEventListener("click", function () { index = parseInt(d.getAttribute("data-i"), 10) || 0; render(); });
        });
      }
      document.querySelectorAll("#pd-prev, #pd-next").forEach(function (a) { a.style.display = multi ? "" : "none"; });
    }
    function gotoImage(delta) {
      if (images.length < 2) return;
      index = (index + delta + images.length) % images.length;
      render();
    }

    function renderSwatches(activeId) {
      var wrap = document.getElementById("pd-swatches");
      if (!wrap) return;
      wrap.innerHTML = PRODUCTS.map(function (prod) {
        return '<a class="lb__swatch' + (prod.id === activeId ? " is-active" : "") + '" href="produit.html?id=' + prod.id + '" aria-label="' + prod.name + '"><img src="' + IMG + prod.id + ".jpg" + IMG_V + '" alt="" /></a>';
      }).join("");
    }

    function load(p) {
      images = galleryFor(p);
      index = 0;
      document.title = p.name + " — BENJ. Medical Couture";
      document.getElementById("pd-num").textContent = "N° " + p.num + " — Édition I";
      document.getElementById("pd-name").textContent = p.name;
      document.getElementById("pd-words").textContent = p.words;
      document.getElementById("pd-price").textContent = window.BENJ_formatPrice(p.price);
      document.getElementById("pd-material").textContent = window.BENJ_MATERIAL || "";
      document.getElementById("pd-care").textContent = window.BENJ_CARE || "";
      document.getElementById("pd-edition").textContent = window.BENJ_EDITION || "";
      var order = document.getElementById("pd-order");
      if (order) order.href = "contact.html?modele=" + encodeURIComponent(p.name);
      var qty = document.getElementById("pd-qty");
      var added = document.getElementById("pd-added");
      if (qty) qty.value = "1";
      if (added) added.textContent = "";

      render();
      renderDots();
      renderSwatches(p.id);

      var addBtn = document.getElementById("pd-add");
      if (addBtn) {
        addBtn.onclick = function () {
          var q = parseInt((qty && qty.value) || "1", 10) || 1;
          window.BENJ_Cart.add(p.id, q);
          if (added) added.textContent = q + " × " + p.name + " ajouté" + (q > 1 ? "s" : "") + " au panier.";
        };
      }
    }

    var id = new URLSearchParams(location.search).get("id");
    var product = window.BENJ_findProduct(id) || PRODUCTS[0];
    if (!product) return;
    load(product);

    var prevBtn = document.getElementById("pd-prev");
    var nextBtn = document.getElementById("pd-next");
    if (prevBtn) prevBtn.addEventListener("click", function () { gotoImage(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { gotoImage(1); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") gotoImage(-1);
      else if (e.key === "ArrowRight") gotoImage(1);
    });

    var qtyInput = document.getElementById("pd-qty");
    var dec = document.getElementById("pd-qty-dec");
    var inc = document.getElementById("pd-qty-inc");
    if (qtyInput) {
      dec && dec.addEventListener("click", function () {
        qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
      });
      inc && inc.addEventListener("click", function () {
        qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + 1;
      });
    }
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
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Vidéo hero : on respecte la préférence "réduire les animations"
    var video = document.getElementById("hero-video");
    if (video) {
      if (reduceMotion) video.pause();
      return;
    }

    var slides = document.querySelectorAll("#hero-media .hero__slide");
    if (slides.length < 2 || reduceMotion) return;
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
    initProductPage();
  });
})();
