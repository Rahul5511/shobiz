import { NgageInput } from '../../../../shared/design-system/index';
import {
  Component,
  inject,
  ChangeDetectionStrategy,
  ElementRef,
  viewChild,
  afterRenderEffect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import { CountriesPage } from '../countries/countries';
import { StatesPage } from '../states/states';
import { DistrictsPage } from '../districts/districts';
import { CitiesPage } from '../cities/cities';
import { IndustriesPage } from '../industries/industries';
import { SubIndustriesPage } from '../sub-industries/sub-industries';
import { SegmentsPage } from '../segments/segments';
import { DepartmentsPage } from '../departments/departments';
import { DesignationsPage } from '../designations/designations';
import { ProfileLevelsPage } from '../profile-levels/profile-levels';
import { CallStatusesPage } from '../call-statuses/call-statuses';
@Component({
  selector: 'app-master-data-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    NgageInput,
    FormsModule,
    CountriesPage,
    StatesPage,
    DistrictsPage,
    CitiesPage,
    IndustriesPage,
    SubIndustriesPage,
    SegmentsPage,
    DepartmentsPage,
    DesignationsPage,
    ProfileLevelsPage,
    CallStatusesPage,
  ],
  templateUrl: './master-data.html',
  styleUrl: './master-data.css',
})
export class MasterDataPage {
  s = inject(WorkspaceService);
  readonly masterSelect = viewChild<ElementRef<HTMLSelectElement>>('masterSelect');
  constructor() {
    afterRenderEffect(() => {
      this.s.masterFocusRequest();
      this.masterSelect()?.nativeElement.focus();
    });
  }
}
