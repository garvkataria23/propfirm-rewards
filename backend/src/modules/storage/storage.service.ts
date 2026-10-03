import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client | null = null;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly localUploadDir: string;

  constructor() {
    const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    this.bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'propfirm-proofs';
    this.publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

    this.localUploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }

    if (accountId && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log('Cloudflare R2 storage initialized');
    } else {
      this.logger.log('Cloudflare R2 credentials not provided - using local disk storage at ./uploads');
    }
  }

  private validateFileSignature(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 4) return false;
    // PNG: 89 50 4E 47
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    // JPEG: FF D8 FF
    const isJpg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    // PDF: 25 50 44 46 (%PDF)
    const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
    // WEBP: RIFF....WEBP
    const isWebp =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer.length >= 12 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;

    return isPng || isJpg || isPdf || isWebp;
  }

  async uploadFile(file: Express.Multer.File, folder = 'proofs'): Promise<{ url: string; fileName: string; size: number; mimeType: string }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file buffer provided for upload');
    }

    if (!this.validateFileSignature(file.buffer)) {
      throw new BadRequestException(
        'Security validation failed: File binary header does not match approved types (JPEG, PNG, WEBP, or PDF required).',
      );
    }
    const timestamp = Date.now();
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${timestamp}-${cleanOriginalName}`;

    if (this.s3Client && this.publicUrl) {
      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );
        const url = `${this.publicUrl.replace(/\/$/, '')}/${key}`;
        return {
          url,
          fileName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
        };
      } catch (error) {
        this.logger.error('Failed to upload to Cloudflare R2, falling back to local disk', error);
      }
    }

    // Local disk fallback
    const targetFolder = path.join(this.localUploadDir, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const localFileName = `${timestamp}-${cleanOriginalName}`;
    const filePath = path.join(targetFolder, localFileName);
    fs.writeFileSync(filePath, file.buffer);

    const port = process.env.PORT || 4000;
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${port}`;
    const url = `${backendUrl.replace(/\/$/, '')}/uploads/${folder}/${localFileName}`;

    return {
      url,
      fileName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
