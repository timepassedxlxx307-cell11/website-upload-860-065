(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var scope = panel.closest("main") || document;
      var search = panel.querySelector("[data-filter-search]");
      var genre = panel.querySelector("[data-filter-genre]");
      var year = panel.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

      function applyFilter() {
        var q = search ? search.value.trim().toLowerCase() : "";
        var g = genre ? genre.value.trim() : "";
        var y = year ? year.value.trim() : "";
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-tags") || ""
          ].join(" ").toLowerCase();
          var matchQ = !q || text.indexOf(q) !== -1;
          var matchG = !g || text.indexOf(g.toLowerCase()) !== -1;
          var matchY = !y || text.indexOf(y.toLowerCase()) !== -1;
          card.classList.toggle("is-filter-hidden", !(matchQ && matchG && matchY));
        });
      }

      [search, genre, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    });
  });
})();

function initPlayer(source) {
  var video = document.getElementById("movie-player");
  var overlay = document.getElementById("play-overlay");
  if (!video || !overlay || !source) {
    return;
  }
  var started = false;
  var hls = null;

  function playVideo() {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function begin() {
    overlay.classList.add("is-hidden");
    if (started) {
      playVideo();
      return;
    }
    started = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      playVideo();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      return;
    }
    video.src = source;
    playVideo();
  }

  overlay.addEventListener("click", begin);
  video.addEventListener("click", function () {
    if (!started || video.paused) {
      begin();
    }
  });
  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
