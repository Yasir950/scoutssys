import { InventoryRepository } from './inventory.repository';
import { CreateInventoryItemInput, UpdateInventoryItemInput, InventoryFilterInput } from '@scouts/shared';
import { AppError } from '../../utils/AppError';
import { redis, CACHE_KEYS, CACHE_TTL } from '../../lib/redis';
import { LOW_STOCK_THRESHOLD } from '../../utils/constants';

export class InventoryService {
  static async getAll(filter: InventoryFilterInput) {
    return InventoryRepository.findAll(filter);
  }

  static async getById(id: string) {
    const item = await InventoryRepository.findById(id);
    if (!item) throw new AppError('Inventory item not found', 404, 'NOT_FOUND');
    return item;
  }

  static async getByTag(tagNumber: string) {
    const cached = await redis.get(CACHE_KEYS.inventoryTag(tagNumber));
    if (cached) return JSON.parse(cached) as unknown;

    const item = await InventoryRepository.findByTag(tagNumber);
    if (!item) throw new AppError(`Item with tag ${tagNumber} not found`, 404, 'NOT_FOUND');

    await redis.setex(CACHE_KEYS.inventoryTag(tagNumber), CACHE_TTL.inventoryTag, JSON.stringify(item));
    return item;
  }

  static async getByCabin(cabinShelfId: string) {
    return InventoryRepository.findByCabin(cabinShelfId);
  }

  static async create(data: CreateInventoryItemInput) {
    const existing = await InventoryRepository.findByTag(data.tagNumber);
    if (existing) throw new AppError(`Tag number ${data.tagNumber} already exists`, 409, 'CONFLICT');
    return InventoryRepository.create(data);
  }

  static async update(id: string, data: UpdateInventoryItemInput) {
    const item = await InventoryService.getById(id);
    const updated = await InventoryRepository.update(id, data);
    await redis.del(CACHE_KEYS.inventoryTag(item.tagNumber));
    return updated;
  }

  static async getCategories() {
    return InventoryRepository.findAllCategories();
  }

  static async getCabins() {
    return InventoryRepository.findAllCabins();
  }

  static async createCategory(name: string, description?: string) {
    return InventoryRepository.createCategory(name, description);
  }

  static async createCabinShelf(cabinNumber: string, shelfLabel: string, description?: string) {
    return InventoryRepository.createCabinShelf(cabinNumber, shelfLabel, description);
  }

  static async getLowStockAlerts() {
    const byCategory = await InventoryRepository.countAvailableByCategory();
    return byCategory.filter((c) => c._count.id < LOW_STOCK_THRESHOLD);
  }
}
