(function () {
    var box = document.querySelector("[data-player]");
    if (!box) {
        return;
    }

    var video = box.querySelector("video");
    var overlay = box.querySelector(".player-overlay");
    if (!video || !overlay) {
        return;
    }

    var stream = video.getAttribute("data-stream");
    var loaded = false;
    var hls = null;

    function startPlayback() {
        if (!stream) {
            return;
        }
        overlay.classList.add("is-hidden");
        video.controls = true;

        if (!loaded) {
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    overlay.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
        if (!loaded) {
            startPlayback();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
})();
