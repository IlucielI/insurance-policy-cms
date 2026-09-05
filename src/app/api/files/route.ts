import { NextRequest, NextResponse } from 'next/server';
import { listFiles } from '@/lib/minio';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bucket = searchParams.get('bucket');
    const prefix = searchParams.get('prefix') || undefined;

    if (!bucket) {
      return NextResponse.json(
        { error: 'Bucket name required' },
        { status: 400 }
      );
    }

    const files = await listFiles(bucket, prefix);

    return NextResponse.json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list files' },
      { status: 500 }
    );
  }
}
