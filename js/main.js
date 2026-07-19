/* Elmek Solutions — v2 experience script.
   GSAP owns: preloader, hero intro, split-text reveals, scroll choreography,
   pinned horizontal projects, counters, magnetic buttons, 3D tilt, custom
   cursor, header show/hide, scroll progress.
   Everything degrades: no GSAP -> the `js` class is removed and the page is
   fully static; prefers-reduced-motion -> functional bits only, no motion. */
(function () {
  "use strict";

  var docEl = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);

  if (!hasGsap) docEl.classList.remove("js");
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function q(sel, root) { return (root || document).querySelector(sel); }

  /* ============================================================
     FUNCTIONAL LAYER — always runs, motion or not
     ============================================================ */

  /* -- header: scrolled state + hide-on-scroll-down -- */
  var header = q("#siteHeader");
  var lastY = 0;
  var headerHidden = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    if (y > lastY + 6 && y > 260 && !headerHidden) {
      headerHidden = true;
      header.classList.add("is-hidden");
    } else if ((y < lastY - 6 || y < 260) && headerHidden) {
      headerHidden = false;
      header.classList.remove("is-hidden");
    }
    lastY = y;
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* -- mobile nav -- */
  var toggle = q("#navToggle");
  var mobileNav = q("#mobileNav");
  var mobileLinks = qa(".mobile-nav-links a");

  function closeMobileNav() {
    mobileNav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var isOpen = mobileNav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (isOpen && hasGsap) {
      gsap.fromTo(mobileLinks,
        { autoAlpha: 0, y: 34 },
        { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.06, ease: "power3.out", delay: 0.1, overwrite: true });
    }
  });
  mobileLinks.forEach(function (link) { link.addEventListener("click", closeMobileNav); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMobileNav(); });
  window.addEventListener("resize", function () { if (window.innerWidth > 900) closeMobileNav(); });

  /* -- hero slideshow: plain-CSS crossfade fallback.
        Only runs when GSAP is unavailable — when GSAP loads, the motion
        layer below takes over with a clip-path wipe transition instead,
        so the two never cycle the same slides at once. -- */
  var heroSlides = qa(".hero-slide");
  var heroCaption = q("#heroCaption");
  if (heroSlides.length > 1 && !reduceMotion && !hasGsap) {
    var slideIndex = 0;
    setInterval(function () {
      var nextIndex = (slideIndex + 1) % heroSlides.length;
      heroSlides[slideIndex].classList.remove("is-active");
      heroSlides[nextIndex].classList.add("is-active");
      if (heroCaption) {
        heroCaption.style.opacity = "0";
        setTimeout(function () {
          heroCaption.textContent = heroSlides[nextIndex].getAttribute("data-caption");
          heroCaption.style.opacity = "1";
        }, 260);
      }
      slideIndex = nextIndex;
    }, 5000);
  }

  /* -- contact form: static site, so hand off to the visitor's mail client -- */
  var contactForm = q("#contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
      var name = contactForm.name.value.trim();
      var email = contactForm.email.value.trim();
      var message = contactForm.message.value.trim();
      var subject = "Consultation request from " + name;
      var body = "Name: " + name + "\nEmail: " + email + "\n\n" + message;
      window.location.href = "mailto:mail@elmeksolutions.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }

  /* ============================================================
     MOTION LAYER
     ============================================================ */
  var preloader = q("#preloader");

  if (!hasGsap) {
    if (preloader) preloader.style.display = "none";
    return;
  }

  /* -- split-text: wrap every word in a masked span, recursing through
        child elements (em / accent spans keep their color via inheritance) -- */
  function splitWords(el) {
    function process(node) {
      var children = Array.prototype.slice.call(node.childNodes);
      children.forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          var parts = child.textContent.split(/(\s+)/);
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(" "));
            } else {
              var w = document.createElement("span");
              w.className = "w";
              var wi = document.createElement("span");
              wi.className = "wi";
              wi.textContent = part;
              w.appendChild(wi);
              frag.appendChild(w);
            }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          process(child);
        }
      });
    }
    process(el);
    return qa(".wi", el);
  }

  /* -- counters -- */
  function runCounter(el, duration, delay) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var pad = parseInt(el.getAttribute("data-pad") || "0", 10);
    var obj = { v: 0 };
    return gsap.to(obj, {
      v: target,
      duration: duration || 1.6,
      delay: delay || 0,
      ease: "power2.out",
      onUpdate: function () {
        var n = Math.round(obj.v).toString();
        while (n.length < pad) n = "0" + n;
        el.textContent = n + suffix;
      }
    });
  }

  /* -- initial hidden states (JS-only, so no-JS users see everything) -- */
  var heroTitle = q("#heroTitle");
  var heroWords = splitWords(heroTitle);
  var heroReveals = qa(".hero [data-reveal]");
  var heroMedia = q("#heroMedia");

  gsap.set(heroWords, { yPercent: 112 });
  gsap.set(heroReveals, { autoAlpha: 0, y: 26 });
  gsap.set(heroMedia, { clipPath: "inset(100% 0% 0% 0%)" });

  /* -- hero photo cycle: clip-path wipe reveal (replaces the plain
        crossfade fallback above, since GSAP is available here). The
        incoming photo wipes in left-to-right on top of the outgoing one;
        the Ken Burns zoom keeps running via the existing CSS animation
        on .is-active. -- */
  if (heroSlides.length > 1) {
    /* clip-path now owns visibility; pin opacity to 1 via inline style so
       the is-active class's CSS opacity toggle (used by the no-GSAP
       fallback) can't fight the wipe. */
    gsap.set(heroSlides, { opacity: 1 });
    gsap.set(heroSlides[0], { clipPath: "inset(0% 0% 0% 0%)", zIndex: 2 });
    gsap.set(heroSlides.slice(1), { clipPath: "inset(0% 100% 0% 0%)", zIndex: 1 });

    var heroSlideIndex = 0;
    setInterval(function () {
      var current = heroSlides[heroSlideIndex];
      var nextIndex = (heroSlideIndex + 1) % heroSlides.length;
      var next = heroSlides[nextIndex];

      gsap.set(next, { clipPath: "inset(0% 100% 0% 0%)", zIndex: 3 });
      next.classList.add("is-active");
      current.classList.remove("is-active");

      gsap.to(next, {
        clipPath: "inset(0% 0% 0% 0%)", duration: 1.25, ease: "power3.inOut",
        onComplete: function () {
          gsap.set(current, { zIndex: 1 });
          gsap.set(next, { zIndex: 2 });
        }
      });

      if (heroCaption) {
        gsap.to(heroCaption, {
          autoAlpha: 0, duration: 0.25,
          onComplete: function () {
            heroCaption.textContent = next.getAttribute("data-caption");
            gsap.to(heroCaption, { autoAlpha: 1, duration: 0.3 });
          }
        });
      }
      heroSlideIndex = nextIndex;
    }, 5000);
  }

  var scrollReveals = qa("[data-reveal]").filter(function (el) { return !el.closest(".hero"); });
  gsap.set(scrollReveals, { autoAlpha: 0, y: 30 });

  var splitHeads = qa("[data-split]");
  var splitMap = [];
  splitHeads.forEach(function (el) {
    var words = splitWords(el);
    gsap.set(words, { yPercent: 112 });
    splitMap.push({ el: el, words: words });
  });

  var clipEls = qa("[data-clip]");
  gsap.set(clipEls, { clipPath: "inset(0% 0% 100% 0%)" });

  var gridTiles = qa(".logo-grid .logo-tile");
  gsap.set(gridTiles, { autoAlpha: 0, y: 24 });

  var serviceCards = qa(".service-card");
  gsap.set(serviceCards, { autoAlpha: 0, y: 40 });

  /* -- preloader: count to 100 while the page loads, then lift -- */
  var counterEl = q("#preloaderCount");
  var loaded = false;
  window.addEventListener("load", function () { loaded = true; });

  var pre = { v: 0 };
  var heroIntroPlayed = false;

  function heroIntro() {
    if (heroIntroPlayed) return;
    heroIntroPlayed = true;
    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to(heroWords, { yPercent: 0, duration: 1.1, stagger: 0.045 }, 0)
      .to(heroMedia, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power3.inOut" }, 0.15)
      .to(heroReveals, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.45);
    qa(".hero-stats .num").forEach(function (el, i) {
      runCounter(el, 1.6, 0.7 + i * 0.12);
    });
  }

  function preloaderOut() {
    var tl = gsap.timeline({
      onComplete: function () { preloader.style.display = "none"; heroIntro(); }
    });
    tl.to(pre, {
      v: 100, duration: 0.25, ease: "power1.in",
      onUpdate: function () { counterEl.textContent = Math.round(pre.v).toString().padStart(2, "0"); }
    })
      .to(".preloader-inner, .preloader-count", { autoAlpha: 0, y: -24, duration: 0.3, ease: "power2.in" }, "+=0.08")
      .to(preloader, { yPercent: -100, duration: 0.6, ease: "power4.inOut" }, "-=0.05");
  }

  gsap.to(pre, {
    v: 88, duration: 0.75, ease: "power2.out",
    onUpdate: function () { counterEl.textContent = Math.round(pre.v).toString().padStart(2, "0"); },
    onComplete: function () {
      if (loaded) { preloaderOut(); }
      else {
        var waited = 0;
        var poll = setInterval(function () {
          waited += 100;
          if (loaded || waited >= 900) { clearInterval(poll); preloaderOut(); }
        }, 100);
      }
    }
  });

  /* -- scroll progress bar -- */
  gsap.to("#scrollProgress", {
    scaleX: 1, ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 }
  });

  /* -- generic scroll reveals -- */
  scrollReveals.forEach(function (el) {
    gsap.to(el, {
      autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%", once: true }
    });
  });

  /* -- split headings reveal on scroll -- */
  splitMap.forEach(function (item) {
    gsap.to(item.words, {
      yPercent: 0, duration: 1, stagger: 0.04, ease: "power4.out",
      scrollTrigger: { trigger: item.el, start: "top 86%", once: true }
    });
  });

  /* -- clip-path image reveals -- */
  clipEls.forEach(function (el) {
    gsap.to(el, {
      clipPath: "inset(0% 0% 0% 0%)", duration: 1.15, ease: "power3.inOut",
      scrollTrigger: { trigger: el, start: "top 82%", once: true }
    });
  });

  /* -- image parallax inside clipped frames -- */
  qa("[data-parallax]").forEach(function (img) {
    gsap.fromTo(img, { yPercent: 0 }, {
      yPercent: -11, ease: "none",
      scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* -- batched card / tile entrances -- */
  ScrollTrigger.batch(serviceCards, {
    start: "top 88%", once: true,
    onEnter: function (batch) {
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.1, ease: "power3.out" });
    }
  });
  ScrollTrigger.batch(gridTiles, {
    start: "top 92%", once: true,
    onEnter: function (batch) {
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.045, ease: "power3.out" });
    }
  });

  /* -- projects: pinned horizontal scroll (desktop only) -- */
  var mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", function () {
    var track = q("#projectsTrack");
    var projCurrent = q("#projCurrent");
    var slideCount = qa(".project-slide").length;

    var st = gsap.to(track, {
      x: function () { return -(track.scrollWidth - window.innerWidth); },
      ease: "none",
      scrollTrigger: {
        trigger: ".projects",
        start: "top top",
        end: function () { return "+=" + (track.scrollWidth - window.innerWidth); },
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          if (projCurrent) {
            var idx = Math.min(slideCount, Math.round(self.progress * (slideCount - 1)) + 1);
            projCurrent.textContent = ("0" + idx).slice(-2);
          }
        }
      }
    });
    return function () {
      st.scrollTrigger && st.scrollTrigger.kill();
      st.kill();
      gsap.set(track, { clearProps: "x" });
    };
  });

  /* -- magnetic buttons -- */
  if (finePointer) {
    qa("[data-magnetic]").forEach(function (el) {
      var xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
      var yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
      });
      el.addEventListener("pointerleave", function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.45)" });
      });
    });
  }

  /* -- 3D tilt cards -- */
  if (finePointer) {
    qa("[data-tilt]").forEach(function (el) {
      var rX = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "power2.out" });
      var rY = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "power2.out" });
      gsap.set(el, { transformPerspective: 900 });
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        rX(((e.clientY - r.top) / r.height - 0.5) * -6);
        rY(((e.clientX - r.left) / r.width - 0.5) * 6);
      });
      el.addEventListener("pointerleave", function () {
        gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
      });
    });
  }

  /* recalc pinned distances once all images are in */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
