import { ReportsRepository } from './reports.repository';
import { redis, CACHE_KEYS, CACHE_TTL } from '../../lib/redis';
import ExcelJS from 'exceljs';

const REPORT_TYPES = [
  'scout-registrations', 'items-issued', 'pending-returns', 'fines-pending',
  'fines-paid', 'inventory-by-category', 'items-by-condition', 'cabin-inventory',
  'daily-activity', 'department-duty-summary', 'guarantors', 'exchange-history', 'audit-log',
] as const;

type ReportType = typeof REPORT_TYPES[number];

export class ReportsService {
  static async getReport(type: ReportType, params: Record<string, string>) {
    const cacheKey = CACHE_KEYS.reportData(type, JSON.stringify(params));
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as unknown;

    let data: unknown;
    const startDate = params['startDate'] ? new Date(params['startDate']) : undefined;
    const endDate = params['endDate'] ? new Date(params['endDate']) : undefined;

    switch (type) {
      case 'scout-registrations': data = await ReportsRepository.getScoutRegistrations(startDate, endDate); break;
      case 'items-issued': data = await ReportsRepository.getIssuedItems(startDate, endDate); break;
      case 'pending-returns': data = await ReportsRepository.getPendingReturns(); break;
      case 'fines-pending': data = await ReportsRepository.getFines('PENDING'); break;
      case 'fines-paid': data = await ReportsRepository.getFines('PAID'); break;
      case 'inventory-by-category': data = await ReportsRepository.getInventoryByCategory(); break;
      case 'items-by-condition': data = await ReportsRepository.getItemsByCondition(); break;
      case 'cabin-inventory': data = await ReportsRepository.getCabinInventory(); break;
      case 'daily-activity': data = await ReportsRepository.getDailyActivity(startDate); break;
      case 'department-duty-summary': data = await ReportsRepository.getDepartmentDutySummary(); break;
      case 'guarantors': data = await ReportsRepository.getGuarantors(); break;
      case 'exchange-history': data = await ReportsRepository.getExchangeHistory(); break;
      case 'audit-log': data = await ReportsRepository.getAuditLog(Number(params['page']) || 1, 100, params['userId']); break;
      default: data = [];
    }

    await redis.setex(cacheKey, CACHE_TTL.report, JSON.stringify(data));
    return data;
  }

  static async getDashboard() {
    return ReportsRepository.getDashboardStats();
  }

  static async exportExcel(type: ReportType, params: Record<string, string>): Promise<Buffer> {
    const data = await ReportsService.getReport(type, params) as unknown[];
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(type);

    if (Array.isArray(data) && data.length > 0) {
      const firstRow = data[0] as Record<string, unknown>;
      const columns = Object.keys(firstRow).map((key) => ({ header: key, key, width: 20 }));
      sheet.columns = columns;
      data.forEach((row) => {
        const flatRow: Record<string, unknown> = {};
        Object.entries(row as Record<string, unknown>).forEach(([k, v]) => {
          flatRow[k] = typeof v === 'object' ? JSON.stringify(v) : String(v ?? '');
        });
        sheet.addRow(flatRow);
      });
    }

    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }
}
