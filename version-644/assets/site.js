(function () {
  function each(selector, root, fn) {
    Array.prototype.forEach.call((root || document).querySelectorAll(selector), fn);
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-menu]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    show(0);
    window.setInterval(function () {
      show(active + 1);
    }, 5600);
  }

  function setupFilters() {
    var root = document.querySelector('[data-filter-root]');
    if (!root) {
      return;
    }
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
    var search = document.querySelector('[data-filter-search]');
    var year = document.querySelector('[data-filter-year]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (search && initial) {
      search.value = initial;
    }
    function value(node) {
      return node ? node.value.trim().toLowerCase() : '';
    }
    function update() {
      var q = value(search);
      var y = value(year);
      var r = value(region);
      var t = value(type);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-summary') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var matched = true;
        if (q && haystack.indexOf(q) === -1) {
          matched = false;
        }
        if (y && String(card.getAttribute('data-year') || '').toLowerCase() !== y) {
          matched = false;
        }
        if (r && String(card.getAttribute('data-region') || '').toLowerCase() !== r) {
          matched = false;
        }
        if (t && String(card.getAttribute('data-type') || '').toLowerCase() !== t) {
          matched = false;
        }
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    [search, year, region, type].forEach(function (node) {
      if (node) {
        node.addEventListener(node.tagName === 'INPUT' ? 'input' : 'change', update);
      }
    });
    update();
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector('[data-video-player]');
    var button = document.querySelector('[data-play-button]');
    if (!video || !streamUrl) {
      return;
    }
    var started = false;
    function prepare() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              video.src = streamUrl;
            }
          }
        });
      } else {
        video.src = streamUrl;
      }
    }
    function hideButton() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }
    function start() {
      if (!started) {
        started = true;
      }
      hideButton();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
    prepare();
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        start();
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', hideButton);
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
