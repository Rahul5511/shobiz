export interface PortfolioFilters {
  client: string;
  event: string;
  city: string;
  from: string;
  to: string;
}
export interface PortfolioEvent {
  id: string;
  name: string;
  client: string;
  cities: string[];
  start: string;
  end: string;
  stage: string;
  status: string;
  pax: number;
  registered: number;
  approved: number;
  pending: number;
  agedPending: number;
  days: number | null;
}
export interface InvitationPreview {
  email: string;
  name: string;
  roles: string[];
  events: string[];
  cities: string[];
  status: 'Prepared locally - not sent';
  created: string;
}
export interface RelatedAssignment {
  id: string;
  kind: 'Client' | 'Event' | 'Calling';
  title: string;
  field: string;
  entity: string;
  recordId: string;
}
export interface ExportContext {
  user: string;
  filters: Record<string, unknown>;
  scope: string;
}
export interface ExportHistoryEntry extends ExportContext {
  id: string;
  report: string;
  format: string;
  columns: string[];
  records: number;
  at: string;
  outcome: 'Prepared' | 'Failed';
}
export interface PreparedShare {
  id: string;
  report: string;
  recipient: string;
  scope: string;
  filters: Record<string, unknown>;
  columns: string[];
  at: string;
  status: 'Prepared locally - not sent';
}
