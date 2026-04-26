import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CloudinaryService {
  private supabase: SupabaseClient<any, any, any>;

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
  }

  async upload(filePath: string, isPdf: boolean): Promise<string> {
    try {
      let url: string;

      if (isPdf) {
        url = await this.uploadToSupabase(filePath);
      } else {
        url = await this.uploadToCloudinary(filePath);
      }

      // Clean up local temp file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return url;
    } catch {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new InternalServerErrorException('File upload failed');
    }
  }

  private async uploadToCloudinary(filePath: string): Promise<string> {
    const result: UploadApiResponse = await cloudinary.uploader.upload(
      filePath,
      { folder: 'medical-reports', resource_type: 'image' },
    );
    return result.secure_url;
  }

  private async uploadToSupabase(filePath: string): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = `${uuidv4()}${path.extname(filePath)}`;

    const { error } = await this.supabase.storage
      .from('medical-reports')
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
      });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const { data } = this.supabase.storage
      .from('medical-reports')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
}
