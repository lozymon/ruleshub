import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'stream';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: Minio.Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Minio.Client({
      endPoint: this.configService.get<string>('storage.endpoint') ?? 'localhost',
      port: this.configService.get<number>('storage.port') ?? 9000,
      useSSL: this.configService.get<boolean>('storage.useSsl') ?? false,
      accessKey: this.configService.get<string>('storage.accessKey') ?? '',
      secretKey: this.configService.get<string>('storage.secretKey') ?? '',
    });
    this.bucket = this.configService.get<string>('storage.bucket') ?? 'ruleshub-packages';
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  async upload(key: string, data: Buffer, contentType: string): Promise<void> {
    await this.client.putObject(this.bucket, key, data, data.length, {
      'Content-Type': contentType,
    });
  }

  async download(key: string): Promise<Readable> {
    return this.client.getObject(this.bucket, key);
  }

  async delete(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }

  async getSignedUrl(key: string, expirySeconds = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucket, key, expirySeconds);
  }

  private async ensureBucketExists(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
      this.logger.log(`Created storage bucket: ${this.bucket}`);
    }
  }
}
