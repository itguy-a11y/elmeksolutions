(function () {
  "use strict";

  /* Sticky header border on scroll */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav toggle */
  var toggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");

  function closeMobileNav() {
    mobileNav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function () {
    var isOpen = mobileNav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  mobileNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMobileNav);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMobileNav();
  });

  /* Close mobile nav if the viewport grows past the mobile breakpoint */
  window.addEventListener("resize", function () {
    if (window.innerWidth > 860) closeMobileNav();
  });

  /* Reveal-on-scroll (respects prefers-reduced-motion) */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal, .logo-grid .logo-tile").forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal, .logo-grid .logo-tile").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Hero photo slideshow — crossfades through the structures Elmek has
     powered. Static on the first slide if the user prefers reduced motion. */
  var heroSlides = document.querySelectorAll(".hero-slide");
  var heroCaption = document.getElementById("heroCaption");
  if (heroSlides.length > 1 && !reduceMotion) {
    var slideIndex = 0;
    setInterval(function () {
      var current = heroSlides[slideIndex];
      var nextIndex = (slideIndex + 1) % heroSlides.length;
      var next = heroSlides[nextIndex];
      current.classList.remove("is-active");
      next.classList.add("is-active");
      if (heroCaption) {
        heroCaption.style.opacity = "0";
        setTimeout(function () {
          heroCaption.textContent = next.getAttribute("data-caption");
          heroCaption.style.opacity = "1";
        }, 260);
      }
      slideIndex = nextIndex;
    }, 5000);
  }

  /* Contact form — this is a static site with no backend to receive a
     submission, so instead of failing silently we hand the message off
     to the visitor's own email client via a pre-filled mailto: link. */
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      var name = contactForm.name.value.trim();
      var email = contactForm.email.value.trim();
      var message = contactForm.message.value.trim();
      var subject = "Consultation request from " + name;
      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n\n" +
        message;
      var mailto =
        "mailto:mail@elmeksolutions.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      window.location.href = mailto;
    });
  }
})();
