import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgageAlert, NgageButton, NgageFormField, NgageInput, NgageModal } from '../index';

@Component({
  imports: [NgageAlert, NgageButton, NgageFormField, NgageInput, NgageModal],
  template: `
    <button ngageButton type="button" [disabled]="disabled()" (click)="clicks = clicks + 1">
      Save
    </button>
    <button ngageButton type="button" variant="icon-solid">Add attendee</button>
    <ngage-alert tone="negative" (dismissed)="dismissed = dismissed + 1">Save failed</ngage-alert>
    <ngage-form-field controlId="email" label="Email" hint="Required" state="error">
      <input ngageInput id="email" required aria-invalid="true" aria-describedby="email-hint" />
    </ngage-form-field>
    <dialog ngageModal heading="Confirm" [isOpen]="open()" (closeRequested)="open.set(false)">
      <input aria-label="Name" />
    </dialog>
  `,
})
class Harness {
  disabled = signal(false);
  open = signal(false);
  clicks = 0;
  dismissed = 0;
}

describe('Inactive Ngage shared components', () => {
  afterEach(() => vi.restoreAllMocks());

  it('retains native button disabled semantics and labels for icon-only buttons', async () => {
    const fixture = TestBed.createComponent(Harness);
    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll(
      'button[ngageButton]',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0].click();
    expect(fixture.componentInstance.clicks).toBe(1);
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    buttons[0].click();
    expect(fixture.componentInstance.clicks).toBe(1);
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].textContent).toContain('Add attendee');
    expect(buttons[1].getAttribute('data-variant')).toBe('icon-solid');
  });

  it('exposes dismiss intent and keeps native labels and hint associations intact', async () => {
    const fixture = TestBed.createComponent(Harness);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('ngage-alert')?.getAttribute('role')).toBe('alert');
    root.querySelector<HTMLButtonElement>('ngage-alert button')!.click();
    expect(fixture.componentInstance.dismissed).toBe(1);
    expect(root.querySelector('label')?.htmlFor).toBe('email');
    expect(root.querySelector('#email-hint')?.textContent).toContain('Required');
    expect(root.querySelector('#email')?.classList.contains('ngage-control')).toBe(true);
  });

  it('opens modally and lets the parent handle Escape and close-button requests', async () => {
    // jsdom has no top-layer layout or browser focus trap; these are browser responsibilities.
    const originalShow = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
    const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');
    const show = vi.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    const close = vi.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: show,
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value: close,
    });
    try {
      const fixture = TestBed.createComponent(Harness);
      await fixture.whenStable();
      const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
      expect(show).not.toHaveBeenCalled();
      fixture.componentInstance.open.set(true);
      await fixture.whenStable();
      expect(show).toHaveBeenCalledTimes(1);
      expect(dialog.getAttribute('aria-label')).toBe('Confirm');
      const cancel = new Event('cancel', { cancelable: true });
      dialog.dispatchEvent(cancel);
      await fixture.whenStable();
      expect(cancel.defaultPrevented).toBe(true);
      expect(fixture.componentInstance.open()).toBe(false);
      expect(close).toHaveBeenCalledTimes(1);
      fixture.componentInstance.open.set(true);
      await fixture.whenStable();
      dialog.querySelector('button')!.click();
      await fixture.whenStable();
      expect(fixture.componentInstance.open()).toBe(false);
      expect(close).toHaveBeenCalledTimes(2);
      fixture.destroy();
    } finally {
      if (originalShow)
        Object.defineProperty(HTMLDialogElement.prototype, 'showModal', originalShow);
      else Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
      if (originalClose) Object.defineProperty(HTMLDialogElement.prototype, 'close', originalClose);
      else Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
    }
  });
});
