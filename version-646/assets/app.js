(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var panel = document.querySelector('[data-mobile-menu]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = all('[data-hero-slide]', slider);
        var dots = all('[data-hero-dot]', slider);
        var previous = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function move(step) {
            show(index + step);
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                move(-1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                move(1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setFilters() {
        var searchInputs = all('[data-live-search]');
        var filterButtons = all('[data-filter-button]');
        var cards = all('[data-card]');
        var emptyState = document.querySelector('[data-empty-state]');
        if (!cards.length) {
            return;
        }
        var currentFilter = 'all';

        function queryValue() {
            for (var i = 0; i < searchInputs.length; i += 1) {
                if (searchInputs[i].value) {
                    return normalize(searchInputs[i].value);
                }
            }
            return '';
        }

        function apply() {
            var query = queryValue();
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || ''));
                var category = card.getAttribute('data-category') || '';
                var matchesText = !query || text.indexOf(query) !== -1;
                var matchesCategory = currentFilter === 'all' || category === currentFilter;
                var show = matchesText && matchesCategory;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        searchInputs.forEach(function (input) {
            input.addEventListener('input', apply);
        });
        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                currentFilter = button.getAttribute('data-filter-button') || 'all';
                filterButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                apply();
            });
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && searchInputs.length) {
            searchInputs[0].value = query;
        }
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setMobileMenu();
        setHeroSlider();
        setFilters();
    });
})();
