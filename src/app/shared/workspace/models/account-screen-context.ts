export interface AccountProfile {
  name: string;
  mobile: string;
  designation: string;
  photo: string;
}
export interface AccountScreenContext {
  profile: AccountProfile;
  profileDraft: AccountProfile | null;
  profileTab: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  readonly roleGrants: string[] | undefined;
  profilePhoto(event: Event): Promise<void>;
  saveProfile(): void;
  changePassword(): void;
}
