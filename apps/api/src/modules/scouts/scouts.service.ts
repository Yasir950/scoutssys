import { ScoutsRepository } from './scouts.repository';
import { CreateScoutInput } from '@scouts/shared';
import { AppError } from '../../utils/AppError';
import { REGISTRATION_NUMBER_PREFIX } from '../../utils/constants';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { env } from '../../lib/env';

export class ScoutsService {
  static async getAll(page: number, limit: number, search?: string, city?: string, unitName?: string) {
    return ScoutsRepository.findAll(page, limit, search, city, unitName);
  }

  static async getById(id: string) {
    const scout = await ScoutsRepository.findById(id);
    if (!scout) throw new AppError('Scout not found', 404, 'NOT_FOUND');
    return scout;
  }

  static async create(data: CreateScoutInput, registeredBy: string, photoFile?: Express.Multer.File) {
    const duplicate = await ScoutsRepository.findByCnic(data.cnicOrBForm);
    if (duplicate) {
      // soft warning — we allow but flag
    }

    const year = new Date().getFullYear();
    const seq = await ScoutsRepository.getNextSequence(year);
    const registrationNumber = `${REGISTRATION_NUMBER_PREFIX}-${year}-${String(seq).padStart(5, '0')}`;

    let photoPath: string | undefined;

    if (photoFile) {
      const scoutsDir = path.join(env.UPLOAD_DIR, 'scouts');
      if (!fs.existsSync(scoutsDir)) fs.mkdirSync(scoutsDir, { recursive: true });
      const filename = `${registrationNumber.replace(/-/g, '_')}.jpg`;
      const filePath = path.join(scoutsDir, filename);
      await sharp(photoFile.path).resize(400, 500, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(filePath);
      if (photoFile.path !== filePath) fs.unlinkSync(photoFile.path);
      photoPath = `/uploads/scouts/${filename}`;
    } else if (data.photoBase64) {
      const scoutsDir = path.join(env.UPLOAD_DIR, 'scouts');
      if (!fs.existsSync(scoutsDir)) fs.mkdirSync(scoutsDir, { recursive: true });
      const filename = `${registrationNumber.replace(/-/g, '_')}.jpg`;
      const filePath = path.join(scoutsDir, filename);
      const base64Data = data.photoBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      await sharp(buffer).resize(400, 500, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(filePath);
      photoPath = `/uploads/scouts/${filename}`;
    }

    return ScoutsRepository.create({ ...data, registrationNumber, registeredBy, photoPath });
  }

  static async update(id: string, data: Partial<CreateScoutInput>, photoFile?: Express.Multer.File) {
    await ScoutsService.getById(id);
    let photoPath: string | undefined;
    if (photoFile) {
      const scoutsDir = path.join(env.UPLOAD_DIR, 'scouts');
      const filename = `${id}.jpg`;
      const filePath = path.join(scoutsDir, filename);
      await sharp(photoFile.path).resize(400, 500, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(filePath);
      if (photoFile.path !== filePath) fs.unlinkSync(photoFile.path);
      photoPath = `/uploads/scouts/${filename}`;
    }
    return ScoutsRepository.update(id, { ...data, ...(photoPath && { photoPath }) });
  }
}
