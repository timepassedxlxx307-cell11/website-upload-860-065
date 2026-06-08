(function () {
    var root = document.documentElement.getAttribute("data-root") || "./";

    function goToSearch(query) {
        var value = (query || "").trim();
        var target = root + "search.html";
        if (value) {
            target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
    }

    function setupGlobalSearch() {
        document.querySelectorAll(".global-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                goToSearch(input ? input.value : "");
            });
        });
    }

    function setupMobileMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var index = 0;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function uniqueValues(cards, key) {
        var map = {};
        cards.forEach(function (card) {
            var value = card.getAttribute("data-" + key) || "";
            if (value) {
                map[value] = true;
            }
        });
        return Object.keys(map).sort(function (a, b) {
            return String(b).localeCompare(String(a), "zh-CN");
        });
    }

    function fillSelect(select, cards) {
        var key = select.getAttribute("data-filter");
        uniqueValues(cards, key).forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        var grid = document.querySelector("[data-filter-grid]");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var search = document.querySelector(".local-search");
        var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));

        selects.forEach(function (select) {
            fillSelect(select, cards);
        });

        function apply() {
            var term = search ? search.value.trim().toLowerCase() : "";
            var filters = {};
            selects.forEach(function (select) {
                filters[select.getAttribute("data-filter")] = select.value;
            });
            cards.forEach(function (card) {
                var matched = true;
                if (term) {
                    matched = (card.getAttribute("data-search") || "").toLowerCase().indexOf(term) !== -1;
                }
                Object.keys(filters).forEach(function (key) {
                    if (filters[key] && card.getAttribute("data-" + key) !== filters[key]) {
                        matched = false;
                    }
                });
                card.classList.toggle("is-hidden", !matched);
            });
        }

        if (search) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                search.value = q;
            }
            search.addEventListener("input", apply);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
        apply();
    }

    setupGlobalSearch();
    setupMobileMenu();
    setupHero();
    setupFilters();
})();
