export const entityReports: Record<string, [string, string?]> = {
  Clients: ['Client onboarding'],
  Admin: ['User accounts by status'],
  RoleBuilder: ['Role configuration'],
  Events: ['Event schedule and status', 'Event Start Date'],
  Assignment: ['Manager assignments'],
  DRF: ['DRF progress'],
  Wishlist: ['Wishlist review'],
  Extraction: ['Extraction jobs'],
  Sample: ['Sample review status'],
  Lots: ['Lot preparation and handover'],
  Assets: ['Campaign asset approvals'],
  Response: ['Response workspaces'],
  Senders: ['Sender inventory'],
  Agents: ['Telecaller roster'],
  Release: ['Response release status'],
  Broadcast: ['Broadcast status'],
  CallingAssign: ['Calling queues'],
  Updates: ['Contact update review'],
  Returns: ['DB returns'],
  AudienceContacts: ['Event contact status'],
  RegistrationForm: ['Registration form status'],
  SessionAgenda: ['Session agenda status'],
  Alerts: ['Notifications by status'],
};
export const audienceReports: Record<string, [string, string]> = {
  registrations: [
    'Registration and approval status',
    'Registration submission date. Older records may have no submission date.',
  ],
  confirmations: [
    'Attendee confirmations',
    'Registration submission date, grouped by current confirmation status.',
  ],
  attendance: ['Check-in activity', 'Check-in date. Includes registered attendees and walk-ins.'],
  reconciliation: [
    'Registered vs. attended',
    'Event start date. Shows registered attendees, walk-ins and registered contacts without a check-in.',
  ],
  calls: ['Calling outcomes', 'Last call date per contact. Each contact counts once.'],
  queue: [
    'Assigned and pending calling',
    'Current calling queue snapshot. Pending contacts may have no last call date.',
  ],
};
export const audienceAccess: Record<string, string[]> = {
  'Super User': ['reconciliation', 'attendance'],
  'Account Manager': ['registrations', 'confirmations', 'reconciliation', 'attendance'],
  'Client Servicing Manager': ['registrations', 'confirmations', 'reconciliation', 'attendance'],
  'Response Head': ['calls', 'queue', 'reconciliation'],
  'Response Manager': ['calls', 'queue', 'registrations', 'confirmations', 'reconciliation'],
  'AG Head': ['registrations', 'confirmations', 'reconciliation', 'calls'],
  'AG Manager': ['registrations', 'confirmations', 'reconciliation'],
  'Event Executive': ['reconciliation', 'attendance', 'registrations', 'confirmations'],
  'Client Contact': ['registrations', 'confirmations', 'reconciliation'],
  Telecaller: ['queue', 'calls'],
};

export type ReportFact = {
  date: string;
  client: string;
  event: string;
  country: string;
  state: string;
  city: string;
  status: string;
  search: string;
};
export type Dimension = 'client' | 'event' | 'country' | 'state' | 'city' | 'status';
export const dimensions: Record<Dimension, string> = {
  client: 'Client',
  event: 'Event',
  country: 'Country',
  state: 'State',
  city: 'City',
  status: 'Status',
};

export function reportDate(value: unknown): string {
  const date = String(value || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  return date && !Number.isNaN(Date.parse(date)) ? date : '';
}

export function aggregate(facts: ReportFact[], grain: string, dimension?: Dimension) {
  const buckets = new Map<string, { period: string; group: string; count: number }>();
  const size = grain === 'daily' ? 10 : grain === 'monthly' ? 7 : 4;
  for (const fact of facts) {
    const period = fact.date.slice(0, size) || 'Undated';
    const group = dimension ? fact[dimension] || 'Unspecified' : '';
    const key = JSON.stringify([period, group]);
    const bucket = buckets.get(key) ?? { period, group, count: 0 };
    bucket.count++;
    buckets.set(key, bucket);
  }
  return [...buckets.values()].sort(
    (a, b) =>
      (a.period === 'Undated' ? 1 : 0) - (b.period === 'Undated' ? 1 : 0) ||
      a.period.localeCompare(b.period) ||
      a.group.localeCompare(b.group),
  );
}
