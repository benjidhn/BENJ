/* ============================================================
   BENJ. — Medical Couture · main.js
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Coloris de la collection ---------- */
  const COLORWAYS = {
    sahara:     { base:"#ddc9a6", ring:"#33261a", center:"#b98f4e", swatches:["#efe3c9","#c69a56","#7a5a2f","#2e241a"] },
    oasis:      { base:"#a99a6e", ring:"#2b2612", center:"#7c6c3a", swatches:["#c9bd93","#8e7f4c","#5a4d25","#241f0f"] },
    "nuit-fauve":{ base:"#2c281f", ring:"#0c0a06", center:"#8a6c3c", swatches:["#6f5730","#3d3323","#1c1710","#0a0805"] },
    dune:       { base:"#e8d6a8", ring:"#6a4d22", center:"#caa35b", swatches:["#f3e6c2","#d9b877","#a9823f","#6a4d22"] },
    terracotta: { base:"#b06a3e", ring:"#3a1e10", center:"#8a481f", swatches:["#c88a5c","#a65a2e","#6f3418","#301609"] },
    graphite:   { base:"#9b968c", ring:"#25231e", center:"#5d5850", swatches:["#b9b4a9","#7c776e","#4a463f","#211f1b"] }
  };

  const MODELS = [
    { id:"sahara",      num:"01", name:"Sahara",      hue:"Léopard sable",    words:"Élégant. Intemporel. Iconique." },
    { id:"oasis",       num:"02", name:"Oasis",       hue:"Léopard olive",    words:"Naturel. Profond. Raffiné." },
    { id:"nuit-fauve",  num:"03", name:"Nuit Fauve",  hue:"Léopard nocturne", words:"Discret. Puissant. Sophistiqué." },
    { id:"dune",        num:"04", name:"Dune",        hue:"Léopard doré",     words:"Lumineux. Doux. Précieux." },
    { id:"terracotta",  num:"05", name:"Terracotta",  hue:"Léopard brun",     words:"Chaleureux. Intense. Unique." },
    { id:"graphite",    num:"06", name:"Graphite",    hue:"Léopard cendré",   words:"Moderne. Élégant. Urbain." }
  ];

  /* ---------- Générateur pseudo-aléatoire (déterministe) ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- Génère un imprimé léopard SVG ---------- */
  function leopardSVG(colorwayId, seed) {
    const c = COLORWAYS[colorwayId] || COLORWAYS.sahara;
    const rnd = mulberry32(seed || 7);
    const S = 200;
    let spots = "";

    // Fond nuancé : voiles chauds très discrets pour éviter l'aplat
    let warmth = "";
    for (let i = 0; i < 4; i++) {
      warmth += '<ellipse cx="' + f(rnd() * S) + '" cy="' + f(rnd() * S) +
        '" rx="' + f(55 + rnd() * 70) + '" ry="' + f(55 + rnd() * 70) +
        '" fill="' + c.center + '" opacity="0.07"/>';
    }

    // Grille jitterée de rosettes / taches
    const step = 26;
    for (let y = -8; y < S + 20; y += step) {
      for (let x = -8; x < S + 20; x += step) {
        const cx = x + (rnd() - 0.5) * step * 0.95;
        const cy = y + (rnd() - 0.5) * step * 0.95 + ((Math.round(x / step)) % 2 ? step / 2 : 0);
        const scale = 0.74 + rnd() * 0.66;
        const rot = rnd() * 360;
        // ~35% de taches pleines isolées, sinon rosette brisée
        spots += rnd() < 0.35 ? blobCluster(cx, cy, scale, rot, c, rnd)
                              : rosette(cx, cy, scale, rot, c, rnd);
      }
    }

    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + S + ' ' + S + '" ' +
      'preserveAspectRatio="xMidYMid slice" width="100%" height="100%">' +
      '<rect width="' + S + '" height="' + S + '" fill="' + c.base + '"/>' +
      warmth +
      '<g opacity="0.97">' + spots + '</g>' +
      '</svg>'
    );
  }

  // Pétale : ellipse lisse, légèrement galbée
  function petal(px, py, rx, ry, rot, fill) {
    return '<ellipse cx="' + f(px) + '" cy="' + f(py) + '" rx="' + f(rx) +
      '" ry="' + f(ry) + '" fill="' + fill + '" transform="rotate(' + f(rot) +
      ' ' + f(px) + ' ' + f(py) + ')"/>';
  }

  // Rosette léopard : anneau sombre BRISÉ et asymétrique, centre fauve
  function rosette(cx, cy, scale, rot, c, rnd) {
    const petals = 5 + Math.floor(rnd() * 3);
    const r = 5.4 * scale;
    let g = '<g transform="translate(' + f(cx) + ',' + f(cy) + ') rotate(' + f(rot) + ')">';
    // centre fauve légèrement plus soutenu
    g += '<ellipse rx="' + f(3.6 * scale) + '" ry="' + f(2.9 * scale) +
         '" fill="' + c.center + '" opacity="0.55" transform="rotate(' + f(rnd() * 60 - 30) + ')"/>';
    let a = rnd() * Math.PI * 2;
    for (let i = 0; i < petals; i++) {
      a += (Math.PI * 2 / petals) * (0.62 + rnd() * 0.8); // pas angulaire irrégulier
      if (rnd() < 0.16) continue;                          // anneau brisé
      const rr = r * (0.82 + rnd() * 0.4);
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      const pr = (a * 180) / Math.PI + 90 + (rnd() * 30 - 15);
      g += petal(px, py, (1.8 + rnd() * 0.9) * scale, (3 + rnd() * 1.4) * scale, pr, c.ring);
    }
    g += "</g>";
    return g;
  }

  // Amas de taches pleines (petites)
  function blobCluster(cx, cy, scale, rot, c, rnd) {
    const n = 1 + Math.floor(rnd() * 3);
    let g = '<g transform="translate(' + f(cx) + ',' + f(cy) + ') rotate(' + f(rot) + ')">';
    for (let i = 0; i < n; i++) {
      const px = (rnd() - 0.5) * 6 * scale;
      const py = (rnd() - 0.5) * 6 * scale;
      g += petal(px, py, (2 + rnd() * 1.1) * scale, (2.7 + rnd() * 1.3) * scale, rnd() * 360, c.ring);
    }
    g += "</g>";
    return g;
  }
  const f = (n) => Math.round(n * 10) / 10;

  /* ---------- Applique un léopard à tous les [data-leopard] ---------- */
  function paintLeopards() {
    document.querySelectorAll("[data-leopard]").forEach(function (el, i) {
      el.innerHTML = leopardSVG(el.getAttribute("data-leopard"), (i + 1) * 97 + 13);
    });
  }

  /* ---------- Construit la grille de la collection ---------- */
  function buildCollection() {
    const grid = document.getElementById("collection-grid");
    if (!grid) return;
    grid.innerHTML = MODELS.map(function (m, i) {
      const c = COLORWAYS[m.id];
      const sw = c.swatches.map((h) => '<i style="background:' + h + '"></i>').join("");
      return (
        '<article class="card reveal" style="transition-delay:' + (i * 60) + 'ms">' +
          '<div class="card__visual">' +
            '<span class="card__num">' + m.num + "</span>" +
            '<div class="card__leopard" data-leopard="' + m.id + '"></div>' +
            '<div class="card__band"><span class="card__plate">B.</span></div>' +
          "</div>" +
          '<div class="card__body">' +
            '<h3 class="card__name">' + m.name + "</h3>" +
            '<p class="card__hue">' + m.hue + "</p>" +
            '<p class="card__words">' + m.words + "</p>" +
            '<div class="card__swatches">' + sw + "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  /* ---------- Révélation au scroll ---------- */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- Nav : fond au scroll + menu mobile ---------- */
  function initNav() {
    const nav = document.getElementById("nav");
    const burger = document.getElementById("burger");
    const links = document.querySelector(".nav__links");
    const onScroll = () => nav.classList.toggle("nav--solid", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    burger.addEventListener("click", function () {
      const open = links.classList.toggle("open");
      nav.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", function () {
        links.classList.remove("open");
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Formulaire de contact ---------- */
  function initForm() {
    const form = document.getElementById("order-form");
    if (!form) return;
    const note = document.getElementById("order-note");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
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

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildCollection();
    paintLeopards();
    initReveal();
    initNav();
    initForm();
  });
})();
