(function () {
  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  ready(() => {
    const body = document.body;
    const main = document.getElementById("main");
    const masthead = document.querySelector(".masthead");

    if (main && !document.querySelector(".skip-link")) {
      const skipLink = document.createElement("a");
      skipLink.className = "skip-link";
      skipLink.href = "#main";
      skipLink.textContent = "Skip to content";
      body.prepend(skipLink);
    }

    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.setAttribute("aria-hidden", "true");
    progress.innerHTML = '<div class="scroll-progress__bar"></div>';
    body.prepend(progress);

    const progressBar = progress.querySelector(".scroll-progress__bar");
    const backToTop = document.createElement("button");
    backToTop.className = "back-to-top";
    backToTop.type = "button";
    backToTop.setAttribute("aria-label", "Back to top");
    backToTop.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
    body.append(backToTop);

    const normalizePath = (url) => {
      const path = new URL(url, window.location.origin).pathname.replace(/\/index\.html$/, "/");
      return path.endsWith("/") ? path : `${path}/`;
    };

    const currentPath = normalizePath(window.location.href);
    document.querySelectorAll(".greedy-nav a[href]").forEach((link) => {
      if (normalizePath(link.href) === currentPath) {
        link.setAttribute("aria-current", "page");
      }
    });

    document.querySelectorAll('a[href^="http"]').forEach((link) => {
      if (link.hostname !== window.location.hostname) {
        link.rel = "noopener noreferrer";
        link.target = "_blank";
      }
    });

    const updateScrollState = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0;

      progressBar.style.width = `${percent}%`;
      masthead?.classList.toggle("is-scrolled", scrollTop > 12);
      backToTop.classList.toggle("is-visible", scrollTop > 480);
    };

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const revealTargets = document.querySelectorAll(".page__content > *, .archive .list__item, .archive .grid__item");
    if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

      revealTargets.forEach((element) => {
        element.classList.add("js-reveal");
        observer.observe(element);
      });
    } else {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
    }

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
  });
})();
