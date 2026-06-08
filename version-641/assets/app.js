function ready(callback) {
    if (document.readyState !== "loading") {
        callback();
    } else {
        document.addEventListener("DOMContentLoaded", callback);
    }
}

function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
    });
}

function setupHero() {
    var root = document.getElementById("heroSlider");
    if (!root) {
        return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
        return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === index);
        });
    }
    function start() {
        stop();
        timer = window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }
    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }
    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            show(Number(dot.getAttribute("data-hero-dot")) || 0);
            start();
        });
    });
    if (prev) {
        prev.addEventListener("click", function () {
            show(index - 1);
            start();
        });
    }
    if (next) {
        next.addEventListener("click", function () {
            show(index + 1);
            start();
        });
    }
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
}

function normalize(value) {
    return String(value || "").trim().toLowerCase();
}

function setupSearch() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-search-panel]"));
    panels.forEach(function (panel) {
        var input = panel.querySelector("[data-search-input]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var categorySelect = panel.querySelector("[data-filter-category]");
        var clear = panel.querySelector("[data-clear-search]");
        var noResult = panel.querySelector("[data-no-result]");
        var scope = panel.nextElementSibling || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .compact-card"));
        function apply() {
            var keyword = normalize(input && input.value);
            var typeValue = normalize(typeSelect && typeSelect.value);
            var yearValue = normalize(yearSelect && yearSelect.value);
            var categoryValue = normalize(categorySelect && categorySelect.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-category")
                ].join(" "));
                var matched = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
                    matched = false;
                }
                if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
                    matched = false;
                }
                if (categoryValue && normalize(card.getAttribute("data-category")) !== categoryValue) {
                    matched = false;
                }
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (noResult) {
                noResult.hidden = visible !== 0;
            }
        }
        [input, typeSelect, yearSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        if (clear) {
            clear.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (typeSelect) {
                    typeSelect.value = "";
                }
                if (yearSelect) {
                    yearSelect.value = "";
                }
                if (categorySelect) {
                    categorySelect.value = "";
                }
                apply();
            });
        }
    });
}

function initMoviePlayer(streamUrl, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) {
        return;
    }
    var attached = false;
    function attach() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }
    function play() {
        attach();
        button.classList.add("is-hidden");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    }
    button.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
}

ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
});
