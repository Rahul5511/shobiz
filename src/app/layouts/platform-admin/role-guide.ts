export const roleGuide: Record<string, string> = {
  'Super User':
    'Review all client events, maintain clients and master data, create users with assigned access, and update existing events and requirements. Platform Admin cannot create events. The replacement 22-feature role model is deferred.',
  'Account Manager':
    'Onboard clients, create events, capture requirements and assign Client Servicing Managers and Event Executives.',
  'Client Servicing Manager':
    'Open an assigned client, create or update its events, capture requirements and review samples.',
  'DB Head':
    'Review event database requirements, assign DB Managers and track delivery across events.',
  'DB Manager':
    'Review the DRF, prepare and share a sample, then hand over approved lots. Review contact and suppression updates returned by Response.',
  'Response Head':
    'Assign Response Managers, maintain sender and calling channels, and review response activity and reports.',
  'Response Manager':
    'Review handover and campaign assets, validate the data, run outreach, assign calling work and manage registration approvals with AG.',
  'AG Head':
    'Track DB and Response progress, assign AG Managers, prepare handover and work with clients and Response on registration approvals.',
  'AG Manager':
    'Review assigned event requirements and DRF status, add remarks and assets, and record client registration decisions.',
  'Event Executive': 'Open assigned events, review requirements and manage event operations.',
  'Client Contact':
    'Review registration analytics, upload wishlists, provide sample feedback and approve registrations.',
  Telecaller:
    'Open assigned contacts, log outcomes and callbacks, use approved messages and submit contact updates for review.',
};
