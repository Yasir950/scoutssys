import { FinesRepository } from './fines.repository';
import { PayFineInput } from '@scouts/shared';
import { AppError } from '../../utils/AppError';

export class FinesService {
  static async getAll(page: number, limit: number, status?: string) {
    return FinesRepository.findAll(page, limit, status);
  }

  static async getById(id: string) {
    const fine = await FinesRepository.findById(id);
    if (!fine) throw new AppError('Fine not found', 404, 'NOT_FOUND');
    return fine;
  }

  static async pay(id: string, data: PayFineInput) {
    const fine = await FinesService.getById(id);
    if (fine.status !== 'PENDING') throw new AppError('Fine is not in PENDING status', 400, 'INVALID_STATE');
    return FinesRepository.pay(id, data);
  }

  static async waive(id: string, waivedBy: string, notes?: string) {
    const fine = await FinesService.getById(id);
    if (fine.status !== 'PENDING') throw new AppError('Fine is not in PENDING status', 400, 'INVALID_STATE');
    return FinesRepository.waive(id, waivedBy, notes);
  }
}
