export interface NailPreview {
  id: string;
  imageUrl: string;
  beforeImageUrl?: string;
  styleName: string;
  colorTag: string;
  colorHex: string;
}

export interface Idea {
  id: string;
  imageUrl: string;
  styleName: string;
  tags: string[];
  colorHex: string;
}

export interface UserSession {
  handImageUrl: string | null;
  handImageFile: File | null;
  inputType: "text" | "audio" | "image";
  textPrompt: string;
  audioBlob: Blob | null;
  referenceImageUrl: string | null;
  referenceImageFile: File | null;
}

export type InputTab = "text" | "audio" | "image";
