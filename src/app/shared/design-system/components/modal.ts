import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  inject,
  output,
} from '@angular/core';
import { NgageIcon } from './icon';

/** Native dialog provides focus trapping, Escape semantics and focus restoration. */
@Component({
  selector: 'dialog[ngageModal]',
  imports: [NgageIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.aria-label]': 'heading', '[attr.aria-modal]': 'true' },
  template: `
    <header>
      <div class="titles">
        <h2>{{ heading }}</h2>
        @if (description) {
          <p>{{ description }}</p>
        }
      </div>
      <button type="button" [attr.aria-label]="closeLabel" (click)="closeRequested.emit()">
        <ngage-icon name="close" />
      </button>
    </header>
    <div class="body"><ng-content /></div>
    <ng-content select="[ngageModalFooter]" />
  `,
  styleUrl: './modal.css',
})
export class NgageModal implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) heading = '';
  @Input() description = '';
  @Input() isOpen = false;
  @Input() closeLabel = 'Close dialog';
  readonly closeRequested = output<void>();
  private readonly element = inject<ElementRef<HTMLDialogElement>>(ElementRef);
  private ready = false;

  ngAfterViewInit(): void {
    this.ready = true;
    this.syncOpen();
  }
  ngOnChanges(): void {
    if (this.ready) this.syncOpen();
  }
  ngOnDestroy(): void {
    const dialog = this.element.nativeElement;
    if (dialog.open) dialog.close();
  }
  @HostListener('cancel', ['$event'])
  onCancel(event: Event): void {
    event.preventDefault();
    this.closeRequested.emit();
  }
  @HostListener('close')
  onNativeClose(): void {
    // A form with method="dialog" may close the native dialog independently.
    if (this.isOpen && this.ready) this.closeRequested.emit();
  }
  private syncOpen(): void {
    const dialog = this.element.nativeElement;
    if (this.isOpen && !dialog.open) dialog.showModal();
    else if (!this.isOpen && dialog.open) dialog.close();
  }
}
