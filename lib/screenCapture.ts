// Client-side screen capture utilities
import { MediaStreamVideoTrack } from 'some-module'; // Assuming MediaStreamVideoTrack needs to be imported

export async function startScreenCapture(): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always',
      },
      audio: false,
    });

    return stream;
  } catch (error) {
    if ((error as Error).name === 'NotAllowedError') {
      throw new Error('Screen capture permission denied');
    }
    throw error;
  }
}

export function stopScreenCapture(stream: MediaStream) {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
}

export function getScreenCaptureTracks(stream: MediaStream): MediaStreamVideoTrack[] {
  return stream.getVideoTracks() as MediaStreamVideoTrack[];
}

export function isScreenCaptureSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
}
