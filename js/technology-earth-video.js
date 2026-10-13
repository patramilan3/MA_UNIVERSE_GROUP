/* =========================================================
   SECTION 05 — EARTH VIDEO REVEAL
   Isolated to #technology. No global scroll/navigation behavior.
========================================================= */
(() => {
  const section = document.getElementById("technology");
  const earth = document.getElementById("technologyEarthWrap");
  const windowEl = document.getElementById("technologyEarthVideo");
  const video = document.getElementById("technologyEarthFilm");

  if (!section || !earth || !windowEl || !video) return;

  let hasRun = false;
  let revealTimer = null;

  const reset = () => {
    if (revealTimer) {
      clearTimeout(revealTimer);
      revealTimer = null;
    }
    earth.classList.remove("is-animating", "is-video-live");
    windowEl.classList.remove("is-revealed");
    video.pause();
    try { video.currentTime = 0; } catch (_) {}
    void earth.offsetWidth;
  };

  const revealVideo = () => {
    if (windowEl.classList.contains("is-revealed")) return;
    windowEl.classList.add("is-revealed");
    earth.classList.add("is-video-live");
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise && playPromise.catch) playPromise.catch(() => {});
  };

  const run = () => {
    reset();
    requestAnimationFrame(() => {
      earth.classList.add("is-animating");
      revealTimer = setTimeout(revealVideo, 4050);
    });
  };

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.35 && !hasRun) {
      hasRun = true;
      run();
    } else if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
      hasRun = false;
      reset();
    }
  }, { threshold: [0, 0.35, 0.6] });

  observer.observe(section);

  earth.addEventListener("animationend", (event) => {
    if (event.animationName === "technologyEarthRoll") {
      revealVideo();
    }
  });
})();
