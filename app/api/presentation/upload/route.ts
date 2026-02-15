import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { getPresentation, updatePresentation, getPresentationDirectory, initializeDataStore } from '@/lib/dataStore';
import { processUploadedFile } from '@/lib/fileProcessor';

// Initialize on first request
initializeDataStore();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    console.log('[v0] Received file upload request:', {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      
    });
    const code = formData.get('code') as string;

    if (!file || !code) {
      return NextResponse.json({ success: false, error: 'File and code are required' }, { status: 400 });
    }

    const presentation = getPresentation(code);
    if (!presentation) {
      return NextResponse.json({ success: false, error: 'Presentation not found' }, { status: 404 });
    }

    // Create upload directory
    const presDir = getPresentationDirectory(code);

    // Process the uploaded file
    const processedFile = await processUploadedFile(file, presDir);

    console.log('[v0] File processed:', {
      fileName: processedFile.fileName,
      fileType: processedFile.fileType,
      estimatedSlides: processedFile.slideCount,
    });

    // Update presentation with file metadata
    updatePresentation(code, {
      totalSlides: processedFile.slideCount,
      currentSlide: 0,
      presentationFile: `${code}/${processedFile.fileName}`,
      uploadedFileName: processedFile.fileName,
      fileType: processedFile.fileType,
    });

    return NextResponse.json({
      success: true,
      data: {
        slideCount: processedFile.slideCount,
        fileName: processedFile.fileName,
        fileType: processedFile.fileType,
        message: 'File uploaded successfully',
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}
