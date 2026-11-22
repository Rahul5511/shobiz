import { PortfolioEvent, PortfolioFilters } from '../../../shared/workspace/models/review.models';

export interface RegistrationFact {
  event: string;
  registered: boolean;
  approval: string;
  registeredAt?: string;
  decidedAt?: string;
  city: string;
}
export function filterPortfolio(
  events: PortfolioEvent[],
  filters: PortfolioFilters,
): PortfolioEvent[] {
  return events.filter(
    (event) =>
      (!filters.client || event.client === filters.client) &&
      (!filters.event || event.id === filters.event) &&
      (!filters.city || event.cities.includes(filters.city)) &&
      (!filters.from || (!!event.start && event.start >= filters.from)) &&
      (!filters.to || (!!event.start && event.start <= filters.to)),
  );
}
export function approvalHours(rows: RegistrationFact[]): number | null {
  const hours = rows
    .filter((row) => row.approval === 'Approved')
    .map((row) => (Date.parse(row.decidedAt || '') - Date.parse(row.registeredAt || '')) / 3600000)
    .filter((value) => Number.isFinite(value) && value >= 0);
  return hours.length ? hours.reduce((sum, value) => sum + value, 0) / hours.length : null;
}
export function waitingBands(
  rows: RegistrationFact[],
  now: number,
): { label: string; count: number }[] {
  const bands = [
    { label: 'Under 24 hours', count: 0 },
    { label: '1–2 days', count: 0 },
    { label: '3+ days', count: 0 },
    { label: 'Unknown', count: 0 },
  ];
  for (const row of rows.filter((row) => row.approval === 'Pending')) {
    const hours = (now - Date.parse(row.registeredAt || '')) / 3600000;
    bands[!Number.isFinite(hours) || hours < 0 ? 3 : hours < 24 ? 0 : hours < 72 ? 1 : 2].count++;
  }
  return bands;
}
