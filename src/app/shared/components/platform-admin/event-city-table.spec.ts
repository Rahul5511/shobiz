import { TestBed } from '@angular/core/testing';
import { RecordCardComponent } from './ui.components';
describe('Expanded event city details', () => {
  it('expands immediately under its event and emits a city-specific DRF link', async () => {
    const fixture = TestBed.createComponent(RecordCardComponent);
    const row = {
      id: 'multi',
      values: ['Roadshow', 'Client', 'Mumbai, Pune', 'Confirmed', 'Upcoming'],
      details: { 'Event Type': 'Multi City' },
      cities: ['Mumbai', 'Pune'],
      cityDetails: [
        {
          city: 'Mumbai',
          stage: 'Confirmed',
          status: 'Upcoming',
          start: '2026-12-01',
          end: '2026-12-02',
          pax: 40,
          venue: 'Mumbai Hall',
        },
        {
          city: 'Pune',
          stage: 'Planning',
          status: 'Upcoming',
          start: '2026-12-04',
          end: '2026-12-05',
          pax: 70,
          venue: 'Pune Hall',
        },
      ],
    };
    fixture.componentRef.setInput('columns', ['Event', 'Client', 'City', 'Stage', 'Status']);
    fixture.componentRef.setInput('records', [row]);
    fixture.componentRef.setInput('event', true);
    fixture.detectChanges();
    const button = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.trim() === 'Cities')!;
    button.click();
    await fixture.whenStable();
    const expanded = fixture.nativeElement.querySelector('.event-city-row');
    expect(expanded.textContent).toContain('Pune Hall');
    expect(expanded.textContent).toContain('Mumbai Hall');
    expect(expanded.previousElementSibling.textContent).toContain('Roadshow');
    expect(fixture.nativeElement.querySelector('th.event-action-cell')).toBeTruthy();
    const emitted = vi.spyOn(fixture.componentInstance.link, 'emit');
    const link = Array.from(
      expanded.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('View DRF - Pune'))!;
    link.click();
    expect(emitted).toHaveBeenCalledWith({ row, column: 'DRF', city: 'Pune' });
  });
});
