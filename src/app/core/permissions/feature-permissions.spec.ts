import {
  SHOBIZ_ROLES,
  PERMISSION_FEATURES,
  permissionRoles,
  validPermissionOptions,
  initialPermissionValues,
  permissionChangeKind,
  PermissionFeature,
} from './feature-permissions';
const feature = (id: string) => PERMISSION_FEATURES.find((feature) => feature.id === id)!;
describe('Feature permission catalogue', () => {
  it('reproduces the twelve Shobiz starting roles across twenty-two features', () => {
    expect(SHOBIZ_ROLES.map((role) => role.abbreviation)).toEqual([
      'PA',
      'AM',
      'CSM',
      'EE',
      'DBH',
      'DBM',
      'RH',
      'RM',
      'AGH',
      'AGM',
      'TC',
      'CC',
    ]);
    expect(PERMISSION_FEATURES).toHaveLength(22);
    const initial = initialPermissionValues(SHOBIZ_ROLES, PERMISSION_FEATURES);
    expect(Object.values(initial['shobiz-pa']).every((level) => level === 'M')).toBe(true);
    expect(initial['shobiz-rm']['broadcasts']).toBe('M');
    expect(initial['shobiz-rm']['calling-work-own-records']).toBe('N');
    expect(initial['shobiz-tc']['calling-work-own-records']).toBe('M');
    expect(initial['shobiz-tc']['reports-and-downloads']).toBe('V');
    expect(initial['shobiz-cc']['sample-feedback']).toBe('M');
  });
  it('allows Platform Admin edits and keeps report and client-role options valid', () => {
    expect(validPermissionOptions(SHOBIZ_ROLES[0], feature('clients'))).toEqual(['M', 'V', 'N']);
    expect(validPermissionOptions(SHOBIZ_ROLES[1], feature('reports-and-downloads'))).toEqual([
      'M',
      'V',
    ]);
    const client = SHOBIZ_ROLES.find((role) => role.type === 'Client')!;
    expect(validPermissionOptions(client, feature('event-details'))).toEqual(['V', 'N']);
    expect(validPermissionOptions(client, feature('extraction-and-verification'))).toEqual(['N']);
    const normalized = initialPermissionValues(SHOBIZ_ROLES, PERMISSION_FEATURES, {
      'shobiz-pa': { clients: 'N' },
      'shobiz-am': { 'reports-and-downloads': 'N' },
    });
    expect(normalized['shobiz-pa']['clients']).toBe('N');
    expect(normalized['shobiz-am']['reports-and-downloads']).toBe('V');
  });
  it('adds future features with None by default for editable roles', () => {
    const extra: PermissionFeature = {
      id: 'new-feature',
      name: 'New feature',
      module: 'New module',
      description: 'Future feature',
    };
    const values = initialPermissionValues(SHOBIZ_ROLES, [...PERMISSION_FEATURES, extra]);
    expect(values['shobiz-am']['new-feature']).toBe('N');
    expect(values['shobiz-pa']['new-feature']).toBe('N');
  });
  it('includes dynamic custom roles with stable IDs and unique abbreviations', () => {
    const records = [
      { id: 'a', values: ['Regional Data Lead'], grants: ['drf.read'] },
      { id: 'b', values: ['Regional Delivery Lead'], grants: [] },
      { id: 'admin', values: ['Super User'], locked: true },
    ];
    const roles = permissionRoles(records);
    expect(roles).toHaveLength(14);
    expect(roles.find((role) => role.id === 'custom-a')?.permissions['drf-and-wishlist']).toBe('V');
    expect(new Set(roles.map((role) => role.abbreviation)).size).toBe(roles.length);
    records[0].values[0] = 'Changed label';
    expect(permissionRoles(records).find((role) => role.id === 'custom-a')?.name).toBe(
      'Changed label',
    );
  });
  it('labels grants, reductions and removals for review', () => {
    expect(permissionChangeKind({ roleId: 'r', featureId: 'f', previous: 'N', next: 'M' })).toBe(
      'Granted',
    );
    expect(permissionChangeKind({ roleId: 'r', featureId: 'f', previous: 'M', next: 'V' })).toBe(
      'Reduced',
    );
    expect(permissionChangeKind({ roleId: 'r', featureId: 'f', previous: 'V', next: 'N' })).toBe(
      'Removed',
    );
  });
});
