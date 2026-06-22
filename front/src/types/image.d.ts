export type ImageSection = 'Logo' | 'Banner' | 'Historia' | 'Equipo';
export type ImageContentType = 'Imagen' | 'Video';

export interface ClubImage {
  id: number;
  idClub: number;
  imageUrl: string;
  description?: string | null;
  contentType: ImageContentType;
  uploadDate: string;
  uploadedBy?: number | null;
  section: ImageSection;
  isActive: boolean;
}