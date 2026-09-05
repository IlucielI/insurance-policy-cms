import * as Minio from 'minio';

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || '100.70.163.113',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'insurance_admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'InsuranceMinIO2026!Secure',
});

export const BUCKETS = {
  DOCUMENTS: process.env.MINIO_BUCKET_DOCUMENTS || 'insurance-documents',
  CLAIMS: process.env.MINIO_BUCKET_CLAIMS || 'insurance-claims',
  IDENTITY: process.env.MINIO_BUCKET_IDENTITY || 'insurance-identity',
} as const;

export interface UploadOptions {
  bucket: string;
  fileName: string;
  file: Buffer | ReadableStream;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface FileMetadata {
  fileName: string;
  fileSize: number;
  contentType: string;
  lastModified: Date;
  url: string;
  etag: string;
}

/**
 * Upload file to MinIO bucket
 */
export async function uploadFile(options: UploadOptions): Promise<FileMetadata> {
  const { bucket, fileName, file, contentType, metadata } = options;

  const metaData = {
    'Content-Type': contentType || 'application/octet-stream',
    ...metadata,
  };

  // MinIO putObject signature: (bucket, name, stream, size?, metaData?)
  // For unknown size, pass undefined
  await minioClient.putObject(bucket, fileName, file as any, undefined, metaData);

  const stat = await minioClient.statObject(bucket, fileName);
  const url = await getFileUrl(bucket, fileName);

  return {
    fileName,
    fileSize: stat.size,
    contentType: stat.metaData['content-type'] || contentType || 'application/octet-stream',
    lastModified: stat.lastModified,
    url,
    etag: stat.etag,
  };
}

/**
 * Get presigned URL for file download (valid for 7 days)
 */
export async function getFileUrl(bucket: string, fileName: string, expirySeconds: number = 604800): Promise<string> {
  return await minioClient.presignedGetObject(bucket, fileName, expirySeconds);
}

/**
 * List files in bucket with optional prefix
 */
export async function listFiles(bucket: string, prefix?: string): Promise<FileMetadata[]> {
  return new Promise((resolve, reject) => {
    const files: FileMetadata[] = [];
    const stream = minioClient.listObjects(bucket, prefix, true);

    stream.on('data', async (obj) => {
      if (obj.name) {
        const url = await getFileUrl(bucket, obj.name);
        files.push({
          fileName: obj.name,
          fileSize: obj.size || 0,
          contentType: 'application/octet-stream',
          lastModified: obj.lastModified || new Date(),
          url,
          etag: obj.etag || '',
        });
      }
    });

    stream.on('end', () => resolve(files));
    stream.on('error', (err) => reject(err));
  });
}

/**
 * Delete file from bucket
 */
export async function deleteFile(bucket: string, fileName: string): Promise<void> {
  await minioClient.removeObject(bucket, fileName);
}

/**
 * Check if bucket exists
 */
export async function bucketExists(bucket: string): Promise<boolean> {
  return await minioClient.bucketExists(bucket);
}

/**
 * Get file stream for download
 */
export async function getFileStream(bucket: string, fileName: string): Promise<ReadableStream> {
  return await minioClient.getObject(bucket, fileName) as any;
}
