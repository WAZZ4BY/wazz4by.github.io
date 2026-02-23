import fs from 'fs';
import path from 'path';

export type ContentBlock =
  | { type: 'image'; src: string }
  | { type: 'text'; content: string }
  | { type: 'split'; left: string; right: string }
  | { type: 'video'; embed: string };

export interface Project {
  id: string;
  title: string;
  description: string;
  type?: string;
  year?: string;
  images: string[];
  /** Блоки контента: изображение на всю ширину, текст (кол. 5–12), сплит (2 по 6 кол.). Если нет — собирается из description + images. */
  contentBlocks?: ContentBlock[];
  /** Цвет фона страницы проекта (например #FBFBFB или #fff). */
  backgroundColor?: string;
}

/** Возвращает массив блоков: из contentBlocks или из description + images (обратная совместимость). */
export function getContentBlocks(project: Project): ContentBlock[] {
  if (project.contentBlocks && project.contentBlocks.length > 0) {
    return project.contentBlocks;
  }
  const blocks: ContentBlock[] = [];
  if (project.description && project.description.trim()) {
    blocks.push({ type: 'text', content: project.description.trim() });
  }
  (project.images || []).forEach((src) => {
    if (src && src.trim()) blocks.push({ type: 'image', src: src.trim() });
  });
  return blocks;
}

let cached: Project[] | null = null;

export function getProjects(): Project[] {
  if (cached) return cached;
  const dataPath = path.join(process.cwd(), 'public/data/projects.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(raw);
  cached = Array.isArray(data) ? data : data.projects || [];
  return cached;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.id === slug);
}
