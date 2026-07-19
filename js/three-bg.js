/* Elmek Solutions — Three.js hero backdrop.
   A slow-breathing wave grid of points in the brand's steel blue: reads as
   a technical mesh / flowing system, fitting an MEP consultancy. Renders
   only while the hero is on screen, follows the pointer with a gentle
   camera parallax, and renders a single static frame when the visitor
   prefers reduced motion. */
(function () {
  "use strict";

  var canvas = document.getElementById("webgl");
  if (!canvas || !window.THREE) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hero = document.getElementById("hero");

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) {
    return; /* no WebGL — hero simply shows its plain background */
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf7fafc, 8, 20);

  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 60);
  camera.position.set(0, 3.4, 9.5);
  camera.lookAt(0, 0, 0);

  /* ---- wave grid geometry ---- */
  var COLS = 130;
  var ROWS = 62;
  var SEP = 0.42;
  var COUNT = COLS * ROWS;

  var positions = new Float32Array(COUNT * 3);
  var i, x, z, ix, iz;
  i = 0;
  for (iz = 0; iz < ROWS; iz++) {
    for (ix = 0; ix < COLS; ix++) {
      positions[i] = (ix - COLS / 2) * SEP;      /* x */
      positions[i + 1] = 0;                       /* y (animated) */
      positions[i + 2] = (iz - ROWS / 2) * SEP;  /* z */
      i += 3;
    }
  }

  var geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  var material = new THREE.PointsMaterial({
    color: 0x6086ab,
    size: 0.045,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    sizeAttenuation: true
  });

  var points = new THREE.Points(geometry, material);
  scene.add(points);

  /* ---- sizing ---- */
  function resize() {
    var w = hero.offsetWidth;
    var h = hero.offsetHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  /* ---- pointer parallax ---- */
  var targetX = 0;
  var targetY = 0;
  if (!reduceMotion) {
    window.addEventListener("pointermove", function (e) {
      targetX = (e.clientX / window.innerWidth - 0.5) * 1.4;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.7;
    }, { passive: true });
  }

  /* ---- wave animation ---- */
  var pos = geometry.attributes.position.array;
  function updateWave(t) {
    var j = 0;
    var px, pz;
    for (var k = 0; k < COUNT; k++) {
      px = pos[j];
      pz = pos[j + 2];
      pos[j + 1] =
        Math.sin(px * 0.55 + t * 0.9) * 0.28 +
        Math.cos(pz * 0.45 + t * 0.65) * 0.32;
      j += 3;
    }
    geometry.attributes.position.needsUpdate = true;
  }

  var clock = new THREE.Clock();

  function renderFrame() {
    var t = clock.getElapsedTime();
    updateWave(t);
    camera.position.x += (targetX - camera.position.x) * 0.045;
    camera.position.y += (3.4 - targetY - camera.position.y) * 0.045;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }

  if (reduceMotion) {
    /* one static frame; no loop */
    updateWave(1.7);
    renderer.render(scene, camera);
    return;
  }

  /* ---- run only while hero is visible ---- */
  var rafId = null;
  function loop() {
    renderFrame();
    rafId = requestAnimationFrame(loop);
  }
  function start() { if (rafId === null) rafId = requestAnimationFrame(loop); }
  function stop() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { start(); } else { stop(); }
      });
    }, { threshold: 0 }).observe(hero);
  } else {
    start();
  }
})();
