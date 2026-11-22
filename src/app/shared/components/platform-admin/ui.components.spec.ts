import { RecordCardComponent } from './ui.components';

describe('Reference record lists', () => {
  afterEach(() => vi.restoreAllMocks());

  it('exports every matching row across pages and blocks empty or denied exports', () => {
    const write = vi.fn();
    const exporter = vi.spyOn(window, 'open').mockReturnValue({
      document: { write, close: vi.fn() },
      print: vi.fn(),
    } as unknown as Window);
    const table = new RecordCardComponent();
    table.columns = ['Client', 'Name', 'Owner', 'City', 'Status'];
    table.records = Array.from({ length: 12 }, (_, index) => ({
      values: [`Client ${index}`, 'Example', '', 'Mumbai', index < 9 ? 'Active' : 'Inactive'],
    }));
    table.status = 'Active';
    table.size = 5;
    table.page = 2;
    expect(table.visible).toHaveLength(4);
    table.doExport('pdf');
    expect(write.mock.calls[0][0]).toContain('9 records');
    expect(write.mock.calls[0][0].match(/<tr>/g)).toHaveLength(10);
    table.query = 'does not exist';
    table.doExport('pdf');
    expect(exporter).toHaveBeenCalledTimes(1);
    table.clear();
    expect(table.page).toBe(1);
    expect(table.filtered).toHaveLength(12);
    table.exportAllowed = false;
    table.doExport('xlsx');
    expect(exporter).toHaveBeenCalledTimes(1);
  });
});
