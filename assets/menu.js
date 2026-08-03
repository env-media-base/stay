/* かくれ宿CHIBA — ☰ で開くサイトマップ（全ページ共通）
   2026-08-03 追加。ヘッダーの3本線を押すと、全ページを「誰向けか」でグループ分けした
   一覧が全画面で開く。スマホ・PCとも同じ挙動。 */
(function () {
  var btn = document.getElementById('hamburger');
  var menu = document.getElementById('siteMenu');
  if (!btn || !menu) return;

  var lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    menu.classList.add('is-open');
    btn.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('has-sitemap-open');
    var close = menu.querySelector('.sitemap-close');
    if (close) close.focus();
  }

  function close() {
    menu.classList.remove('is-open');
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('has-sitemap-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  btn.addEventListener('click', function () {
    if (menu.classList.contains('is-open')) { close(); } else { open(); }
  });

  // 閉じるボタン、または一覧のリンクを押したら閉じる
  menu.addEventListener('click', function (e) {
    if (e.target.closest('.sitemap-close') || e.target.closest('a')) close();
  });

  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === 'Esc') && menu.classList.contains('is-open')) close();
  });
})();
