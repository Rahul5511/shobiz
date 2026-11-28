import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgagePopover } from './popover';
@Component({
  imports: [NgagePopover],
  template: `<button #trigger (click)="open.set(!open())">Open choices</button
    ><input aria-label="Outside input" /><ngage-popover
      heading="Choose permission"
      [isOpen]="open()"
      [anchor]="trigger"
      (dismissed)="open.set(false)"
      ><button aria-pressed="true">Manage</button><button>View</button
      ><button>None</button></ngage-popover
    >`,
})
class Harness {
  readonly open = signal(false);
}
describe('Ngage anchored popover', () => {
  afterEach(() => vi.restoreAllMocks());
  it('clamps to the viewport and positions above an anchor near the bottom edge', async () => {
    const fixture = TestBed.createComponent(Harness);
    fixture.detectChanges();
    await fixture.whenStable();
    const anchor = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const panel = fixture.nativeElement.querySelector('[popover]') as HTMLElement;
    vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
      left: window.innerWidth - 20,
      right: window.innerWidth,
      top: window.innerHeight - 30,
      bottom: window.innerHeight - 10,
      width: 20,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    Object.defineProperty(panel, 'offsetWidth', { value: 300 });
    Object.defineProperty(panel, 'offsetHeight', { value: 220 });
    anchor.click();
    await fixture.whenStable();
    expect(parseFloat(panel.style.left) + 300).toBeLessThanOrEqual(window.innerWidth - 8);
    expect(parseFloat(panel.style.top)).toBeGreaterThanOrEqual(8);
    expect(parseFloat(panel.style.top) + 220).toBeLessThan(window.innerHeight);
    fixture.destroy();
  });
  it('supports arrow keys and Escape with trigger focus restoration', async () => {
    const fixture = TestBed.createComponent(Harness);
    fixture.detectChanges();
    await fixture.whenStable();
    const anchor = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    anchor.click();
    await fixture.whenStable();
    const options = fixture.nativeElement.querySelectorAll(
      'ngage-popover .popover-body button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(document.activeElement).toBe(options[0]);
    options[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(options[1]);
    options[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(document.activeElement).toBe(anchor);
    fixture.destroy();
  });
});
