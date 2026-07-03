/* ============================================================
   BENJ. — Medical Couture · main.js
   ============================================================ */
(function () {
  "use strict";

  var IMG = "assets/img/";
  // Détails de construction communs à toute la collection
  var SHARED = [
    { src: "fabric.jpg",  alt: "Imprimé léopard exclusif" },
    { src: "plate.jpg",   alt: "Plaque métallique dorée BENJ." },
    { src: "bow.jpg",     alt: "Nœud du lien ajustable" }
  ];

  var PRODUCTS = [
    { id:"sable", num:"01", name:"Sahara Sable", hue:"Léopard sable",
      words:"Élégant. Intemporel. Iconique.",
      desc:"Le coloris fondateur. Un léopard sable sur bandeau crème, rehaussé d'une doublure orange brûlé et de la plaque dorée BENJ. La pièce iconique de la maison." },
    { id:"olive", num:"02", name:"Sahara Olive", hue:"Léopard olive",
      words:"Naturel. Profond. Raffiné.",
      desc:"Un vert olive profond qui enveloppe le léopard d'une aura naturelle et raffinée. Pour une allure organique et distinguée." },
    { id:"nuit", num:"03", name:"Sahara Nuit", hue:"Léopard nocturne",
      words:"Discret. Puissant. Sophistiqué.",
      desc:"Le noir absolu, tendu sur un léopard nocturne. La sophistication à l'état pur — discret, puissant, intemporel." },
    { id:"terracotta", num:"04", name:"Sahara Terracotta", hue:"Léopard brun",
      words:"Chaleureux. Intense. Unique.",
      desc:"Une terre cuite chaleureuse et intense, écho à la doublure iconique de la maison. Un caractère affirmé, unique." },
    { id:"graphite", num:"05", name:"Sahara Graphite", hue:"Léopard cendré",
      words:"Moderne. Élégant. Urbain.",
      desc:"Un gris graphite contemporain, urbain et élégant. Le léopard cendré, réinventé pour aujourd'hui." }
  ];

  // Grille lookbook : image + classe de mise en page (masonry)
  var LOOKBOOK = [
    { src:"hero.jpg",  alt:"Sahara Sable, trois-quarts",       cls:"big" },
    { src:"front.jpg", alt:"Sahara Sable, face",               cls:"" },
    { src:"back.jpg",  alt:"Sahara Sable, dos et nœud",        cls:"tall" },
    { src:"fabric.jpg",alt:"Détail de l'imprimé léopard",      cls:"" },
    { src:"plate.jpg", alt:"Plaque dorée BENJ.",               cls:"" },
    { src:"top.jpg",   alt:"Sahara Sable, dessus",             cls:"wide" },
    { src:"lining.jpg",alt:"Doublure orange brûlé",            cls:"wide" },
    { src:"bow.jpg",   alt:"Nœud du lien ajustable",           cls:"" },
    { src:"tag.jpg",   alt:"Étiquette métallique BENJ.",       cls:"" }
  ];

  function el(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }
  function galleryFor(p) {
    return [
      { src: p.id + ".jpg",      alt: p.name + " — profil trois-quarts" },
      { src: p.id + "-back.jpg", alt: p.name + " — vue arrière et nœud" },
      { src: p.id + "-top.jpg",  alt: p.name + " — intérieur doublé orange brûlé" }
    ].concat(SHARED);
  }

  /* ---------- Collection ---------- */
  function buildCollection() {
    var grid = document.getElementById("collection-grid");
    if (!grid) return;
    PRODUCTS.forEach(function (p, i) {
      var main = p.id + ".jpg";
      var card = el(
        '<button class="card reveal" style="transition-delay:' + (i * 60) + 'ms" aria-label="Voir ' + p.name + '">' +
          '<div class="card__visual">' +
            '<span class="card__num">' + p.num + "</span>" +
            '<span class="card__view">Voir le modèle</span>' +
            '<img src="' + IMG + main + '" alt="Calot ' + p.name + '" loading="lazy" />' +
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
          '<img src="' + IMG + item.src + '" alt="' + item.alt + '" loading="lazy" />' +
        "</button>"
      );
      b.addEventListener("click", function () { openImage(item.src, item.alt); });
      grid.appendChild(b);
    });
  }

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");
  var lastFocus = null;

  function lbShow() {
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("lb-close").focus();
  }
  function closeLightbox() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  // Fiche produit complète
  function openLightbox(p) {
    lastFocus = document.activeElement;
    var gal = galleryFor(p);
    document.getElementById("lb-num").textContent = "N° " + p.num + " — Édition I";
    document.getElementById("lb-name").textContent = p.name;
    document.getElementById("lb-hue").textContent = p.hue;
    document.getElementById("lb-words").textContent = p.words;
    document.getElementById("lb-desc").textContent = p.desc;
    document.getElementById("lb-order").onclick = function () {
      closeLightbox();
      var sel = document.getElementById("f-model");
      if (sel) { for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].text.indexOf(p.name) > -1) sel.selectedIndex = i; } }
    };
    setMain(gal[0].src, gal[0].alt);

    var thumbs = document.getElementById("lb-thumbs");
    thumbs.innerHTML = "";
    thumbs.style.display = gal.length > 1 ? "flex" : "none";
    gal.forEach(function (g, idx) {
      var t = el('<button aria-label="' + g.alt + '"' + (idx === 0 ? ' aria-current="true"' : '') + '><img src="' + IMG + g.src + '" alt="" loading="lazy" /></button>');
      t.addEventListener("click", function () {
        setMain(g.src, g.alt);
        thumbs.querySelectorAll("button").forEach(function (x) { x.removeAttribute("aria-current"); });
        t.setAttribute("aria-current", "true");
      });
      thumbs.appendChild(t);
    });
    lbShow();
  }

  // Image seule (lookbook)
  function openImage(src, alt) {
    lastFocus = document.activeElement;
    document.getElementById("lb-num").textContent = "Lookbook";
    document.getElementById("lb-name").textContent = "Collection Sahara";
    document.getElementById("lb-hue").textContent = "";
    document.getElementById("lb-words").textContent = "";
    document.getElementById("lb-desc").textContent = alt;
    document.getElementById("lb-thumbs").style.display = "none";
    document.getElementById("lb-order").onclick = function () { closeLightbox(); };
    setMain(src, alt);
    lbShow();
  }

  function setMain(src, alt) { lbImg.src = IMG + src; lbImg.alt = alt; }

  document.getElementById("lb-close").addEventListener("click", closeLightbox);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) closeLightbox(); });

  /* ---------- Révélation au scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Nav ---------- */
  function initNav() {
    var nav = document.getElementById("nav");
    var burger = document.getElementById("burger");
    var links = document.querySelector(".nav__links");
    var onScroll = function () { nav.classList.toggle("nav--solid", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      nav.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); });
    });
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
    buildLookbook();
    initReveal();
    initNav();
    initForm();
  });
})();
