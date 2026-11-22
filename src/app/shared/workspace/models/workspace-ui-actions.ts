import { InjectionToken } from '@angular/core';

/** Async UI actions stay on the shell so navigation cannot destroy their change detector. */
export interface WorkspaceUiActions {
  showQr(row: unknown): Promise<void>;
  upload(field: unknown, event: Event): Promise<void>;
}

export const WORKSPACE_UI_ACTIONS = new InjectionToken<WorkspaceUiActions>('Workspace UI actions');
