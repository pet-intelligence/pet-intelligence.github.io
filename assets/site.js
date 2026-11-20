(() => {
  const navToggle = document.getElementById('pi-nav-toggle');
  const quickNav = document.getElementById('quick-navigation');
  function closeNav(returnFocus = false) {
    quickNav?.removeAttribute('data-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    if (returnFocus) navToggle?.focus();
  }
  navToggle?.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    navToggle.setAttribute('aria-expanded', String(open));
    if (open) quickNav?.setAttribute('data-open', 'true');
    else closeNav();
  });
  quickNav?.addEventListener('click', event => { if (event.target.closest('a')) closeNav(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navToggle?.getAttribute('aria-expanded') === 'true') closeNav(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.pi-nav-band')) closeNav();
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', () => closeNav());
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('nome') || '').trim();
    const company = String(data.get('empresa') || '').trim();
    if (!name || !company) return;
    const topic = form.elements.desafio.selectedOptions[0]?.textContent || '';
    const message = ['Olá, Pet Intelligence!', 'Nome: ' + name, 'Negócio: ' + company,
      'Quero conversar sobre: ' + topic, String(data.get('mensagem') || '').trim()].filter(Boolean).join('\n');
    window.location.assign('https://wa.me/5511958113045?text=' + encodeURIComponent(message));
  });
})();
