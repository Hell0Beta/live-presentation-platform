export interface User {
  id: string;
  name: string;
  role: 'presenter' | 'audience';
  sessionId: string;
  joinedAt: string;
}

export interface AudienceMember {
  name: string;
  joinedAt: string;
}

export interface Presentation {
  code: string;
  presenterName: string;
  createdAt: string;
  expiresAt: string;
  type: 'presentation' | 'screenshare';
  status: 'active' | 'ended';
  currentSlide: number;
  totalSlides: number;
  slidesPath: string;
  presentationFile: string;
  uploadedFileName?: string;
  fileType?: 'application/pdf' | 'pptx' | 'ppt' | 'unknown';
  connectedAudience: AudienceMember[];
}

export interface PresentationsData {
  presentations: Presentation[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
