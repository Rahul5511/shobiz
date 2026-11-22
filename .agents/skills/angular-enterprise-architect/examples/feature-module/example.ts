import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Routes } from '@angular/router';
import { Subject, catchError, map, of, startWith, switchMap, timeout } from 'rxjs';

export interface EventSummary {
  readonly id: string;
  readonly name: string;
}

interface EventPageDto {
  readonly items: readonly EventSummary[];
  readonly total: number;
}

type EventsState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'ready'; readonly page: EventPageDto };

@Injectable()
export class EventsApi {
  private readonly http = inject(HttpClient);

  list() {
    // Illustrative backend contract: zero-based page index, bounded first page.
    return this.http
      .get<EventPageDto>('/api/events', { params: { page: 0, pageSize: 25 } })
      .pipe(timeout(15_000));
  }
}

@Component({
  selector: 'app-events-page',
  standalone: true,
  providers: [EventsApi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="events-title" [attr.aria-busy]="state().status === 'loading'">
      <h1 id="events-title">Events</h1>
      <button type="button" (click)="reload()">Refresh events</button>
      @let current = state();
      @switch (current.status) {
        @case ('loading') {
          <p role="status">Loading events...</p>
        }
        @case ('error') {
          <p role="alert">{{ current.message }}</p>
          <button type="button" (click)="reload()">Try again</button>
        }
        @case ('ready') {
          <p>{{ current.page.total }} events in total</p>
          @if (current.page.items.length) {
            <ul>
              @for (event of current.page.items; track event.id) {
                <li>{{ event.name }}</li>
              }
            </ul>
          } @else {
            <p>No events found.</p>
          }
        }
      }
    </section>
  `,
})
export class EventsPage {
  private readonly api = inject(EventsApi);
  private readonly refresh = new Subject<void>();
  readonly state = toSignal(
    this.refresh.pipe(
      startWith(undefined),
      switchMap(() =>
        this.api.list().pipe(
          map((page): EventsState => ({ status: 'ready', page })),
          catchError(() =>
            of<EventsState>({ status: 'error', message: 'Events could not be loaded.' }),
          ),
          startWith<EventsState>({ status: 'loading' }),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as EventsState },
  );

  reload(): void {
    this.refresh.next();
  }
}

// The root lazy import is the boundary; this page lives in its lazy chunk.
export const eventsRoutes: Routes = [{ path: '', title: 'Events', component: EventsPage }];
