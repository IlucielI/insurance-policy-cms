import { NextRequest, NextResponse } from 'next/server';
import { deleteFile } from '@/lib/minio';

export async function DELETE(request: NextRequest) {
  try {
    const { bucket, fileName } = await request.json();

    if (!bucket || !fileName) {
      return NextResponse.json(
        { error: 'Bucket and fileName required' },
        { status: 400 }
      );
    }

    await deleteFile(bucket, fileName);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete file' },
      { status: 500 }
    );
  }
}
