/**
 * One behaviour for every system dialog (<dialog class="fp-dialog">), design-system.md "Dialogs".
 * - Any [data-dialog-open="<dialog id>"] opens it as a modal (focus trap, Escape and top layer are native).
 * - [data-dialog-close] inside it, or a click on the backdrop, closes it.
 * - Focus goes back to whatever opened it.
 * Delegated on the document, so triggers added later work too. Safe to call once per page.
 */
import { lockScroll, unlockScroll } from './smooth-scroll';

export function bindDialogs(doc: Document = document): void {
  const openers = new WeakMap<HTMLDialogElement, HTMLElement>();
  doc.addEventListener('click', (e) => {
    const t = e.target as Element;
    const trigger = t.closest<HTMLElement>('[data-dialog-open]');
    if (trigger) {
      const dlg = doc.getElementById(trigger.dataset.dialogOpen ?? '');
      if (dlg instanceof HTMLDialogElement && !dlg.open) {
        e.preventDefault();
        openers.set(dlg, trigger);
        dlg.showModal();
        dlg.setAttribute('data-lenis-prevent', '');
        lockScroll();
      }
      return;
    }
    const dlg = t.closest<HTMLDialogElement>('dialog.fp-dialog');
    // A click on the backdrop lands on the <dialog> itself (the panel fills its box).
    if (dlg && (t === dlg || t.closest('[data-dialog-close]'))) dlg.close();
  });
  // `close` doesn't bubble: listen in the capture phase.
  doc.addEventListener('close', (e) => {
    const dlg = e.target;
    if (dlg instanceof HTMLDialogElement) { openers.get(dlg)?.focus(); if (dlg.hasAttribute('data-lenis-prevent')) unlockScroll(); }
  }, true);
}
