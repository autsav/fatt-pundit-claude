/**
 * The Dubai list (ux-structure.md §7, W3). Forms only render once PUBLIC_DUBAI_LIST_ENDPOINT is set
 * (a form-to-email service sending to the verified Dubai address). Each form: checks the email,
 * shows it is busy, then says "You're on the list" or keeps the email and explains the failure.
 */
export const LIST_ENDPOINT = import.meta.env.PUBLIC_DUBAI_LIST_ENDPOINT as string | undefined;
/** One source for every "Dubai list" button. No endpoint = no list yet, so say what the button really does:
 *  it goes to the room page, whose #waitlist block points to Instagram for the opening date. */
export const listCta = (b: { id: string; shortName: string }) => ({
  href: `/${b.id}/#waitlist`,
  label: LIST_ENDPOINT ? `Join the ${b.shortName} list` : `${b.shortName}: get the opening date`,
  short: LIST_ENDPOINT ? 'Join the list' : 'Get the opening date',
});
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function bindWaitlists() {
  for (const form of document.querySelectorAll<HTMLFormElement>('form[data-waitlist]')) {
    const input = form.querySelector<HTMLInputElement>('input[type="email"]')!;
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const msg = form.querySelector<HTMLElement>('[data-wl-msg]')!;
    const say = (text: string, kind: 'error' | 'success', role: 'alert' | 'status') => {
      msg.textContent = text;
      msg.className = `fp-msg fp-msg--${kind}`;
      msg.setAttribute('role', role);
      msg.hidden = false;
    };
    const valid = () => EMAIL.test(input.value.trim());
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true' && valid()) { input.setAttribute('aria-invalid', 'false'); msg.hidden = true; }
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (btn.getAttribute('aria-busy') === 'true') return;
      if (!valid()) {
        input.setAttribute('aria-invalid', 'true');
        say('Enter an email address like name@example.com', 'error', 'alert');
        input.focus();
        return;
      }
      btn.setAttribute('aria-busy', 'true');
      try {
        const body = new FormData(form);
        body.set('email', input.value.trim());
        const res = await fetch(form.action, { method: 'POST', body, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(String(res.status));
        const done = document.createElement('p');
        done.className = 'fp-status fp-msg fp-msg--success';
        done.setAttribute('role', 'status');
        done.tabIndex = -1;
        done.innerHTML = `<strong>You're on the list.</strong>`;
        done.append(`We'll email ${input.value.trim()} when Dubai takes bookings.`);
        form.replaceWith(done);
        done.focus();
        window.dispatchEvent(new CustomEvent('fp:waitlist-joined', { detail: { list: form.dataset.list } }));
      } catch {
        say("We couldn't add you. Try again in a moment.", 'error', 'alert');
      } finally {
        btn.removeAttribute('aria-busy');
      }
    });
  }
}
