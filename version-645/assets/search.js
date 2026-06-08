(function () {
  const movies = Array.isArray(window.MOVIES) ? window.MOVIES : [];
  const input = document.querySelector('[data-search-input]');
  const form = document.querySelector('[data-search-form]');
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');
  const sortSelect = document.querySelector('[data-search-sort]');
  const categorySelect = document.querySelector('[data-search-category]');
  const params = new URLSearchParams(window.location.search);

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatWan(value) {
    return (Number(value || 0) / 10000).toFixed(1) + '万';
  }

  function card(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="movie-cover-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '    <img class="movie-cover" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="movie-badge">' + escapeHtml(movie.categoryName) + '</span>',
      '    <span class="movie-play-mark">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-card-meta">',
      '      <a href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.categoryName) + '</a>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.description) + '</p>',
      '    <div class="movie-stats">',
      '      <span>' + formatWan(movie.views) + '播放</span>',
      '      <span>' + formatWan(movie.likes) + '点赞</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function scoreMovie(movie, query) {
    if (!query) {
      return 1;
    }

    const fields = [
      movie.title,
      movie.description,
      movie.categoryName,
      movie.type,
      movie.region,
      movie.year,
      movie.genre,
      Array.isArray(movie.tags) ? movie.tags.join(' ') : ''
    ];

    const text = fields.join(' ').toLowerCase();
    const lowerQuery = query.toLowerCase();

    if (String(movie.title).toLowerCase().includes(lowerQuery)) {
      return 8;
    }

    if (text.includes(lowerQuery)) {
      return 4;
    }

    return 0;
  }

  function applySearch() {
    const query = input ? input.value.trim() : '';
    const sort = sortSelect ? sortSelect.value : 'relevance';
    const category = categorySelect ? categorySelect.value : '';

    let matched = movies
      .map(function (movie) {
        return {
          movie: movie,
          score: scoreMovie(movie, query)
        };
      })
      .filter(function (item) {
        return item.score > 0 && (!category || item.movie.category === category);
      });

    matched.sort(function (a, b) {
      if (sort === 'popular') {
        return Number(b.movie.views || 0) - Number(a.movie.views || 0);
      }

      if (sort === 'latest') {
        return String(b.movie.year || '').localeCompare(String(a.movie.year || '')) || String(b.movie.id).localeCompare(String(a.movie.id));
      }

      if (sort === 'likes') {
        return Number(b.movie.likes || 0) - Number(a.movie.likes || 0);
      }

      return b.score - a.score || Number(b.movie.views || 0) - Number(a.movie.views || 0);
    });

    const display = matched.slice(0, 120).map(function (item) {
      return card(item.movie);
    }).join('\n');

    if (results) {
      results.innerHTML = display || '<div class="empty-state">没有找到匹配内容</div>';
    }

    if (status) {
      status.textContent = query ? '搜索结果' : '热门作品';
    }
  }

  if (input) {
    input.value = params.get('q') || '';
    input.addEventListener('input', applySearch);
  }

  if (sortSelect) {
    sortSelect.value = params.get('sort') || sortSelect.value;
    sortSelect.addEventListener('change', applySearch);
  }

  if (categorySelect) {
    categorySelect.value = params.get('category') || categorySelect.value;
    categorySelect.addEventListener('change', applySearch);
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applySearch();
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.set('q', input ? input.value.trim() : '');
      history.replaceState(null, '', 'search.html?' + nextParams.toString());
    });
  }

  applySearch();
})();
