import { NgageButton, NgageInput, NgageAlert, NgageAvatar } from '../../shared/design-system/index';
import { WORKSPACE_UI_ACTIONS } from '../../shared/workspace/models/workspace-ui-actions';
import { ClientsPage } from '../../features/clients/clients';
import { EventsPage, RegistrationQrPage } from '../../features/events/events';
import {
  UsersPage,
  RolesAndPermissionsPage,
  RolePermissionsPage,
  UserCredentialsRoleAssignmentPage,
} from '../../features/manage-access/manage-access';
import { NotificationsPage } from '../../features/notifications/notifications';
import { MasterDataPage } from '../../features/master-data/master-data';
import { DashboardPage } from '../../features/dashboard/dashboard';
import {
  ReportsPage,
  RegistrationVsAttendancePage,
  // RoleReportsComponent, // Standalone Role Reports is paused.
} from '../../features/reports-and-tracking/reports-and-tracking';
import { ProfilePage, ChangePasswordPage } from '../../features/account/account';
import { SampleContactsPage } from '../../features/db-workspace/db-workspace';
import { roleGuide } from './role-guide';
import {
  Component,
  inject,
  ChangeDetectorRef,
  HostListener,
  forwardRef,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../shared/workspace/data-access/workspace.service';
import { AuthService } from '../../core/services/login/platform-admin-session';
import { IconComponent } from '../../shared/components/platform-admin/ui.components';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    NgageAvatar,
    NgageButton,
    NgageInput,
    NgageAlert,
    CommonModule,
    FormsModule,
    IconComponent,
    ClientsPage,
    EventsPage,
    UsersPage,
    RolesAndPermissionsPage,
    RolePermissionsPage,
    UserCredentialsRoleAssignmentPage,
    NotificationsPage,
    DashboardPage,
    MasterDataPage,
    RegistrationQrPage,
    ReportsPage,
    RegistrationVsAttendancePage,
    // RoleReportsComponent,
    ProfilePage,
    ChangePasswordPage,
    SampleContactsPage,
  ],
  templateUrl: './platform-admin.html',
  host: { class: 'platform-admin' },
  providers: [
    WorkspaceService,
    { provide: WORKSPACE_UI_ACTIONS, useExisting: forwardRef(() => WorkspaceComponent) },
  ],
})
export class WorkspaceComponent {
  headerPanel = '';
  guideOpen = false;
  compact = localStorage.getItem('ngage-sidebar') === 'compact';
  theme = this.read('ngage-theme', { mode: 'day', base: 'day', accent: '#f99417' });
  profile: { name: string; mobile: string; designation: string; photo: string };
  profileDraft: WorkspaceComponent['profile'] | null = null;
  profileTab = 'details';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  s = inject(WorkspaceService);
  auth = inject(AuthService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  keys = Object.keys;
  Object = Object;
  isArray = Array.isArray;

  constructor() {
    effect(() => {
      if (!this.auth.session) void this.router.navigateByUrl('/login');
    });
    this.s.dashboard();
    this.profile = this.read(this.profileKey, {
      name: this.auth.session?.name || '',
      mobile: '',
      designation: '',
      photo: '',
    });
    if (!localStorage.getItem(this.guideKey)) this.openGuide();
  }
  private read<T>(key: string, fallback: T): T {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
    } catch {
      return fallback;
    }
  }
  get profileKey() {
    return 'ngage-profile:' + this.auth.session?.email;
  }
  get guideKey() {
    return 'ngage-guide:' + this.auth.session?.email + ':' + this.s.role;
  }
  get guideSummary() {
    return roleGuide[this.s.role];
  }
  get guideTasks() {
    return this.s.flowKeys
      .filter((key) => key !== 'UserRoleGrant')
      .map((key: string) =>
        key === 'Events' ? { ...this.s.m.flows[key], title: 'Update Event' } : this.s.m.flows[key],
      );
  }
  get roleGrants(): string[] | undefined {
    return this.s.grants[this.s.role];
  }
  get notifications() {
    if (!this.s.accessible('Alerts')) return [];
    return [...(this.s.rows.Alerts || [])]
      .reverse()
      .sort((a, b) => String(b.values[3]).localeCompare(String(a.values[3])))
      .slice(0, 4);
  }
  @HostListener('document:click') closeHeader() {
    this.headerPanel = '';
  }
  @HostListener('document:keydown.escape') escapeHeader() {
    this.closeHeader();
    if (this.guideOpen) this.closeGuide();
  }
  toggleHeader(panel: string) {
    this.headerPanel = this.headerPanel === panel ? '' : panel;
  }
  toggleNavigation() {
    if (window.matchMedia('(max-width: 720px)').matches) {
      this.s.mobileMenu = !this.s.mobileMenu;
      return;
    }
    this.compact = !this.compact;
    localStorage.setItem('ngage-sidebar', this.compact ? 'compact' : 'expanded');
  }
  saveTheme() {
    localStorage.setItem('ngage-theme', JSON.stringify(this.theme));
  }
  openGuide() {
    this.closeHeader();
    this.guideOpen = true;
    setTimeout(() => {
      if (this.guideOpen) document.querySelector<HTMLElement>('.guide-dialog button')?.focus();
    });
  }
  closeGuide() {
    localStorage.setItem(this.guideKey, 'seen');
    this.guideOpen = false;
    setTimeout(() => document.querySelector<HTMLElement>('[aria-label="Role guide"]')?.focus());
  }
  viewNotifications() {
    this.closeHeader();
    this.s.nav('Alerts');
  }
  openNotification(row: any) {
    this.viewNotifications();
    this.s.viewRecord(row);
  }
  account(view: string) {
    this.closeHeader();
    this.s.wizard = null;
    this.s.view = view;
    this.s.key = '';
    this.s.openSection = null;
    this.s.notice = '';
    this.s.error = '';
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.profileTab = 'details';
    this.profileDraft = null;
  }
  async profilePhoto(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0],
      draft = this.profileDraft;
    if (!file || !draft) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1024 * 1024) {
      this.s.error = 'Choose a JPG, PNG or WebP image up to 1 MB.';
      return;
    }
    this.s.error = '';
    const reader = new FileReader();
    reader.onload = () => {
      if (this.profileDraft === draft) {
        draft.photo = String(reader.result);
        this.cdr.markForCheck();
      }
    };
    reader.readAsDataURL(file);
  }
  saveProfile() {
    const draft = this.profileDraft;
    if (!draft?.name.trim()) {
      this.s.error = 'Enter your display name.';
      return;
    }
    try {
      localStorage.setItem(this.profileKey, JSON.stringify(draft));
    } catch {
      this.s.error = 'Browser storage is full. Try a smaller profile photo.';
      return;
    }
    this.profile = draft;
    this.profileDraft = null;
    this.s.error = '';
    this.s.notice = 'Profile updated.';
  }
  changePassword() {
    const err = this.auth.changePassword(
      this.currentPassword,
      this.newPassword,
      this.confirmPassword,
    );
    this.s.error = err;
    if (!err) {
      this.s.notice =
        'Demo password changed for this running browser session. Refresh restores the default demo password.';
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    }
  }
  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
  async showQr(row: unknown) {
    await this.s.eventQr(row);
    this.cdr.markForCheck();
  }
  async upload(field: unknown, event: Event) {
    await this.s.file(field, event);
    setTimeout(() => this.cdr.markForCheck(), 100);
  }
}
