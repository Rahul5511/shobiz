import { NgageButton, NgageInput, NgageTag, NgageNav } from '../../design-system/index';
import { ExportContext } from '../../workspace/models/review.models';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { NgageIcon, NgageIconName } from '../../design-system';
import { exportTable } from '../../utils/platform-admin/export';
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [NgageIcon],
  host: { 'aria-hidden': 'true' },
  styles: `
    :host {
      display: inline-flex;
      width: 18px;
      height: 18px;
      flex: 0 0 18px;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    svg {
      display: block;
      flex: none;
    }
  `,
  template: `@if (exported[name]; as glyph) {
      <ngage-icon [name]="glyph" />
    } @else {
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path [attr.d]="paths[name] || paths.view" />
      </svg>
    }`,
})
export class IconComponent {
  @Input() name = 'view';
  readonly exported: Partial<Record<string, NgageIconName>> = {
    plus: 'add',
    chevron: 'chevron-down',
    next: 'arrow-right-01',
    prev: 'arrow-left-01',
    check: 'check',
    home: 'home-01',
    search: 'search-01',
    password: 'user-lock-02',
  };
  paths: any = {
    dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    clients: 'M3 21V7h12v14 M15 11h6v10 M7 11h4 M7 15h4 M7 19h4 M6 7V3h6v4',
    events: 'M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16 M8 14h3 M8 17h6',
    database:
      'M20 6c0 2-4 3-8 3S4 8 4 6s4-3 8-3 8 1 8 3Z M4 6v6c0 2 4 3 8 3s8-1 8-3V6 M4 12v6c0 2 4 3 8 3s8-1 8-3v-6',
    assets: 'M4 3h11l5 5v13H4z M14 3v6h6 M8 14h8 M8 17h6',
    response: 'M3 5h18v14H8l-5 3V5Z M7 9h10 M7 13h7',
    registration: 'M4 3h13v18H4z M8 7h5 M8 11h5 M14 15l2 2 5-5',
    reports: 'M4 3v18h17 M8 17v-5 M13 17V7 M18 17v-9',
    access: 'M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7l-9-4Z m-4 9 3 3 5-6',
    settings:
      'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M10 3h4l1 3 3 1 3 3v4l-3 1-1 3-3 3h-4l-1-3-3-1-3-3v-4l3-1 1-3 3-3Z',
    notification: 'M6 17h12l-2-3V9a4 4 0 0 0-8 0v5l-2 3Z M10 20h4',
    profile: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z M4 21v-2a8 8 0 0 1 16 0v2',
    password: 'M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4 M12 14v3',
    chevron: 'm8 10 4 4 4-4',
    item: 'M5 5h14v14H5z M8 9h8 M8 13h5',
    view: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    edit: 'm16 3 5 5-12 12-6 1 1-6L16 3Z M13 6l5 5',
    delete: 'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
    history: 'M3 12a9 9 0 1 0 3-7 M3 3v6h6 M12 7v5l3 2',
    qr: 'M3 3h6v6H3z M15 3h6v6h-6z M3 15h6v6H3z M15 15h3v3h3v3h-6z',
    download: 'M12 3v12 m-5-5 5 5 5-5 M4 17v4h16v-4',
    plus: 'M12 5v14 M5 12h14',
    next: 'm9 5 7 7-7 7',
    prev: 'm15 5-7 7 7 7',
    menu: 'M3 6h18 M3 12h18 M3 18h18',
    logout: 'M9 3H4v18h5 M14 7l5 5-5 5 M9 12h11',
    check: 'm4 12 5 5L20 6',
  };
}
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgageButton, IconComponent],
  template: `@if (exportable) {
      <div class="data-exportbar">
        <span>{{ data.length }} records</span
        ><button
          [disabled]="!exportAllowed || !data.length"
          (click)="doExport('xlsx')"
          ngageButton
          variant="border"
        >
          <app-icon name="download" />Excel</button
        ><button
          [disabled]="!exportAllowed || !data.length"
          (click)="doExport('csv')"
          ngageButton
          variant="border"
        >
          CSV</button
        ><button
          [disabled]="!exportAllowed || !data.length"
          (click)="doExport('pdf')"
          ngageButton
          variant="border"
        >
          PDF / Print
        </button>
      </div>
    }
    @if (exportable && !exportAllowed) {
      <div class="export-policy">{{ exportReason }}</div>
    }
    @if (error) {
      <div class="export-policy" role="alert">{{ error }}</div>
    }
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            @for (h of headers; track h) {
              <th>{{ h }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of data; track $index) {
            <tr>
              @for (v of row; track $index) {
                <td>{{ display(v) }}</td>
              }
            </tr>
          }
          @if (!data.length) {
            <tr>
              <td [attr.colspan]="headers.length" class="empty">No records to display</td>
            </tr>
          }
        </tbody>
      </table>
    </div>`,
})
export class DataTableComponent {
  @Input() exportContext?: ExportContext;
  @Input() exportable = false;
  @Input() exportAllowed = true;
  @Input() exportReason = 'Export is restricted for this role.';
  @Input() exportTitle = 'Report';
  error = '';
  doExport(format: string) {
    if (!this.exportAllowed || !this.data.length || !this.headers.length) return;
    try {
      exportTable(format, this.exportTitle, this.headers, this.data, this.exportContext);
      this.error = '';
    } catch (e: any) {
      this.error = e.message;
    }
  }
  @Input() headers: string[] = [];
  @Input() data: any[][] = [];
  display(v: any) {
    return Array.isArray(v)
      ? v.join(', ')
      : v === true
        ? 'Yes'
        : v === false
          ? 'No'
          : (v ?? 'Not provided');
  }
}
@Component({
  selector: 'app-record-card',
  standalone: true,
  imports: [NgageButton, NgageInput, NgageTag, NgageNav, FormsModule, IconComponent],
  template: ` <section class="record-card">
    <header class="record-header">
      <div class="record-title">
        <div>
          <span class="eyebrow">DIRECTORY</span>
          <h2>{{ title }}</h2>
        </div>
        <div class="record-top-actions">
          <span class="count-pill"
            >Total records <b>{{ records.length }}</b></span
          >
          <div class="export-controls">
            <button
              class="export-trigger"
              [disabled]="!exportAllowed || !filtered.length"
              [title]="exportAllowed ? 'Export all matching records across pages' : exportReason"
              (click)="exportOpen = !exportOpen"
              [attr.aria-expanded]="exportOpen"
              ngageButton
              variant="border"
            >
              <app-icon name="download" />Export<app-icon name="chevron" />
            </button>
            @if (exportOpen && exportAllowed) {
              <div class="export-options">
                <button (click)="doExport('xlsx')" ngageButton variant="border">
                  Excel (.xlsx)</button
                ><button (click)="doExport('csv')" ngageButton variant="border">CSV (.csv)</button
                ><button (click)="doExport('pdf')" ngageButton variant="border">PDF / Print</button
                ><small>{{ filtered.length }} matching records, all pages</small>
              </div>
            }
          </div>
          @if (createLabel) {
            <button (click)="create.emit()" ngageButton>
              <app-icon name="plus" />{{ createLabel }}
            </button>
          }
        </div>
      </div>
      <div class="search-grid">
        <label
          >Search all fields<input
            [(ngModel)]="query"
            (ngModelChange)="resetPage()"
            placeholder="Name, company, email or code"
            ngageInput /></label
        ><label
          >Additional search<input
            [(ngModel)]="secondary"
            (ngModelChange)="resetPage()"
            placeholder="Combine another keyword"
            ngageInput /></label
        ><label
          >Status<select [(ngModel)]="status" (ngModelChange)="resetPage()" ngageInput>
            <option>All</option>
            @for (s of statuses; track s) {
              <option>{{ s }}</option>
            }
          </select></label
        ><button class="clear" (click)="clear()" ngageButton variant="border">Clear filters</button>
      </div>
      @if (tasks.length > 1) {
        <div class="task-row">
          <label
            >Other actions<select
              #task
              (change)="task.value && taskOpen.emit(task.value); task.value = ''"
              aria-label="Other actions"
              ngageInput
            >
              <option value="">Choose an action</option>
              @for (t of tasks; track t) {
                <option [value]="t.key">{{ t.title }}</option>
              }
            </select></label
          >
        </div>
      }
    </header>
    @if (!exportAllowed) {
      <div class="export-policy">{{ exportReason }}</div>
    }
    @if (exportError) {
      <div class="export-policy" role="alert">{{ exportError }}</div>
    }
    <div
      class="record-body table-scroll"
      [class.event-table-scroll]="event"
      [attr.tabindex]="event ? 0 : null"
      [attr.role]="event ? 'region' : null"
      [attr.aria-label]="event ? 'Events table, scroll horizontally for more columns' : null"
    >
      <table [class.event-table]="event" [class.event-table--directory]="event">
        <thead>
          <tr>
            @for (h of columns; track h; let i = $index) {
              <th
                [class.event-name-cell]="event && i === 0"
                [class.event-status-cell]="event && i === 4"
                [class.event-date-cell]="event && h === 'Start Date'"
                [class.event-count-cell]="event && (h === 'DRF' || h === 'Assets')"
              >
                <button class="sort" (click)="sort(i)">
                  {{ h }} <span aria-hidden="true">↕</span>
                </button>
              </th>
            }
            <th class="action-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (r of visible; track r.id || $index) {
            <tr>
              @for (v of r.values; track $index; let i = $index) {
                <td
                  [class.event-name-cell]="event && i === 0"
                  [class.event-status-cell]="event && i === 4"
                  [class.event-date-cell]="event && columns[i] === 'Start Date'"
                  [class.event-count-cell]="
                    event && (columns[i] === 'DRF' || columns[i] === 'Assets')
                  "
                >
                  @if (i === 4) {
                    <span [tone]="pending(v) ? 'alert' : 'positive'" ngageTag>{{ v }}</span>
                  }
                  @if (i !== 4) {
                    @if (['Events', 'DRF', 'Assets'].includes(columns[i])) {
                      <button
                        (click)="link.emit({ row: r, column: columns[i] })"
                        ngageButton
                        variant="border"
                      >
                        {{ v }}
                      </button>
                    } @else if (event && i === 0) {
                      <button (click)="view.emit(r)" ngageButton variant="border">{{ v }}</button>
                      @if (r.details?.['Event Type'] === 'Multi City') {
                        <button
                          [attr.aria-expanded]="expanded.has(r.id)"
                          (click)="toggleCities(r.id)"
                          ngageButton
                          variant="border"
                        >
                          Cities
                        </button>
                      }
                    } @else {
                      <span>{{ v }}</span>
                    }
                  }
                </td>
              }
              <td class="action-col">
                <div class="icon-actions">
                  <button
                    class="icon-btn"
                    title="View full record"
                    aria-label="View full record"
                    (click)="view.emit(r)"
                    ngageButton
                    variant="border"
                  >
                    <app-icon name="view" />
                    @if (event) {
                      <span>View</span>
                    }
                  </button>
                  @if (userManagement) {
                    @if (r.values[4] === 'Disabled') {
                      <button (click)="enableUser.emit(r)" ngageButton variant="border">
                        Enable
                      </button>
                    } @else {
                      <button
                        (click)="disableUser.emit(r)"
                        [disabled]="r.lastAdmin"
                        [title]="
                          r.lastAdmin
                            ? 'At least one Platform Admin must remain active'
                            : 'Disable and reassign'
                        "
                        ngageButton
                        variant="border"
                      >
                        Disable
                      </button>
                    }
                  }
                  @if (r.locked) {
                    <span>Locked</span>
                  }
                  @if (requirements) {
                    <button
                      class="icon-btn"
                      title="Add client requirement entry"
                      aria-label="Add client requirement entry"
                      (click)="requirement.emit(r)"
                      ngageButton
                      variant="border"
                    >
                      <app-icon name="assets" />
                    </button>
                  }
                  @if (canEdit(r)) {
                    <button
                      class="icon-btn"
                      title="Edit record"
                      aria-label="Edit record"
                      (click)="edit.emit(r)"
                      ngageButton
                      variant="border"
                    >
                      <app-icon name="edit" />
                      @if (event) {
                        <span>Edit</span>
                      }
                    </button>
                  }
                  @if (editable && !r.locked && ['Draft', 'New'].includes(r.values[4])) {
                    <button
                      class="icon-btn danger"
                      title="Delete draft"
                      aria-label="Delete draft"
                      (click)="remove.emit(r)"
                      ngageButton
                      variant="border"
                    >
                      <app-icon name="delete" />
                    </button>
                  }
                  @if (master) {
                    <button
                      class="icon-btn"
                      title="Activate or deactivate"
                      aria-label="Activate or deactivate"
                      (click)="toggle.emit(r)"
                      ngageButton
                      variant="border"
                    >
                      <app-icon name="check" />
                    </button>
                  }
                  @if (event) {
                    <button
                      class="icon-btn"
                      title="Public registration link and QR"
                      aria-label="Public registration link and QR"
                      (click)="qr.emit(r)"
                      ngageButton
                      variant="border"
                    >
                      <app-icon name="qr" /><span>Registration QR</span>
                    </button>
                  }
                  @if (sample) {
                    <button
                      class="icon-btn"
                      title="View sample contacts"
                      aria-label="View sample contacts"
                      (click)="contacts.emit(r)"
                      ngageButton
                      variant="border"
                    >
                      <app-icon name="view" />
                    </button>
                  }
                  @if (!canEdit(r)) {
                    <button
                      class="icon-btn"
                      title="View history"
                      aria-label="View history"
                      (click)="view.emit(r)"
                      ngageButton
                      variant="border"
                    >
                      <app-icon name="history" />
                    </button>
                  }
                </div>
              </td>
            </tr>
          }
          @if (event) {
            @for (row of visible; track row.id) {
              @if (expanded.has(row.id)) {
                <tr>
                  <td [attr.colspan]="columns.length + 1">
                    <b>{{ row.values[0] }} - cities</b>
                    <table>
                      <thead>
                        <tr>
                          <th>City</th>
                          <th>Start</th>
                          <th>End</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (city of row.cities; track city) {
                          <tr>
                            <td>{{ city }}</td>
                            <td>{{ row.details?.['Event Start Date'] }}</td>
                            <td>{{ row.details?.['Event End Date'] }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </td>
                </tr>
              }
            }
          }
          @if (!filtered.length) {
            <tr>
              <td [attr.colspan]="columns.length + 1" class="empty">
                <h3>No matching records</h3>
                <p>Adjust the search fields or clear the filters.</p>
                <button (click)="clear()" ngageButton variant="border">Clear filters</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <footer class="record-footer">
      <div class="record-count">
        Showing <b>{{ filtered.length ? (page - 1) * size + 1 : 0 }}–{{ last }}</b> of
        <b>{{ filtered.length }}</b> matching records
        <span class="muted">({{ records.length }} total)</span>
      </div>
      <div class="pagination">
        <label
          >Rows<select [(ngModel)]="size" (ngModelChange)="resetPage()" ngageInput>
            <option [ngValue]="5">5</option>
            <option [ngValue]="10">10</option>
            <option [ngValue]="20">20</option>
          </select></label
        ><button
          [disabled]="page === 1"
          (click)="page = page - 1"
          aria-label="Previous page"
          ngageButton
          variant="border"
        >
          <app-icon name="prev" />Previous
        </button>
        @for (n of pages; track n) {
          <button
            [class.current]="n === page"
            (click)="page = n"
            [attr.aria-label]="'Page ' + n"
            ngageNav
            [selected]="n === page"
          >
            {{ n }}
          </button>
        }
        <button
          [disabled]="page === max"
          (click)="page = page + 1"
          aria-label="Next page"
          ngageButton
          variant="border"
        >
          Next<app-icon name="next" />
        </button>
      </div>
    </footer>
  </section>`,
})
export class RecordCardComponent {
  @Input() exportContext?: ExportContext;
  @Input() userManagement = false;
  @Output() disableUser = new EventEmitter<any>();
  @Output() enableUser = new EventEmitter<any>();
  @Output() link = new EventEmitter<{ row: any; column: string }>();
  expanded = new Set<string>();
  toggleCities(id: string) {
    this.expanded.has(id) ? this.expanded.delete(id) : this.expanded.add(id);
  }
  @Input() title = 'Records';
  @Input() columns: string[] = [];
  @Input() records: any[] = [];
  @Input() createLabel = '';
  @Input() requirements = false;
  @Output() requirement = new EventEmitter<any>();
  @Input() editable = false;
  @Input() event = false;
  @Input() sample = false;
  @Input() master = false;
  @Input() tasks: any[] = [];
  @Input() exportAllowed = true;
  @Input() exportReason = 'Exports are restricted for this role.';
  exportOpen = false;
  exportError = '';
  @Output() create = new EventEmitter();
  @Output() taskOpen = new EventEmitter<string>();
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();
  @Output() toggle = new EventEmitter<any>();
  @Output() qr = new EventEmitter<any>();
  @Output() contacts = new EventEmitter<any>();
  query = '';
  secondary = '';
  status = 'All';
  page = 1;
  size = 5;
  @Input() sortIndex = 0;
  direction = 1;
  get statuses() {
    return [...new Set(this.records.map((r) => r.values[4]))];
  }
  get filtered() {
    return this.records
      .filter(
        (r) =>
          r.values.join(' ').toLowerCase().includes(this.query.toLowerCase()) &&
          r.values.join(' ').toLowerCase().includes(this.secondary.toLowerCase()) &&
          (this.status === 'All' || r.values[4] === this.status),
      )
      .sort(
        (a, b) =>
          String(a.values[this.sortIndex]).localeCompare(String(b.values[this.sortIndex])) *
          this.direction,
      );
  }
  get max() {
    return Math.max(1, Math.ceil(this.filtered.length / this.size));
  }
  get visible() {
    this.page = Math.min(this.page, this.max);
    return this.filtered.slice((this.page - 1) * this.size, this.page * this.size);
  }
  get last() {
    return Math.min(this.page * this.size, this.filtered.length);
  }
  get pages() {
    const from = Math.max(1, this.page - 2);
    return Array.from({ length: Math.min(5, this.max - from + 1) }, (_, i) => from + i);
  }
  doExport(format: string) {
    if (!this.exportAllowed || !this.filtered.length) return;
    this.exportOpen = false;
    try {
      exportTable(
        format,
        this.title,
        this.columns,
        this.filtered.map((r) => r.values),
        {
          ...(this.exportContext || { user: 'Unrecorded', scope: this.title, filters: {} }),
          filters: {
            ...this.exportContext?.filters,
            search: this.query,
            additionalSearch: this.secondary,
            status: this.status,
            sortColumn: this.columns[this.sortIndex],
            sortDirection: this.direction,
          },
        },
      );
      this.exportError = '';
    } catch (e: any) {
      this.exportError = e.message;
    }
  }
  resetPage() {
    this.page = 1;
    this.exportOpen = false;
  }
  clear() {
    this.query = '';
    this.secondary = '';
    this.status = 'All';
    this.page = 1;
  }
  sort(i: number) {
    this.direction = this.sortIndex === i ? -this.direction : 1;
    this.sortIndex = i;
  }
  canEdit(r: any) {
    return (
      this.editable &&
      !r.locked &&
      !['Handed Over', 'Approved', 'Completed', 'Rejected'].includes(r.values[4])
    );
  }
  pending(v: any) {
    return /draft|pending|hold|review/i.test(String(v));
  }
}
