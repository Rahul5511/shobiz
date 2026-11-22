/** Exact Platform Admin capability map supplied by PLATFORM_ADMIN_UI_FLOW.md.
 * Configured permission checkboxes are demo data and never change this navigation policy.
 */
export const PLATFORM_ADMIN_ROLE = 'Super User';
export const PLATFORM_ADMIN_ENTITIES: readonly string[] = [
  'RoleBuilder',
  'Admin',
  'Clients',
  'Events',
  'Reports',
  'Alerts',
  'AttendanceReport',
  'Countries',
  'States',
  'Districts',
  'Cities',
  'Industries',
  'SubIndustries',
  'Segments',
  'Departments',
  'Designations',
  'ProfileLevels',
  'CallStatuses',
];
export const PLATFORM_ADMIN_WORKFLOWS: readonly string[] = [
  'RoleBuilder',
  'UserRoleGrant',
  'Admin',
  'Clients',
  'RolePermissions',
  'Countries',
  'States',
  'Districts',
  'Cities',
  'Industries',
  'SubIndustries',
  'Segments',
  'Departments',
  'Designations',
  'ProfileLevels',
  'CallStatuses',
];
export function isPlatformAdmin(role: string | undefined): boolean {
  return role === PLATFORM_ADMIN_ROLE;
}
