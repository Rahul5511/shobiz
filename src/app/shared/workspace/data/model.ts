// Compose the existing feature page definitions in their original order.
import common from './model.json' with { type: 'json' };
import pageClients from './pages/clients/pages/clients/clients.page.json' with { type: 'json' };
import pageContacts from './pages/clients/pages/client-representatives/client-representatives.page.json' with { type: 'json' };
import pageEvents from './pages/events/pages/events/events.page.json' with { type: 'json' };
import pageAudienceContacts from './pages/events/pages/event-contacts/event-contacts.page.json' with { type: 'json' };
import pageSessionAgenda from './pages/events/pages/sessions-and-agenda/sessions-and-agenda.page.json' with { type: 'json' };
import pageRegistrationForm from './pages/events/pages/registration-forms/registration-forms.page.json' with { type: 'json' };
import pageAssignment from './pages/events/pages/manager-assignments/manager-assignments.page.json' with { type: 'json' };
import pageAttendanceCheckin from './pages/events/pages/check-in-and-walk-ins/check-in-and-walk-ins.page.json' with { type: 'json' };
import pageDRF from './pages/db-workspace/pages/drf-sheets/drf-sheets.page.json' with { type: 'json' };
import pageWishlist from './pages/db-workspace/pages/wishlist-versions/wishlist-versions.page.json' with { type: 'json' };
import pageExtraction from './pages/db-workspace/pages/extraction-jobs/extraction-jobs.page.json' with { type: 'json' };
import pageSample from './pages/db-workspace/pages/sample-versions/sample-versions.page.json' with { type: 'json' };
import pageLots from './pages/db-workspace/pages/lots-and-handovers/lots-and-handovers.page.json' with { type: 'json' };
import pageAssets from './pages/assets-and-handover/pages/campaign-assets/campaign-assets.page.json' with { type: 'json' };
import pageResponse from './pages/response-workspace/pages/response-workspace/response-workspace.page.json' with { type: 'json' };
import pageSenders from './pages/response-workspace/pages/sender-inventory/sender-inventory.page.json' with { type: 'json' };
import pageAgents from './pages/response-workspace/pages/telecaller-roster/telecaller-roster.page.json' with { type: 'json' };
import pageRelease from './pages/response-workspace/pages/data-validation-and-release/data-validation-and-release.page.json' with { type: 'json' };
import pageBroadcast from './pages/response-workspace/pages/broadcast-campaigns/broadcast-campaigns.page.json' with { type: 'json' };
import pageCallingAssign from './pages/response-workspace/pages/calling-assignments/calling-assignments.page.json' with { type: 'json' };
import pageCalling from './pages/response-workspace/pages/calling-queues/calling-queues.page.json' with { type: 'json' };
import pageUpdates from './pages/response-workspace/pages/contact-proposals/contact-proposals.page.json' with { type: 'json' };
import pageRegistration from './pages/registrations/pages/registrations/registrations.page.json' with { type: 'json' };
import pageRegApproval from './pages/registrations/pages/registration-approvals/registration-approvals.page.json' with { type: 'json' };
import pageReports from './pages/reports-and-tracking/pages/reports/reports.page.json' with { type: 'json' };
import pageCallingTracker from './pages/reports-and-tracking/pages/daily-calling-tracker/daily-calling-tracker.page.json' with { type: 'json' };
import pageAttendanceReport from './pages/reports-and-tracking/pages/registration-vs-attendance/registration-vs-attendance.page.json' with { type: 'json' };
import pageReturns from './pages/reports-and-tracking/pages/response-returns/response-returns.page.json' with { type: 'json' };
import pageAdmin from './pages/manage-access/pages/users/users.page.json' with { type: 'json' };
import pageRoleBuilder from './pages/manage-access/pages/roles-and-permissions/roles-and-permissions.page.json' with { type: 'json' };
import pageCountries from './pages/master-data/pages/countries/countries.page.json' with { type: 'json' };
import pageStates from './pages/master-data/pages/states/states.page.json' with { type: 'json' };
import pageDistricts from './pages/master-data/pages/districts/districts.page.json' with { type: 'json' };
import pageCities from './pages/master-data/pages/cities/cities.page.json' with { type: 'json' };
import pageIndustries from './pages/master-data/pages/industries/industries.page.json' with { type: 'json' };
import pageSubIndustries from './pages/master-data/pages/sub-industries/sub-industries.page.json' with { type: 'json' };
import pageSegments from './pages/master-data/pages/segments/segments.page.json' with { type: 'json' };
import pageDepartments from './pages/master-data/pages/departments/departments.page.json' with { type: 'json' };
import pageDesignations from './pages/master-data/pages/designations/designations.page.json' with { type: 'json' };
import pageProfileLevels from './pages/master-data/pages/profile-levels/profile-levels.page.json' with { type: 'json' };
import pageCallStatuses from './pages/master-data/pages/call-statuses/call-statuses.page.json' with { type: 'json' };
import pageAlerts from './pages/notifications/pages/notifications/notifications.page.json' with { type: 'json' };

