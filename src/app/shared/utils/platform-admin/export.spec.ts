import { exportTable, exportHistory, csvText } from './export';

describe('Prepared export history', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());
  it('records the user, filters, scope, selected columns and generated record count', () => {
    const write = vi.fn();
    vi.spyOn(window, 'open').mockReturnValue({
      document: { write, close: vi.fn() },
      print: vi.fn(),
    } as unknown as Window);
    exportTable('pdf', 'Attendance', ['Attendee'], [['Asha']], {
      user: 'superadmin@demo.local',
      scope: 'One event',
      filters: { city: 'Mumbai' },
    });
    expect(exportHistory()[0]).toMatchObject({
      user: 'superadmin@demo.local',
      scope: 'One event',
      report: 'Attendance',
      columns: ['Attendee'],
      records: 1,
      outcome: 'Prepared',
      filters: { city: 'Mumbai' },
    });
    expect(write.mock.calls[0][0]).toContain('Asha');
  });
  it('records popup failures as failures rather than successful downloads', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    expect(() => exportTable('pdf', 'Report', ['Name'], [['Example']])).toThrow('Allow popups');
    expect(exportHistory()[0].outcome).toBe('Failed');
  });
  it('does not generate or log empty exports and keeps CSV formula escaping', () => {
    const open = vi.spyOn(window, 'open');
    exportTable('pdf', 'Report', [], [['Example']]);
    exportTable('pdf', 'Report', ['Name'], []);
    expect(open).not.toHaveBeenCalled();
    expect(exportHistory()).toEqual([]);
    expect(csvText(['Name'], [['=SUM(A1)']])).toContain("'=SUM(A1)");
  });
});
