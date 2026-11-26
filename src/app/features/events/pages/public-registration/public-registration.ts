import {
  NgageAlert,
  NgageInput,
  NgageChoice,
  NgageButton,
} from '../../../../shared/design-system/index';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
@Component({
  standalone: true,
  host: { class: 'platform-admin' },
  providers: [WorkspaceService],
  imports: [NgageAlert, NgageInput, NgageChoice, NgageButton, FormsModule],
  templateUrl: './public-registration.html',
  styleUrl: './public-registration.css',
})
export class PublicComponent {
  s = inject(WorkspaceService);
  route = inject(ActivatedRoute);
  values: any = {};
  consent = false;
  found = false;
  constructor() {
    const p = this.route.snapshot.params;
    const routePath = '/' + p['client'] + '/' + p['event'] + '/registration';
    const configured = Object.entries(this.s.configs).find(
      ([key, value]: any) => value.path === routePath,
    );
    const configuredEvent = configured ? configured[0].split('|')[1] : null;
    const event = this.s.rows.Events.find(
      (r: any) => this.s.slug(r.values[0]) === p['event'] || r.values[0] === configuredEvent,
    );
    if (event) {
      const client = event.details?.Client || 'Northstar Technologies';
      const aliases = [
        this.s.slug(client),
        this.s.slug(
          this.s.rows.Clients.find((r: any) => r.values[0] === client)?.details?.['Known as'] || '',
        ),
      ];
      this.found = !!configured || aliases.includes(p['client']);
      this.s.publicEvent = event.values[0];
      this.s.publicClient = client;
    }
    this.s.receipt = null;
    this.s.error = '';
  }
  trackField(index: number, field: any) {
    return field.Field;
  }
  geoOptions(field: string) {
    return this.s.locationOptions(field, this.values);
  }
  setLocation(field: string, value: string) {
    this.values[field] = value;
    this.s.clearLocationChildren(field, this.values);
  }
}
