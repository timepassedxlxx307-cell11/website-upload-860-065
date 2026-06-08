import { H as Hls } from './hls.js';

const players = document.querySelectorAll('[data-player]');

players.forEach(function (player) {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const source = player.dataset.source;
  let attached = false;
  let hls = null;

  function hideButton() {
    if (button) {
      button.classList.add('is-hidden');
    }
  }

  function attachSource() {
    if (attached || !video || !source) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startPlayback() {
    attachSource();
    hideButton();
    if (video) {
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', hideButton);
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
