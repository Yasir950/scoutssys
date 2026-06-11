import { IssueRepository } from './issue.repository';
import { InventoryRepository } from '../inventory/inventory.repository';
import { IssueItemsInput } from '@scouts/shared';
import { AppError } from '../../utils/AppError';
import { redis, CACHE_KEYS } from '../../lib/redis';
import { GUARANTOR_REQUIRED_THRESHOLD } from '../../utils/constants';

export class IssueService {
  static async getIssuedByScout(scoutId: string) {
    return IssueRepository.findIssuedByScout(scoutId);
  }

  static async issueItems(data: IssueItemsInput, issuedBy: string) {
    const itemPromises = data.tagNumbers.map((tag) => InventoryRepository.findByTag(tag));
    const items = await Promise.all(itemPromises);

    const notFound = items.filter((item) => !item);
    if (notFound.length > 0) {
      throw new AppError('One or more tag numbers not found', 404, 'NOT_FOUND');
    }

    const notAvailable = items.filter((item) => item?.status !== 'AVAILABLE');
    if (notAvailable.length > 0) {
      const tags = notAvailable.map((i) => i?.tagNumber).join(', ');
      throw new AppError(`Items not available for issue: ${tags}`, 400, 'ITEM_NOT_AVAILABLE');
    }

    const totalValue = items.reduce((sum, item) => sum + Number(item?.originalPrice ?? 0), 0);
    if (totalValue >= GUARANTOR_REQUIRED_THRESHOLD && !data.guarantor) {
      throw new AppError(`Guarantor is required for items worth Rs. ${totalValue}`, 400, 'GUARANTOR_REQUIRED');
    }

    const itemIds = items.map((i) => i!.id);
    const issuedItems = await IssueRepository.createBatch(data.scoutId, itemIds, issuedBy, data.guarantor);

    await Promise.all(items.map((item) => redis.del(CACHE_KEYS.inventoryTag(item!.tagNumber))));

    return issuedItems;
  }
}
