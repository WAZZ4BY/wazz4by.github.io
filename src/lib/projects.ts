import fs from 'fs';
import path from 'path';

export type ContentBlock =
  | { type: 'image'; src: string }
  | { type: 'text'; content: string }
  | { type: 'split'; left: string; right: string }
  | { type: 'video'; embed: string };

export interface ProjectAward {
  place: string;
  festival: string;
}

export interface Project {
  id: string;
  title: string;
  /** Короткая версия названия для вкладки Index */
  shortTitle?: string;
  description: string;
  type?: string;
  year?: string;
  images: string[];
  contentBlocks?: ContentBlock[];
  backgroundColor?: string;
  /** Обложка: показывается при наведении на проект во вкладке Index */
  cover?: string;
  /** Награды: место и название фестиваля */
  awards?: ProjectAward[];
  /** Текстовый блок кредитов в конце (мелкий шрифт как в футере) */
  credits?: string;
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

/** Все уникальные URL картинок проекта (images + contentBlocks image/split). */
export function getProjectImageUrls(p: Project): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (u: string) => {
    const s = (u || '').trim();
    if (!s || seen.has(s)) return;
    seen.add(s);
    out.push(s);
  };
  for (const src of p.images || []) add(src);
  for (const block of p.contentBlocks || []) {
    if (block.type === 'image') add(block.src);
    if (block.type === 'split') {
      add(block.left);
      add(block.right);
    }
  }
  return out;
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