const model = {
  roles: common.roles,
  roleFlows: common.roleFlows,
  roleEntities: common.roleEntities,
  menuGroups: common.menuGroups,
  masters: common.masters,
  entities: {
    Clients: pageClients.entities.Clients,
    Contacts: pageContacts.entities.Contacts,
    Events: pageEvents.entities.Events,
    Admin: pageAdmin.entities.Admin,
    RoleBuilder: pageRoleBuilder.entities.RoleBuilder,
    Assignment: pageAssignment.entities.Assignment,
    DRF: pageDRF.entities.DRF,
    Wishlist: pageWishlist.entities.Wishlist,
    Extraction: pageExtraction.entities.Extraction,
    Sample: pageSample.entities.Sample,
    Lots: pageLots.entities.Lots,
    Assets: pageAssets.entities.Assets,
    Response: pageResponse.entities.Response,
    Senders: pageSenders.entities.Senders,
    Agents: pageAgents.entities.Agents,
    Release: pageRelease.entities.Release,
    Broadcast: pageBroadcast.entities.Broadcast,
    CallingAssign: pageCallingAssign.entities.CallingAssign,
    Calling: pageCalling.entities.Calling,
    Updates: pageUpdates.entities.Updates,
    Registration: pageRegistration.entities.Registration,
    RegApproval: pageRegApproval.entities.RegApproval,
    Reports: pageReports.entities.Reports,
    Returns: pageReturns.entities.Returns,
    Alerts: pageAlerts.entities.Alerts,
    AudienceContacts: pageAudienceContacts.entities.AudienceContacts,
    RegistrationForm: pageRegistrationForm.entities.RegistrationForm,
    AttendanceCheckin: pageAttendanceCheckin.entities.AttendanceCheckin,
    SessionAgenda: pageSessionAgenda.entities.SessionAgenda,
    Countries: pageCountries.entities.Countries,
    States: pageStates.entities.States,
    Districts: pageDistricts.entities.Districts,
    Cities: pageCities.entities.Cities,
    Industries: pageIndustries.entities.Industries,
    SubIndustries: pageSubIndustries.entities.SubIndustries,
    Segments: pageSegments.entities.Segments,
    Departments: pageDepartments.entities.Departments,
    Designations: pageDesignations.entities.Designations,
    ProfileLevels: pageProfileLevels.entities.ProfileLevels,
    CallStatuses: pageCallStatuses.entities.CallStatuses,
    CallingTracker: pageCallingTracker.entities.CallingTracker,
    AttendanceReport: pageAttendanceReport.entities.AttendanceReport,
  },
  flows: {
    RoleBuilder: pageRoleBuilder.flows.RoleBuilder,
    Clients: pageClients.flows.Clients,
    Contacts: pageContacts.flows.Contacts,
    Events: pageEvents.flows.Events,
    Admin: pageAdmin.flows.Admin,
    Assignment: pageAssignment.flows.Assignment,
    DRF: pageDRF.flows.DRF,
    Wishlist: pageWishlist.flows.Wishlist,
    Extraction: pageExtraction.flows.Extraction,
    Sample: pageSample.flows.Sample,
    Lots: pageLots.flows.Lots,
    Assets: pageAssets.flows.Assets,
    Response: pageResponse.flows.Response,
    Senders: pageSenders.flows.Senders,
    Agents: pageAgents.flows.Agents,
    Release: pageRelease.flows.Release,
    Broadcast: pageBroadcast.flows.Broadcast,
    CallingAssign: pageCallingAssign.flows.CallingAssign,
    Calling: pageCalling.flows.Calling,
    Updates: pageUpdates.flows.Updates,
    Registration: pageRegistration.flows.Registration,
    RegApproval: pageRegApproval.flows.RegApproval,
    Reports: pageReports.flows.Reports,
    Returns: pageReturns.flows.Returns,
    ResponseBrief: pageAssets.flows.ResponseBrief,
    SuppressionException: pageLots.flows.SuppressionException,
    SampleFeedback: pageSample.flows.SampleFeedback,
    NextLot: pageReturns.flows.NextLot,
    CheckinPublish: pageReturns.flows.CheckinPublish,
    Attendance: pageReturns.flows.Attendance,
    CloseResponse: pageReturns.flows.CloseResponse,
    AssetRemark: pageAssets.flows.AssetRemark,
    BriefAcknowledge: pageAssets.flows.BriefAcknowledge,
    Requirements: pageEvents.flows.Requirements,
    UserRoleGrant: pageAdmin.flows.UserRoleGrant,
    RolePermissions: pageRoleBuilder.flows.RolePermissions,
    AudienceContacts: pageAudienceContacts.flows.AudienceContacts,
    RegistrationForm: pageRegistrationForm.flows.RegistrationForm,
    AttendanceCheckin: pageAttendanceCheckin.flows.AttendanceCheckin,
    SessionAgenda: pageSessionAgenda.flows.SessionAgenda,
    Countries: pageCountries.flows.Countries,
    States: pageStates.flows.States,
    Districts: pageDistricts.flows.Districts,
    Cities: pageCities.flows.Cities,
    Industries: pageIndustries.flows.Industries,
    SubIndustries: pageSubIndustries.flows.SubIndustries,
    Segments: pageSegments.flows.Segments,
    Departments: pageDepartments.flows.Departments,
    Designations: pageDesignations.flows.Designations,
    ProfileLevels: pageProfileLevels.flows.ProfileLevels,
    CallStatuses: pageCallStatuses.flows.CallStatuses,
  },
  permissions: common.permissions,
  registrants: common.registrants,
  sampleRows: common.sampleRows,
  sampleHeaders: common.sampleHeaders,
  notes: common.notes,
  provenanceLegend: common.provenanceLegend,
};

export default model;
