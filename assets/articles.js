/* Small, progressively enhanced archive search. Links retain shareable filters. */
(function () {
  var cards = Array.from(document.querySelectorAll('#articleCards .k-read'));
  var form = document.getElementById('articleSearch');
  var input = document.getElementById('articleKeyword');
  var note = document.getElementById('filterNote');
  var empty = document.getElementById('emptyArticles');
  if (!cards.length || !form || !input || !note) return;
  var params = new URLSearchParams(location.search);
  function normalise(value) { return value.normalize('NFKC').toLocaleLowerCase().trim(); }
  function render() {
    var kind = params.get('kind') || '';
    var tag = params.get('tag') || '';
    var query = params.get('q') || '';
    var words = normalise(query).split(/\s+/).filter(Boolean);
    input.value = query;
    var shown = 0;
    cards.forEach(function (card) {
      var tags = card.dataset.tags.split(' ');
      var text = normalise(card.textContent + ' ' + card.dataset.tags);
      var matches = (!kind || card.dataset.kind === kind) && (!tag || tags.includes(tag)) && words.every(function (word) { return text.includes(word); });
      card.hidden = !matches;
      if (matches) shown++;
    });
    document.querySelectorAll('[data-filter]').forEach(function (link) {
      var active = link.dataset.filter === kind && !tag;
      link.classList.toggle('is-on', active);
      if (active) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
      var next = new URLSearchParams(params);
      next.delete('tag');
      if (link.dataset.filter) next.set('kind', link.dataset.filter); else next.delete('kind');
      link.href = 'articles.html' + (next.size ? '?' + next.toString() : '');
    });
    var criteria = [tag && 'テーマ「' + tag + '」', query && 'キーワード「' + query + '」'].filter(Boolean).join('・');
    note.textContent = (criteria ? criteria + ' ／ ' : '') + shown + '件の読みもの';
    if (params.size) {
      var reset = document.createElement('a');
      reset.href = 'articles.html'; reset.textContent = 'すべて表示';
      reset.style.marginLeft = '20px'; reset.style.textDecoration = 'underline';
      note.appendChild(reset);
    }
    empty.hidden = shown !== 0;
  }
  function update() {
    history.replaceState(null, '', location.pathname + (params.size ? '?' + params.toString() : ''));
    render();
  }
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    if (query) params.set('q', query); else params.delete('q');
    update();
  });
  document.querySelectorAll('[data-filter]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); params.delete('tag');
      if (link.dataset.filter) params.set('kind', link.dataset.filter); else params.delete('kind');
      update();
    });
  });
  window.addEventListener('popstate', function () { params = new URLSearchParams(location.search); render(); });
  render();
})();
