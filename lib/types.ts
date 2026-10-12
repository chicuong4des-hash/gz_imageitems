export type ElementType = "text" | "image" | "shape";
export type DesignElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  src?: string;
  fill?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  align?: string;
  opacity?: number;
  animation?: "none" | "fade" | "float" | "zoom";
  radius?: number;
};
export type DesignDoc = {
  width: number;
  height: number;
  background: string;
  elements: DesignElement[];
};
export type Project = {
  id: string;
  title: string;
  slug: string;
  is_public: boolean;
  design: DesignDoc;
  updated_at: string;
};
