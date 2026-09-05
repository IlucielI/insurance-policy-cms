import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/minio';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;
    const path = formData.get('path') as string || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!bucket) {
      return NextResponse.json(
        { error: 'Bucket name required' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = path ? `${path}/${timestamp}-${sanitizedName}` : `${timestamp}-${sanitizedName}`;

    // Upload to MinIO
    const result = await uploadFile({
      bucket,
      fileName,
      file: buffer,
      contentType: file.type,
      metadata: {
        'original-name': file.name,
        'uploaded-at': new Date().toISOString(),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
