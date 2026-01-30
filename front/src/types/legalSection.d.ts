export interface LegalSection {
  id: string;
  type: 'title' | 'paragraph' | 'image' | 'list';
  content: string | string[];
  layout?: 'left' | 'right' | 'center';
}