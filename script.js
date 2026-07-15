/* Aurelian Roast - interaction layer */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const backToTop = document.querySelector('.back-to-top');
  const themeToggle = document.querySelector('.theme-toggle');

  // A rotating phrase gives the opening a little movement without delaying the page.
  const typingTarget = document.querySelector('#typing-text');
  const phrases = ['Fresh ideas', 'Slow moments', 'Exceptional coffee'];
  let phraseIndex = 0;
  const typePhrase = () => {
    const phrase = phrases[phraseIndex]; let character = 0;
    const type = () => {
      typingTarget.textContent = phrase.slice(0, character++);
      if (character <= phrase.length) setTimeout(type, 65);
      else setTimeout(() => { phraseIndex = (phraseIndex + 1) % phrases.length; typePhrase(); }, 1900);
    };
    type();
  };
  typePhrase();

  // Restore a visitor's colour preference before they start exploring.
  const savedTheme = localStorage.getItem('aurelian-theme');
  if (savedTheme === 'dark') { document.body.classList.add('dark'); themeToggle.textContent = '☀'; }
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    themeToggle.textContent = isDark ? '☀' : '☾';
    localStorage.setItem('aurelian-theme', isDark ? 'dark' : 'light');
  });

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open'); navToggle.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false');
  }));

  const updateScrollUI = () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
    backToTop.classList.toggle('show', window.scrollY > 550);
  };
  window.addEventListener('scroll', updateScrollUI, { passive: true }); updateScrollUI();
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Subtle reveal animation, disabled automatically for visitors who prefer reduced motion.
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Highlight the section currently in view.
  const navItems = [...document.querySelectorAll('.nav-links a')];
  const sections = [...document.querySelectorAll('main section[id], header[id]')];
  const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) navItems.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  }), { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach(section => sectionObserver.observe(section));

  // Menu categories.
  document.querySelectorAll('.menu-tab').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.menu-tab').forEach(tab => tab.classList.toggle('active', tab === button));
    document.querySelectorAll('.menu-list').forEach(list => list.classList.toggle('active', list.id === `${button.dataset.menu}-menu`));
  }));

  // Gallery filtering preserves the masonry flow without a library.
  document.querySelectorAll('.gallery-filter').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.gallery-filter').forEach(filter => filter.classList.toggle('active', filter === button));
    document.querySelectorAll('.gallery-item').forEach(item => item.classList.toggle('is-hidden', button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter));
  }));

  // A responsive carousel for all six customer stories.
  const track = document.querySelector('.review-track');
  let slideIndex = 0;
  const moveReviews = direction => {
    const cards = [...track.children];
    const visible = window.innerWidth <= 700 ? 1 : 3;
    slideIndex = (slideIndex + direction + (cards.length - visible + 1)) % (cards.length - visible + 1);
    const gap = 17;
    const cardWidth = cards[0].getBoundingClientRect().width + gap;
    track.style.transform = `translateX(-${slideIndex * cardWidth}px)`;
  };
  document.querySelector('.next').addEventListener('click', () => moveReviews(1));
  document.querySelector('.prev').addEventListener('click', () => moveReviews(-1));
  window.addEventListener('resize', () => { slideIndex = 0; track.style.transform = 'translateX(0)'; });

  // Count hero figures only once as they enter view.
  const stats = document.querySelector('.hero-stats');
  const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('[data-count]').forEach(counter => {
      const target = Number(counter.dataset.count); const isDecimal = counter.dataset.decimal === 'true'; const started = performance.now();
      const tick = now => { const progress = Math.min((now - started) / 1300, 1); const value = target * (1 - Math.pow(1 - progress, 3)); counter.textContent = isDecimal ? value.toFixed(1) : Math.floor(value); if (progress < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    counterObserver.unobserve(entry.target);
  }), { threshold: .65 });
  counterObserver.observe(stats);

  const toast = document.querySelector('.toast');
  const showToast = () => { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 4500); };
  const reservationForm = document.querySelector('#reservation-form');
  reservationForm.querySelector('[name="date"]').min = new Date().toISOString().split('T')[0];
  reservationForm.addEventListener('submit', event => {
    event.preventDefault(); const message = reservationForm.querySelector('.form-message');
    if (!reservationForm.checkValidity()) { message.textContent = 'Please complete each required field with valid details.'; reservationForm.reportValidity(); return; }
    message.textContent = ''; reservationForm.reset(); showToast();
  });

  document.querySelector('#newsletter-form').addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget; const message = form.querySelector('.newsletter-message');
    if (!form.checkValidity()) { message.textContent = 'Please enter a valid email address.'; form.reportValidity(); return; }
    message.textContent = 'You are on the list — welcome.'; form.reset();
  });
  document.querySelector('#year').textContent = new Date().getFullYear();
  window.addEventListener('load', () => document.querySelector('.page-loader').classList.add('done'));
});
