import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { FILE_UPLOAD_DIR } from 'src/constans';

@Injectable()
export class ImageResizeService {
  private readonly SOCIAL_IMAGE_WIDTH = 1200;
  private readonly SOCIAL_IMAGE_HEIGHT = 630;
  private readonly SOCIAL_IMAGE_QUALITY = 85;

  /**
   * Resize image for social media sharing
   * @param originalFilename Original image filename
   * @returns Promise with the social image filename
   */
  async resizeForSocialMedia(originalFilename: string): Promise<string> {
    const originalPath = path.join(FILE_UPLOAD_DIR, originalFilename);
    const socialFilename = this.getSocialFilename(originalFilename);
    const socialPath = path.join(FILE_UPLOAD_DIR, socialFilename);

    // Check if social image already exists
    if (fs.existsSync(socialPath)) {
      return socialFilename;
    }

    try {
      // Resize image for social media
      await sharp(originalPath)
        .resize(this.SOCIAL_IMAGE_WIDTH, this.SOCIAL_IMAGE_HEIGHT, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: this.SOCIAL_IMAGE_QUALITY })
        .toFile(socialPath);

      return socialFilename;
    } catch (error) {
      console.error('Error resizing image for social media:', error);
      throw new Error('Failed to resize image for social media');
    }
  }

  /**
   * Get social media filename from original filename
   * @param originalFilename Original image filename
   * @returns Social media filename
   */
  private getSocialFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const name = path.basename(originalFilename, ext);
    return `${name}-social${ext}`;
  }

  /**
   * Check if social image exists
   * @param originalFilename Original image filename
   * @returns Boolean indicating if social image exists
   */
  socialImageExists(originalFilename: string): boolean {
    const socialFilename = this.getSocialFilename(originalFilename);
    const socialPath = path.join(FILE_UPLOAD_DIR, socialFilename);
    return fs.existsSync(socialPath);
  }

  /**
   * Get social image filename
   * @param originalFilename Original image filename
   * @returns Social image filename
   */
  getSocialImageFilename(originalFilename: string): string {
    return this.getSocialFilename(originalFilename);
  }

  /**
   * Delete social image if exists
   * @param originalFilename Original image filename
   */
  deleteSocialImage(originalFilename: string): void {
    const socialFilename = this.getSocialFilename(originalFilename);
    const socialPath = path.join(FILE_UPLOAD_DIR, socialFilename);
    
    if (fs.existsSync(socialPath)) {
      fs.unlinkSync(socialPath);
    }
  }

  /**
   * Process all existing images to create social versions
   * @returns Promise with the number of processed images
   */
  async processAllExistingImages(): Promise<number> {
    try {
      const files = fs.readdirSync(FILE_UPLOAD_DIR);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file) && 
        !file.includes('-social')
      );

      let processedCount = 0;
      
      for (const imageFile of imageFiles) {
        try {
          await this.resizeForSocialMedia(imageFile);
          processedCount++;
          console.log(`Processed: ${imageFile}`);
        } catch (error) {
          console.error(`Error processing ${imageFile}:`, error);
        }
      }

      return processedCount;
    } catch (error) {
      console.error('Error processing existing images:', error);
      throw error;
    }
  }
}

