import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../../../shared/workspace/data-access/workspace.service';
import {
  DataTableComponent,
  IconComponent,
} from '../../../../shared/components/platform-admin/ui.components';
import { xlsx } from '../../../../shared/utils/platform-admin/export';
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-sample-contacts-page',
  standalone: true,
  imports: [FormsModule, DataTableComponent, IconComponent],
  templateUrl: './sample-contacts.html',
  styleUrl: './sample-contacts.css',
})
export class SampleContactsPage {
  s = inject(WorkspaceService);
  exportSample() {
    if (this.s.role !== 'DB Manager') return;
    const bytes = xlsx(
      this.s.m.sampleHeaders,
      this.s.sampleRows.slice(0, Math.max(1, this.s.limit)),
    );
    const url = URL.createObjectURL(
      new Blob([bytes as any], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Sample_1.xlsx';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  printSample() {
    if (this.s.role !== 'DB Manager') return;
    const escape = (x: any) =>
      String(x ?? '').replace(
        /[&<>"']/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
      );
    const w = window.open('', '_blank');
    if (!w) {
      this.s.error = 'Allow popups to print the sample.';
      return;
    }
    w.document.write(
      '<html><head><title>SAMPLE - Sample 1</title><style>body{font:12px Arial}table{border-collapse:collapse;width:100%}td,th{border:1px solid #aaa;padding:7px}</style></head><body><h1>SAMPLE - Sample 1</h1><p>Email and phone excluded. Filtered export limited to ' +
        this.s.limit +
        ' records.</p><table><thead><tr>' +
        this.s.m.sampleHeaders.map((h: any) => '<th>' + escape(h) + '</th>').join('') +
        '</tr></thead><tbody>' +
        this.s.sampleRows
          .slice(0, this.s.limit)
          .map(
            (r: any) => '<tr>' + r.map((v: any) => '<td>' + escape(v) + '</td>').join('') + '</tr>',
          )
          .join('') +
        '</tbody></table></body></html>',
    );
    w.document.close();
    w.print();
  }
}
