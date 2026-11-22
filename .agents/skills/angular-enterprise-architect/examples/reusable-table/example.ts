import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface SummaryRow {
  readonly id: string;
  readonly label: string;
  readonly status: string;
}

@Component({
  selector: 'app-summary-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section [attr.aria-label]="caption()" [attr.aria-busy]="loading()">
      @if (loading()) {
        <p role="status">Loading records...</p>
      } @else if (error()) {
        <p role="alert">{{ error() }}</p>
        <button type="button" (click)="retryRequested.emit()">Try again</button>
      } @else if (!rows().length) {
        <p>{{ emptyMessage() }}</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <caption>
              {{
                caption()
              }}
            </caption>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Status</th>
                @if (canOpen()) {
                  <th scope="col">Actions</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.id) {
                <tr>
                  <th scope="row">{{ row.label }}</th>
                  <td>{{ row.status }}</td>
                  @if (canOpen()) {
                    <td>
                      <button
                        type="button"
                        [attr.aria-label]="'Open ' + row.label"
                        (click)="openRequested.emit(row.id)"
                      >
                        Open
                      </button>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class SummaryTable {
  readonly rows = input.required<readonly SummaryRow[]>();
  readonly caption = input.required<string>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly emptyMessage = input('No records found.');
  readonly canOpen = input(false);
  readonly openRequested = output<string>();
  readonly retryRequested = output<void>();
}
