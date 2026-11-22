/** Platform Admin capabilities, including the approved design-review changes.
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
  'Admin',
  'Clients',
  'Events',
  'Requirements',
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
