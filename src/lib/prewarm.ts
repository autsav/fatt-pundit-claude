/**
 * Once `root` is within `margin` of the viewport, load and decode its images ahead of the scroll. Fires once.
 * Warms the cache through detached copies instead of flipping `img.loading`: the roots include React islands
 * that may not have hydrated yet, and touching their DOM causes hydration mismatches.
 */
export function prewarm(root: Element | null, margin = '150% 0px'): void {
  if (!root || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    for (const img of root.querySelectorAll('img')) {
      const copy = new Image();
      if (img.sizes) copy.sizes = img.sizes;
      if (img.srcset) copy.srcset = img.srcset;
      copy.src = img.src;
      copy.decode().catch(() => {});
    }
  }, { rootMargin: margin });
  io.observe(root);
}
