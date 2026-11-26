import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgageAvatar, NgageChoice, NgageChip, NgageNav, NgageTag } from './primitives';
import { NgageIcon } from './icon';

@Component({
  imports: [
    ReactiveFormsModule,
    NgageChoice,
    NgageChip,
    NgageNav,
    NgageTag,
    NgageAvatar,
    NgageIcon,
  ],
  template: `
    <label>Enabled<input type="checkbox" ngageChoice="switch" [formControl]="enabled" /></label>
    <button ngageChip [selected]="selected()" (click)="selected.set(!selected())">Segment</button>
    <button ngageNav [selected]="selected()">Overview</button>
    <ngage-tag
      [removable]="true"
      [disabled]="disabled()"
      removeLabel="Remove segment"
      (removed)="removed = removed + 1"
      >Segment</ngage-tag
    >
    <ngage-avatar label="Demo User" initials="DU" [src]="photo()" />
    <ngage-icon name="add" [tone]="disabled() ? 'disabled' : 'brand'" />
  `,
})
class Harness {
  readonly enabled = new FormControl(false, { nonNullable: true });
  readonly selected = signal(false);
  readonly disabled = signal(false);
  readonly photo = signal('test-photo.png');
  removed = 0;
}

describe('Consolidated design primitives', () => {
  it('keeps native selection, disabled and form reset behavior for switches', async () => {
    const fixture = TestBed.createComponent(Harness);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('role')).toBe('switch');
    input.click();
    expect(fixture.componentInstance.enabled.value).toBe(true);
    fixture.componentInstance.enabled.disable();
    await fixture.whenStable();
    input.click();
    expect(input.disabled).toBe(true);
    expect(fixture.componentInstance.enabled.value).toBe(true);
    fixture.componentInstance.enabled.enable();
    fixture.componentInstance.enabled.reset();
    await fixture.whenStable();
    expect(input.checked).toBe(false);
  });

  it('updates chip/navigation state and emits removal only while enabled', async () => {
    const fixture = TestBed.createComponent(Harness);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const chip = root.querySelector<HTMLButtonElement>('[ngageChip]')!;
    expect(chip.getAttribute('aria-pressed')).toBe('false');
    chip.click();
    await fixture.whenStable();
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('[ngageNav]')!.getAttribute('aria-current')).toBe('page');
    const remove = root.querySelector<HTMLButtonElement>('.ngage-tag-remove')!;
    remove.click();
    expect(fixture.componentInstance.removed).toBe(1);
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    remove.click();
    expect(fixture.componentInstance.removed).toBe(1);
  });

  it('falls back after a broken avatar and retries a different image', async () => {
    const fixture = TestBed.createComponent(Harness);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector('ngage-avatar img')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(root.querySelector('ngage-avatar')!.textContent).toContain('DU');
    fixture.componentInstance.photo.set('replacement.png');
    await fixture.whenStable();
    expect(root.querySelector('ngage-avatar img')!.getAttribute('src')).toBe('replacement.png');
  });

  it('uses the same exported geometry when an icon changes tone', async () => {
    const fixture = TestBed.createComponent(Harness);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const icon = root.querySelector('ngage-icon')!;
    const mask = icon.querySelector('span')!.getAttribute('style');
    expect(mask).toContain('add-01-stroke-rounded.svg');
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    expect(icon.getAttribute('data-tone')).toBe('disabled');
    expect(icon.querySelector('span')!.getAttribute('style')).toBe(mask);
  });
});
