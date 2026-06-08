const ready = (fn) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
};

const setQueryFromUrl = () => {
  const form = document.querySelector("[data-filter-form]");
  if (!form) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const input = form.querySelector("[data-filter-input]");
  const region = form.querySelector("[data-filter-region]");
  const type = form.querySelector("[data-filter-type]");
  const year = form.querySelector("[data-filter-year]");

  if (input && params.get("q")) {
    input.value = params.get("q");
  }

  if (region && params.get("region")) {
    region.value = params.get("region");
  }

  if (type && params.get("type")) {
    type.value = params.get("type");
  }

  if (year && params.get("year")) {
    year.value = params.get("year");
  }
};

const initNavigation = () => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
};

const initHero = () => {
  const hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = [...hero.querySelectorAll(".hero-slide")];
  const dots = [...hero.querySelectorAll(".hero-dot")];
  const next = hero.querySelector("[data-hero-next]");
  const prev = hero.querySelector("[data-hero-prev]");
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(current + 1), 5000);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  if (next) {
    next.addEventListener("click", () => {
      show(current + 1);
      start();
    });
  }

  if (prev) {
    prev.addEventListener("click", () => {
      show(current - 1);
      start();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index);
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  show(0);
  start();
};

const initFilters = () => {
  const form = document.querySelector("[data-filter-form]");
  const list = document.querySelector("[data-filter-list]");

  if (!form || !list) {
    return;
  }

  const cards = [...list.querySelectorAll(".movie-card")];
  const empty = document.querySelector("[data-empty-state]");
  const input = form.querySelector("[data-filter-input]");
  const region = form.querySelector("[data-filter-region]");
  const type = form.querySelector("[data-filter-type]");
  const year = form.querySelector("[data-filter-year]");

  const filter = () => {
    const keyword = (input?.value || "").trim().toLowerCase();
    const regionValue = region?.value || "";
    const typeValue = type?.value || "";
    const yearValue = year?.value || "";
    let visible = 0;

    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre
      ].join(" ").toLowerCase();
      const matchesKeyword = !keyword || haystack.includes(keyword);
      const matchesRegion = !regionValue || card.dataset.region === regionValue;
      const matchesType = !typeValue || card.dataset.type === typeValue;
      const matchesYear = !yearValue || card.dataset.year === yearValue;
      const isVisible = matchesKeyword && matchesRegion && matchesType && matchesYear;
      card.hidden = !isVisible;

      if (isVisible) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    filter();
  });

  [input, region, type, year].forEach((control) => {
    if (control) {
      control.addEventListener("input", filter);
      control.addEventListener("change", filter);
    }
  });

  filter();
};

const attachVideo = async (video) => {
  if (video.dataset.ready === "yes") {
    return;
  }

  const streamUrl = video.getAttribute("data-video");

  if (!streamUrl) {
    return;
  }

  video.dataset.ready = "yes";

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = streamUrl;
    return;
  }

  const Hls = window.Hls;

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({ enableWorker: true });
    hls.loadSource(streamUrl);
    hls.attachMedia(video);
    video.hls = hls;
    return;
  }

  video.src = streamUrl;
};

const initPlayers = () => {
  const players = [...document.querySelectorAll("[data-player]")];

  players.forEach((player) => {
    const video = player.querySelector("video[data-video]");
    const button = player.querySelector("[data-play]");

    if (!video) {
      return;
    }

    const begin = async () => {
      await attachVideo(video);

      if (button) {
        button.classList.add("is-hidden");
      }

      const playResult = video.play();

      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(() => {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    };

    if (button) {
      button.addEventListener("click", begin);
    }

    video.addEventListener("play", () => {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("click", () => {
      attachVideo(video);
    }, { once: true });
  });
};

ready(() => {
  setQueryFromUrl();
  initNavigation();
  initHero();
  initFilters();
  initPlayers();
});
