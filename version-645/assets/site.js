(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;
    let timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, currentIndex) {
        slide.classList.toggle('is-active', currentIndex === activeIndex);
      });
      dots.forEach(function (dot, currentIndex) {
        dot.classList.toggle('is-active', currentIndex === activeIndex);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');
  const grid = document.querySelector('[data-card-grid]');

  if (filterPanel && grid) {
    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    const searchInput = filterPanel.querySelector('[data-card-search]');
    const yearSelect = filterPanel.querySelector('[data-card-year]');
    const sortButtons = Array.from(filterPanel.querySelectorAll('[data-card-sort]'));
    let sortMode = 'default';

    function matchesSearch(card, query) {
      if (!query) {
        return true;
      }

      const text = [
        card.dataset.title || '',
        card.dataset.type || '',
        card.dataset.tags || '',
        card.dataset.year || ''
      ].join(' ').toLowerCase();

      return text.includes(query.toLowerCase());
    }

    function applyFilter() {
      const query = searchInput ? searchInput.value.trim() : '';
      const year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        const visible = matchesSearch(card, query) && (!year || card.dataset.year === year);
        card.classList.toggle('is-card-hidden', !visible);
      });

      const sorted = cards.slice().sort(function (a, b) {
        if (sortMode === 'views') {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }

        if (sortMode === 'likes') {
          return Number(b.dataset.likes || 0) - Number(a.dataset.likes || 0);
        }

        return 0;
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    sortButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        sortMode = button.dataset.cardSort || 'default';
        sortButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilter();
      });
    });
  }
})();
