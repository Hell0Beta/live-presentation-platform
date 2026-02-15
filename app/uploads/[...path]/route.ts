import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getType } from 'mime';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathSegments } = await params;

        // Construct the full path to the file in the data directory
        // Note: We need to go up from app/uploads/[...path] to the root
        const dataDir = path.join(process.cwd(), 'data', 'uploads');
        const filePath = path.join(dataDir, ...pathSegments);

        // Security check: Ensure the resolved path is still within the data directory
        const resolvedPath = path.resolve(filePath);
        if (!resolvedPath.startsWith(path.resolve(dataDir))) {
            return new NextResponse('Access Denied', { status: 403 });
        }

        if (!fs.existsSync(resolvedPath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        const fileBuffer = fs.readFileSync(resolvedPath);
        const contentType = getType(resolvedPath) || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
