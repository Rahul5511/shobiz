import data from './shobiz-permission-matrix.json';
export type PermissionLevel = 'M' | 'V' | 'N';
export type PermissionValues = Record<string, Record<string, PermissionLevel>>;
export interface PermissionFeature {
  id: string;
  name: string;
  module: string;
  description: string;
  allowedLevels?: PermissionLevel[];
}
export interface PermissionRole {
  id: string;
  name: string;
  abbreviation: string;
  fixed: boolean;
  type: 'Internal' | 'Client';
  permissions: Record<string, PermissionLevel>;
}
export interface PermissionChange {
  roleId: string;
  featureId: string;
  previous: PermissionLevel;
  next: PermissionLevel;
}
export interface PermissionGroup {
  id: string;
  name: string;
  features: PermissionFeature[];
  total: number;
  modified: number;
}
export interface LegacyPermissionRole {
  id: string;
  values: string[];
  locked?: boolean;
  grants?: string[];
  details?: Record<string, unknown>;
}
export const PERMISSION_LEVELS: PermissionLevel[] = ['M', 'V', 'N'];
export const PERMISSION_LABELS: Record<PermissionLevel, string> = {
  M: 'Manage',
  V: 'View',
  N: 'None',
};
export const PERMISSION_FEATURES: PermissionFeature[] = data.features;
export const SHOBIZ_ROLES: PermissionRole[] = data.roles.map((role) => ({
  ...role,
  type: role.type as PermissionRole['type'],
  permissions: role.permissions as Record<string, PermissionLevel>,
}));
export const permissionCellKey = (roleId: string, featureId: string) => roleId + '::' + featureId;
const rank: Record<PermissionLevel, number> = { N: 0, V: 1, M: 2 };
export function validPermissionOptions(
  role: PermissionRole,
  feature: PermissionFeature,
): PermissionLevel[] {
  if (role.fixed) return ['M'];
  let options = feature.allowedLevels || PERMISSION_LEVELS;
  if (feature.id === 'reports-and-downloads') options = options.filter((value) => value !== 'N');
  if (role.type === 'Client') {
    const max =
      SHOBIZ_ROLES.find((role) => role.abbreviation === 'CC')!.permissions[feature.id] || 'N';
    options = options.filter((level) => rank[level] <= rank[max]);
  }
  return options;
}
export function initialPermissionValues(
  roles: PermissionRole[],
  features: PermissionFeature[],
  saved: PermissionValues = {},
): PermissionValues {
  return Object.fromEntries(
    roles.map((role) => [
      role.id,
      Object.fromEntries(
        features.map((feature) => {
          const value =
            saved[role.id]?.[feature.id] ||
            role.permissions[feature.id] ||
            (feature.id === 'reports-and-downloads' ? 'V' : 'N');
          const options = validPermissionOptions(role, feature);
          return [
            feature.id,
            role.fixed ? 'M' : options.includes(value) ? value : options[options.length - 1] || 'N',
          ];
        }),
      ),
    ]),
  );
}
const legacyMapping: Record<string, [string, PermissionLevel]> = {
  'client.read': ['clients', 'V'],
  'client.create': ['clients', 'M'],
  'client.update': ['clients', 'M'],
  'client.portal.manage': ['clients', 'M'],
  'event.read': ['event-details', 'V'],
  'event.create': ['event-details', 'M'],
  'event.update': ['event-details', 'M'],
  'drf.read': ['drf-and-wishlist', 'V'],
  'drf.draft.write': ['drf-and-wishlist', 'M'],
  'drf.submit': ['drf-and-wishlist', 'M'],
  'wishlist.upload': ['drf-and-wishlist', 'M'],
  'wishlist.match.review': ['drf-and-wishlist', 'M'],
  'dataset.extract': ['extraction-and-verification', 'M'],
  'sample.read': ['samples', 'V'],
  'sample.share': ['samples', 'M'],
  'sample.respond.portal': ['samples', 'V'],
  'sample.feedback.record': ['sample-feedback', 'M'],
  'lot.prepare': ['lots-and-handover', 'M'],
  'lot.handover': ['lots-and-handover', 'M'],
  'master.read': ['master-database', 'V'],
  'master.update': ['master-database', 'M'],
  'suppression.exception.grant': ['suppression-and-flag-overrides', 'M'],
  'asset.manage': ['campaign-assets', 'M'],
  'broadcast.manage': ['broadcasts', 'M'],
  'calling.assign': ['calling-management', 'M'],
  'registration.read': ['registration-data', 'V'],
  'registration.approve': ['approvals-and-messages', 'M'],
  'registration.feedback.record': ['approvals-and-messages', 'M'],
  'calling.own.read': ['calling-work-own-records', 'V'],
  'calling.disposition.write': ['calling-work-own-records', 'M'],
  'calling.message.send.approved': ['calling-work-own-records', 'M'],
  'contact.proposal.create': ['calling-work-own-records', 'M'],
};
/** Starting roles come from the document; existing custom roles keep their stable record IDs. */
export function permissionRoles(records: LegacyPermissionRole[]): PermissionRole[] {
  const roles = SHOBIZ_ROLES.map((role) => ({ ...role, permissions: { ...role.permissions } }));
  const names = new Set(roles.map((role) => role.name.toLowerCase()));
  names.add('super user');
  names.add('client servicing manager');
  const abbreviations = new Set(roles.map((role) => role.abbreviation));
  for (const record of records) {
    const name = String(record.values[0] || '').trim();
    if (!name || names.has(name.toLowerCase())) continue;
    const base =
      name
        .split(/\s+/)
        .map((word) => word[0])
        .join('')
        .replace(/[^a-z0-9]/gi, '')
        .slice(0, 4)
        .toUpperCase() || 'ROLE';
    let abbreviation = base;
    let suffix = 2;
    while (abbreviations.has(abbreviation)) abbreviation = base + suffix++;
    const permissions: Record<string, PermissionLevel> = { 'reports-and-downloads': 'V' };
    const grants = record.grants || record.details?.['Granted permissions'] || [];
    if (Array.isArray(grants))
      for (const code of grants) {
        const mapping = legacyMapping[String(code)];
        if (mapping && rank[mapping[1]] > rank[permissions[mapping[0]] || 'N'])
          permissions[mapping[0]] = mapping[1];
      }
    roles.push({
      id: 'custom-' + record.id,
      name,
      abbreviation,
      fixed: false,
      type: record.details?.['Role type'] === 'Client' ? 'Client' : 'Internal',
      permissions,
    });
    names.add(name.toLowerCase());
    abbreviations.add(abbreviation);
  }
  return roles;
}
export function permissionChangeKind(change: PermissionChange): 'Granted' | 'Reduced' | 'Removed' {
  return change.next === 'N'
    ? 'Removed'
    : rank[change.next] > rank[change.previous]
      ? 'Granted'
      : 'Reduced';
}
