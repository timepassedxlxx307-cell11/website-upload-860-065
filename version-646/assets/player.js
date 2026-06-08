(function () {
    function startMoviePlayer(streamUrl) {
        var frame = document.querySelector('[data-player-frame]');
        var video = document.querySelector('[data-video-player]');
        var overlay = document.querySelector('[data-play-overlay]');
        if (!frame || !video || !streamUrl) {
            return;
        }
        var started = false;
        var hlsInstance = null;

        function requestPlay() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        function attach() {
            if (started) {
                requestPlay();
                return;
            }
            started = true;
            if (overlay) {
                overlay.classList.add('is-hidden');
                overlay.setAttribute('aria-hidden', 'true');
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    requestPlay();
                });
                requestPlay();
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.addEventListener('loadedmetadata', requestPlay, { once: true });
                requestPlay();
                return;
            }
            video.src = streamUrl;
            requestPlay();
        }

        if (overlay) {
            overlay.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                attach();
            });
        }
        frame.addEventListener('click', function () {
            if (!started) {
                attach();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.startMoviePlayer = startMoviePlayer;
})();
