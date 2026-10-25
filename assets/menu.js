/* Shared accessible menu on every page. */
(function () {
  var button = document.getElementById('hamburger');
  var menu = document.getElementById('siteMenu');
  var main = document.getElementById('main');
  if (!button || !menu) return;
  var lastFocus;
  function close() {
    menu.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('has-sitemap-open');
    if (main) main.inert = false;
    if (lastFocus) lastFocus.focus();
  }
  function open() {
    lastFocus = document.activeElement;
    menu.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    document.body.classList.add('has-sitemap-open');
    if (main) main.inert = true;
    menu.querySelector('.sitemap-close').focus();
  }
  button.addEventListener('click', function () { menu.classList.contains('is-open') ? close() : open(); });
  menu.addEventListener('click', function (event) { if (event.target.closest('.sitemap-close, a')) close(); });
  document.addEventListener('keydown', function (event) {
    if (!menu.classList.contains('is-open')) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'Tab') {
      var links = Array.from(menu.querySelectorAll('a[href], button:not([disabled])'));
      var first = links[0], last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();
