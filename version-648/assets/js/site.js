(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
            button.textContent = menu.classList.contains("open") ? "×" : "☰";
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

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
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initFiltering() {
        var input = document.querySelector("[data-filter-input]");
        var region = document.querySelector("[data-filter-region]");
        var type = document.querySelector("[data-filter-type]");
        var counter = document.querySelector("[data-filter-counter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        if (!input && !region && !type) {
            return;
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : "");
            var regionValue = region ? region.value : "";
            var typeValue = type ? type.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var cardRegion = card.getAttribute("data-region") || "";
                var cardType = card.getAttribute("data-type") || "";
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedRegion = !regionValue || cardRegion === regionValue;
                var matchedType = !typeValue || cardType === typeValue;
                var matched = matchedKeyword && matchedRegion && matchedType;
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (counter) {
                counter.textContent = "显示 " + visible + " 部影片";
            }
        }

        [input, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
        applyFilter();
    }

    function initImageFallbacks() {
        var images = document.querySelectorAll("img");
        images.forEach(function (image) {
            image.addEventListener("error", function () {
                image.style.opacity = "0";
            }, { once: true });
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-hls-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var playButton = player.querySelector("[data-player-play]");
            var overlay = player.querySelector("[data-player-overlay]");
            var status = player.querySelector("[data-player-status]");
            var source = player.getAttribute("data-src");
            var hls = null;
            var loaded = false;

            if (!video || !source) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message || "";
                }
            }

            function hideOverlay() {
                if (overlay) {
                    overlay.classList.add("hidden");
                }
            }

            function showOverlay() {
                if (overlay) {
                    overlay.classList.remove("hidden");
                }
            }

            function playVideo() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        setStatus("浏览器阻止了自动播放，请再次点击播放器开始播放。");
                    });
                }
            }

            function loadSource() {
                if (loaded) {
                    playVideo();
                    return;
                }
                setStatus("正在初始化播放器…");
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        loaded = true;
                        setStatus("");
                        playVideo();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            setStatus("网络错误，正在重新加载视频源…");
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            setStatus("媒体错误，正在恢复播放器…");
                            hls.recoverMediaError();
                        } else {
                            setStatus("播放器无法加载当前 HLS 视频源。");
                            hls.destroy();
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    loaded = true;
                    video.addEventListener("loadedmetadata", function () {
                        setStatus("");
                        playVideo();
                    }, { once: true });
                } else {
                    setStatus("当前浏览器不支持 HLS 视频播放。");
                }
            }

            function togglePlayback(event) {
                if (event) {
                    event.preventDefault();
                }
                if (!loaded) {
                    loadSource();
                    return;
                }
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            }

            if (playButton) {
                playButton.addEventListener("click", togglePlayback);
            }
            if (overlay) {
                overlay.addEventListener("click", function (event) {
                    if (event.target === overlay) {
                        togglePlayback(event);
                    }
                });
            }
            video.addEventListener("click", togglePlayback);
            video.addEventListener("play", hideOverlay);
            video.addEventListener("pause", showOverlay);
            video.addEventListener("ended", showOverlay);

            var shortcuts = document.querySelectorAll("[data-player-shortcut]");
            shortcuts.forEach(function (shortcut) {
                shortcut.addEventListener("click", function (event) {
                    event.preventDefault();
                    player.scrollIntoView({ behavior: "smooth", block: "center" });
                    togglePlayback(event);
                });
            });

            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initFiltering();
        initImageFallbacks();
        initPlayers();
    });
})();
