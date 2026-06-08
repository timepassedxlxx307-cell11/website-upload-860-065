(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupNavigation() {
        var button = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var stage = document.querySelector(".hero-stage");
        if (!stage) {
            return;
        }
        var slides = Array.prototype.slice.call(stage.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(stage.querySelectorAll(".hero-dot"));
        var prev = stage.querySelector(".hero-prev");
        var next = stage.querySelector(".hero-next");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function schedule() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide") || 0));
                schedule();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                schedule();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                schedule();
            });
        }
        schedule();
    }

    function setupSearch() {
        var input = document.getElementById("movieSearch");
        var select = document.getElementById("movieFilter");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var chips = Array.prototype.slice.call(document.querySelectorAll(".chip-filter"));
        var chipValue = "";
        if (!cards.length) {
            return;
        }

        function combined(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.getAttribute("data-category"),
                card.textContent
            ].join(" "));
        }

        function apply() {
            var keyword = input ? normalize(input.value) : "";
            var category = select ? normalize(select.value) : "";
            var chip = normalize(chipValue);
            cards.forEach(function (card) {
                var text = combined(card);
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (category && normalize(card.getAttribute("data-category")) !== category) {
                    ok = false;
                }
                if (chip && text.indexOf(chip) === -1) {
                    ok = false;
                }
                card.classList.toggle("is-filtered-out", !ok);
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (select) {
            select.addEventListener("change", apply);
        }
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                var active = chip.classList.contains("is-active");
                chips.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                chipValue = active ? "" : (chip.getAttribute("data-chip") || "");
                if (!active) {
                    chip.classList.add("is-active");
                }
                apply();
            });
        });
    }

    window.initDetailPlayer = function (sourceUrl) {
        var video = document.getElementById("moviePlayer");
        var layer = document.getElementById("playLayer");
        if (!video || !layer || !sourceUrl) {
            return;
        }
        var attached = false;
        var hls = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function start() {
            attach();
            layer.classList.add("is-hidden");
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    layer.classList.remove("is-hidden");
                });
            }
        }

        layer.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupSearch();
    });
}());
