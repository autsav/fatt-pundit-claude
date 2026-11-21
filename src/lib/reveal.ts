/**
 * Content reveals: anything with .fp-reveal rises into place once, as it comes on screen.
 * The CSS (components.css) hides nothing until this has run, so no-JS and calm mode see
 * everything in place. Call once per page.
 */
import { isCalm } from './motion-tokens';

export function bindReveals(selector = '.fp-reveal'): void {
  const els = document.querySelectorAll<HTMLElement>(selector);
  if (!els.length || isCalm() || !('IntersectionObserver' in window)) return;
  document.documentElement.dataset.reveal = '';
  // Any pixel past the bottom 12% of the screen counts (the same rule as the comic's panels).
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  els.forEach((el) => io.observe(el));
}
