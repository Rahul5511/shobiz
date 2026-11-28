import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
  Injector,
  afterNextRender,
  inject,
} from '@angular/core';
import { NgageButton } from './button';
import { NgageIcon } from './icon';
/** Anchored, non-modal native popover. Top-layer rendering avoids scroll-container clipping. */
@Component({
  selector: 'ngage-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgageButton, NgageIcon],
  templateUrl: './popover.html',
  styleUrl: './popover.css',
})
export class NgagePopover implements AfterViewInit, OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() anchor: HTMLElement | null = null;
  @Input() heading = '';
  @Input() description = '';
  @Input() restoreFocus = true;
  @Output() dismissed = new EventEmitter<void>();
  @ViewChild('panel', { static: true }) panel!: ElementRef<HTMLElement>;
  private readonly injector = inject(Injector);
  private ready = false;
  private destroyed = false;
  private trigger: HTMLElement | null = null;
  private restoreRequested = true;
  private static sequence = 0;
  readonly titleId = 'ngage-popover-title-' + NgagePopover.sequence++;
  private readonly reposition = () => {
    if (this.isOpen) this.position();
  };
  ngAfterViewInit() {
    this.ready = true;
    window.addEventListener('resize', this.reposition);
    window.addEventListener('scroll', this.reposition, true);
    this.schedule();
  }
  ngOnChanges() {
    if (this.ready) this.schedule();
  }
  private schedule() {
    afterNextRender(
      () => {
        if (!this.destroyed) this.sync();
      },
      { injector: this.injector },
    );
  }
  private sync() {
    const panel = this.panel.nativeElement;
    if (this.isOpen && this.anchor?.isConnected) {
      this.trigger = this.anchor;
      this.restoreRequested = true;
      if (typeof panel.showPopover === 'function') {
        if (!panel.matches(':popover-open')) panel.showPopover();
      } else {
        panel.removeAttribute('popover');
        panel.setAttribute('data-open', 'true');
      }
      this.position();
      (
        panel.querySelector<HTMLElement>('[aria-pressed="true"]') ||
        panel.querySelector<HTMLElement>('[data-popover-focus]') ||
        panel.querySelector<HTMLElement>(
          'button:not([data-close]):not(:disabled),input:not(:disabled)',
        )
      )?.focus({ preventScroll: true });
    } else {
      if (typeof panel.hidePopover === 'function' && panel.matches(':popover-open'))
        panel.hidePopover();
      panel.removeAttribute('data-open');
      if (this.restoreFocus && this.restoreRequested && this.trigger?.isConnected)
        this.trigger.focus({ preventScroll: true });
      this.trigger = null;
    }
  }
  position() {
    if (!this.anchor) return;
    const bounds = this.anchor.getBoundingClientRect();
    const panel = this.panel.nativeElement;
    const gap = 8;
    if (
      bounds.bottom < 0 ||
      bounds.top > window.innerHeight ||
      bounds.right < 0 ||
      bounds.left > window.innerWidth
    ) {
      this.restoreRequested = false;
      this.dismissed.emit();
      return;
    }
    const width = panel.offsetWidth || 300;
    const height = panel.offsetHeight || 220;
    const left = Math.max(gap, Math.min(bounds.left, window.innerWidth - width - gap));
    const below = bounds.bottom + gap;
    const top =
      below + height <= window.innerHeight - gap
        ? below
        : bounds.top - height - gap >= gap
          ? bounds.top - height - gap
          : gap;
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    panel.style.maxHeight = Math.max(80, window.innerHeight - top - gap) + 'px';
  }
  onToggle(event: Event) {
    if ((event as ToggleEvent).newState === 'closed' && this.isOpen) {
      if (
        !this.panel.nativeElement.contains(document.activeElement) &&
        document.activeElement !== this.trigger
      )
        this.restoreRequested = false;
      this.dismissed.emit();
    }
  }
  @HostListener('document:pointerdown', ['$event']) outside(event: PointerEvent) {
    if (!this.isOpen) return;
    const target = event.target as Node;
    if (!this.panel.nativeElement.contains(target) && !this.anchor?.contains(target)) {
      this.restoreRequested = false;
      this.dismissed.emit();
    }
  }
  @HostListener('document:keydown', ['$event']) onKey(event: KeyboardEvent) {
    if (!this.isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.dismissed.emit();
      return;
    }
    if (
      ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) &&
      this.panel.nativeElement.contains(event.target as Node)
    ) {
      const target = event.target as HTMLInputElement;
      if (
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        (target.tagName === 'INPUT' && !['checkbox', 'radio'].includes(target.type))
      )
        return;
      const buttons = Array.from(
        this.panel.nativeElement.querySelectorAll<HTMLElement>(
          'button:not([data-close]):not(:disabled), input[type=checkbox]:not(:disabled), input[type=radio]:not(:disabled)',
        ),
      );
      if (!buttons.length) return;
      event.preventDefault();
      const index = buttons.indexOf(document.activeElement as HTMLElement);
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? buttons.length - 1
            : event.key === 'ArrowDown'
              ? (index + 1) % buttons.length
              : (index - 1 + buttons.length) % buttons.length;
      buttons[next].focus();
    }
  }
  ngOnDestroy() {
    this.destroyed = true;
    window.removeEventListener('resize', this.reposition);
    window.removeEventListener('scroll', this.reposition, true);
    const panel = this.panel.nativeElement;
    if (typeof panel.hidePopover === 'function' && panel.matches(':popover-open'))
      panel.hidePopover();
  }
}
