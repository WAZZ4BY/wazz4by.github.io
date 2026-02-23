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
  contentBlocks?: ContentBlock[];
  backgroundColor?: string;
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

/** Возвращает контент-блоки: либо contentBlocks, либо собранные из description + images для обратной совместимости. */
export function getContentBlocks(project: Project): ContentBlock[] {
  if (project.contentBlocks && project.contentBlocks.length > 0) {
    return project.contentBlocks;
  }
  const blocks: ContentBlock[] = [];
  if (project.description && project.description.trim()) {
    blocks.push({ type: 'text', content: project.description.trim() });
  }
  (project.images || []).forEach((src) => {
    blocks.push({ type: 'image', src });
  });
  return blocks;
}
