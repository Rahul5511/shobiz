import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-brand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="brand-symbol" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span>Event<span class="font-normal">Flow</span><span class="brand-dot">.</span></span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 1.55rem;
      font-weight: 750;
      letter-spacing: -0.06em;
    }
    .brand-symbol {
      display: grid;
      grid-template-columns: repeat(2, 0.5rem);
      gap: 0.2rem;
      transform: rotate(-8deg);
    }
    i {
      height: 0.5rem;
      border-radius: 0.12rem;
      background: currentColor;
    }
    i:last-child {
      opacity: 0.45;
    }
    .brand-dot {
      color: var(--color-brand-accent);
    }
  `,
})
export class Brand {}
