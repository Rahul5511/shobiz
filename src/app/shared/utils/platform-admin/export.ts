import { ExportContext, ExportHistoryEntry } from '../../workspace/models/review.models';
function crc32(b: Uint8Array) {
  let c = ~0;
  for (const x of b) {
    c ^= x;
    for (let i = 0; i < 8; i++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ ~0) >>> 0;
}
function zip(files: Record<string, string>) {
  const enc = new TextEncoder(),
    parts: Uint8Array[] = [],
    central: Uint8Array[] = [];
  let offset = 0;
  function head(n: number) {
    return new Uint8Array(n);
  }
  function u16(b: Uint8Array, o: number, v: number) {
    new DataView(b.buffer).setUint16(o, v, true);
  }
  function u32(b: Uint8Array, o: number, v: number) {
    new DataView(b.buffer).setUint32(o, v, true);
  }
  for (const [name, txt] of Object.entries(files)) {
    const nb = enc.encode(name),
      data = enc.encode(String(txt)),
      crc = crc32(data),
      h = head(30 + nb.length);
    u32(h, 0, 0x04034b50);
    u16(h, 4, 20);
    u32(h, 14, crc);
    u32(h, 18, data.length);
    u32(h, 22, data.length);
    u16(h, 26, nb.length);
    h.set(nb, 30);
    parts.push(h, data);
    const c = head(46 + nb.length);
    u32(c, 0, 0x02014b50);
    u16(c, 4, 20);
    u16(c, 6, 20);
    u32(c, 16, crc);
    u32(c, 20, data.length);
    u32(c, 24, data.length);
    u16(c, 28, nb.length);
    u32(c, 42, offset);
    c.set(nb, 46);
    central.push(c);
    offset += h.length + data.length;
  }
  const size = central.reduce((s, b) => s + b.length, 0),
    end = head(22);
  u32(end, 0, 0x06054b50);
  u16(end, 8, central.length);
  u16(end, 10, central.length);
  u32(end, 12, size);
  u32(end, 16, offset);
  parts.push(...central, end);
  let out = new Uint8Array(offset + size + 22),
    pos = 0;
  for (const b of parts) {
    out.set(b, pos);
    pos += b.length;
  }
  return out;
}
export function xlsx(headers: readonly string[], data: readonly (readonly unknown[])[]) {
  const xml = (s: unknown) =>
    String(s ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c] || c,
    );
  let sheet =
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' +
    [headers, ...data]
      .map(
        (r, i) =>
          '<row r="' +
          (i + 1) +
          '">' +
          r
            .map(
              (v, j) =>
                '<c r="' +
                String.fromCharCode(65 + j) +
                (i + 1) +
                '" t="inlineStr"><is><t>' +
                xml(v) +
                '</t></is></c>',
            )
            .join('') +
          '</row>',
      )
      .join('') +
    '</sheetData></worksheet>';
  return zip({
    '[Content_Types].xml':
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    '_rels/.rels':
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml':
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Data" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels':
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    'xl/worksheets/sheet1.xml': sheet,
  });
}

export function csvText(headers: any[], data: any[][]) {
  const safe = (v: any) => {
    let s = String(v ?? '');
    if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  };
  return '\ufeff' + [headers, ...data].map((row) => row.map(safe).join(',')).join('\r\n');
}
function performExport(format: string, title: string, headers: any[], data: any[][]) {
  const name = title.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'Export';
  if (format === 'pdf') {
    const win = window.open('', '_blank');
    if (!win) throw new Error('Allow popups to print or save this PDF.');
    const esc = (v: any) =>
      String(v ?? '').replace(
        /[&<>"']/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
      );
    win.document.write(
      '<!doctype html><html><head><title>' +
        esc(title) +
        '</title><style>body{font:12px Arial;padding:18px;color:#20252e}h1{font-size:21px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:7px;text-align:left;vertical-align:top}th{background:#f3f4f6}@page{size:landscape}tr{break-inside:avoid}</style></head><body><h1>' +
        esc(title) +
        '</h1><p>Filtered export · ' +
        data.length +
        ' records · ' +
        esc(new Date().toLocaleString()) +
        '</p><table><thead><tr>' +
        headers.map((v) => '<th>' + esc(v) + '</th>').join('') +
        '</tr></thead><tbody>' +
        data
          .map((r) => '<tr>' + r.map((v) => '<td>' + esc(v) + '</td>').join('') + '</tr>')
          .join('') +
        '</tbody></table></body></html>',
    );
    win.document.close();
    win.print();
    return;
  }
  const bytes = format === 'xlsx' ? xlsx(headers, data) : csvText(headers, data),
    type =
      format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv;charset=utf-8';
  const url = URL.createObjectURL(new Blob([bytes as any], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name + '.' + format;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportHistory(): ExportHistoryEntry[] {
  try {
    const rows = JSON.parse(localStorage.getItem('ngage-export-history') || '[]');
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}
export function exportTable(
  format: string,
  title: string,
  headers: any[],
  data: any[][],
  context?: ExportContext,
): void {
  if (!headers.length || !data.length) return;
  const entry: ExportHistoryEntry = {
    id: crypto.randomUUID(),
    report: title,
    format,
    columns: headers.map(String),
    records: data.length,
    at: new Date().toISOString(),
    user: context?.user || 'Unrecorded',
    scope: context?.scope || title,
    filters: context?.filters || {},
    outcome: 'Prepared',
  };
  try {
    performExport(format, title, headers, data);
  } catch (error) {
    entry.outcome = 'Failed';
    try {
      localStorage.setItem('ngage-export-history', JSON.stringify([entry, ...exportHistory()]));
    } catch {}
    throw error;
  }
  try {
    localStorage.setItem('ngage-export-history', JSON.stringify([entry, ...exportHistory()]));
  } catch {
    throw new Error('The export was prepared, but browser storage could not save its history.');
  }
}
