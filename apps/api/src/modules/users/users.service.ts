import { UsersRepository } from './users.repository';
import { CreateUserInput, UpdateUserInput } from '@scouts/shared';
import { AppError } from '../../utils/AppError';

export class UsersService {
  static async getAll(page: number, limit: number) {
    return UsersRepository.findAll(page, limit);
  }

  static async getById(id: string) {
    const user = await UsersRepository.findById(id);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    return user;
  }

  static async create(data: CreateUserInput) {
    return UsersRepository.create(data);
  }

  static async update(id: string, data: UpdateUserInput) {
    await UsersService.getById(id);
    return UsersRepository.update(id, data);
  }
}
