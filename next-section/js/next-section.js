/* "Let's build what's next" — stacked card animation (GSAP)
   The top card swings ~150° around its bottom-right corner, then drops under gravity.
   The other cards move up a slot and the fallen card is tucked at the back. Loops forever.
   Self-contained: loads its own GSAP only if the page does not already have one.
   Pauses while the section is off-screen or the tab is hidden. No hover / cursor effects. */
(() => {
  const SELF = document.currentScript || document.querySelector('script[src*="next-section.js"]');
  const roots = document.querySelectorAll("[data-mau-next]");
  if (!roots.length) return;

  function ensureGsap(cb) {
    if (window.gsap) return cb();
    const src = SELF && SELF.src ? new URL("../vendor/gsap.min.js", SELF.src).href : "next-section/vendor/gsap.min.js";
    const s = document.createElement("script");
    s.src = src; s.onload = cb; s.onerror = () => console.warn("[next-section] could not load GSAP from", src);
    document.head.appendChild(s);
  }

  function init(root) {
    const cards = [...root.querySelectorAll(".mau-card")];
    if (cards.length < 2) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const INTERVAL = 2.6;     // seconds each card rests on top
    const FIRST_DELAY = 1.2;  // seconds after the section scrolls into view
    const SLOTS = [           // resting poses by depth (top, 2nd, 3rd, hidden spare)
      { rotation: 0 }, { rotation: 3.2 }, { rotation: 6.2 }, { rotation: 6.2 },
    ];
    const slot = i => SLOTS[Math.min(i, SLOTS.length - 1)];

    let order = [...cards], busy = false, visible = false, timer;

    const place = (card, i) => gsap.set(card, { xPercent: 0, yPercent: 0, y: 0, rotation: slot(i).rotation, zIndex: 10 - i, transformOrigin: "50% 50%" });
    order.forEach((c, i) => place(c, i));

    function next() {
      if (busy || !visible) return;
      busy = true; clearTimeout(timer);
      const top = order[0];
      const tl = gsap.timeline({
        onComplete() {
          order.push(order.shift());
          place(top, order.length - 1);
          busy = false; schedule();
        },
      });
      gsap.set(top, { transformOrigin: "100% 100%", zIndex: 30 });
      tl.to(top, { rotation: -150, duration: 1.05, ease: "power2.inOut" }, 0)
        .to(top, { rotation: -162, y: () => root.offsetHeight, duration: 0.65, ease: "power2.in" }, 1.0);
      order.slice(1).forEach((c, i) => {
        gsap.set(c, { zIndex: 10 - i });
        gsap.to(c, { rotation: slot(i).rotation, duration: 0.95, ease: "power3.inOut", delay: 0.2 });
      });
    }

    function schedule(first) {
      clearTimeout(timer);
      if (reduce || !visible) return;
      timer = setTimeout(next, (first ? FIRST_DELAY : INTERVAL) * 1000);
    }

    if (reduce) return; // static fanned stack only

    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      visible ? (!busy && schedule(true)) : clearTimeout(timer);
    }, { threshold: 0.25 }).observe(root);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearTimeout(timer); else if (!busy) schedule();
    });
  }

  ensureGsap(() => roots.forEach(init));
})();
