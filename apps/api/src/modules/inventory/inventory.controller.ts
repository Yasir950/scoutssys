import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemSchema, UpdateInventoryItemSchema, InventoryFilterSchema } from '@scouts/shared';
import { ApiResponse } from '../../utils/ApiResponse';

export class InventoryController {
  /** @route GET /api/v1/inventory @access All authenticated */
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter = InventoryFilterSchema.parse(req.query);
      const { items, total } = await InventoryService.getAll(filter);
      ApiResponse.success(res, items, 'Items retrieved', 200, { page: filter.page, limit: filter.limit, total, totalPages: Math.ceil(total / filter.limit) });
    } catch (err) { next(err); }
  }

  /** @route GET /api/v1/inventory/tag/:tagNumber @access All authenticated */
  static async getByTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await InventoryService.getByTag(req.params['tagNumber']!);
      ApiResponse.success(res, item, 'Item retrieved');
    } catch (err) { next(err); }
  }

  /** @route GET /api/v1/inventory/categories @access All authenticated */
  static async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await InventoryService.getCategories();
      ApiResponse.success(res, categories, 'Categories retrieved');
    } catch (err) { next(err); }
  }

  /** @route GET /api/v1/inventory/cabins @access All authenticated */
  static async getCabins(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cabins = await InventoryService.getCabins();
      ApiResponse.success(res, cabins, 'Cabins retrieved');
    } catch (err) { next(err); }
  }

  /** @route GET /api/v1/inventory/:id @access All authenticated */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await InventoryService.getById(req.params['id']!);
      ApiResponse.success(res, item, 'Item retrieved');
    } catch (err) { next(err); }
  }

  /** @route POST /api/v1/inventory @access ADMIN, OPERATOR_INVENTORY */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = CreateInventoryItemSchema.parse(req.body);
      const item = await InventoryService.create(data);
      ApiResponse.created(res, item, 'Inventory item created');
    } catch (err) { next(err); }
  }

  /** @route PUT /api/v1/inventory/:id @access ADMIN, OPERATOR_INVENTORY */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = UpdateInventoryItemSchema.parse(req.body);
      const item = await InventoryService.update(req.params['id']!, data);
      ApiResponse.success(res, item, 'Item updated');
    } catch (err) { next(err); }
  }

  /** @route POST /api/v1/inventory/categories @access ADMIN */
  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description } = req.body as { name: string; description?: string };
      const cat = await InventoryService.createCategory(name, description);
      ApiResponse.created(res, cat, 'Category created');
    } catch (err) { next(err); }
  }

  /** @route POST /api/v1/inventory/cabins @access ADMIN */
  static async createCabin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cabinNumber, shelfLabel, description } = req.body as { cabinNumber: string; shelfLabel: string; description?: string };
      const cabin = await InventoryService.createCabinShelf(cabinNumber, shelfLabel, description);
      ApiResponse.created(res, cabin, 'Cabin shelf created');
    } catch (err) { next(err); }
  }
}
