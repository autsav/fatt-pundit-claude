/** Once `root` is within `margin` of the viewport, load and decode its images ahead of the scroll. Fires once. */
export function prewarm(root: Element | null, margin = '150% 0px'): void {
  if (!root || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    for (const img of root.querySelectorAll('img')) {
      img.loading = 'eager';
      img.decode().catch(() => {});
    }
  }, { rootMargin: margin });
  io.observe(root);
}
