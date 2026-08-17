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
  nomination?: string;
}

export interface ProjectTextLink {
  text: string;
  url: string;
}

export interface ProjectCredit {
  role: string;
  name: string;
  url?: string;
}

export interface Project {
  id: string;
  title: string;
  /** Короткая версия названия для вкладки Index */
  shortTitle?: string;
  description: string;
  type?: string;
  year?: string;
  /** Точная дата для сортировки (YYYY-MM-DD), не отображается в UI */
  sortDate?: string;
  images: string[];
  contentBlocks?: ContentBlock[];
  backgroundColor?: string;
  /** Обложка: показывается при наведении на проект во вкладке Index */
  cover?: string;
  /** Награды: место и название фестиваля */
  awards?: ProjectAward[];
  /** Текстовые ссылки внизу проекта */
  links?: ProjectTextLink[];
  /** Кредиты в формате колонок: роль и имя (опционально со ссылкой) */
  creditsList?: ProjectCredit[];
  /** Текстовый блок кредитов в конце (мелкий шрифт как в футере) */
  credits?: string;
  /** Скрыт с сайта, но сохранён в данных */
  hidden?: boolean;
}

export function isProjectHidden(project: Pick<Project, 'hidden'>): boolean {
  return project.hidden === true;
}

export function getVisibleProjects(): Project[] {
  return getProjects().filter((p) => !isProjectHidden(p));
}

export function getProjects(): Project[] {
  const dataPath = path.join(process.cwd(), 'public/data/projects.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : data.projects || [];
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.id === slug);
}

/** Медиа для hover-эффекта на Index: изображения и видео из contentBlocks. */
export type ProjectHoverMedia =
  | { type: 'image'; src: string }
  | { type: 'video'; embed: string };

/** Все уникальные URL картинок проекта (images + contentBlocks image/split). */
export function getProjectImageUrls(p: Project): string[] {
  return getProjectHoverMedia(p)
    .filter((item): item is { type: 'image'; src: string } => item.type === 'image')
    .map((item) => item.src);
}

/** Изображения и видео проекта для hover-эффекта на Index. */
export function getProjectHoverMedia(p: Project): ProjectHoverMedia[] {
  const seen = new Set<string>();
  const out: ProjectHoverMedia[] = [];
  const addImage = (u: string) => {
    const s = (u || '').trim();
    if (!s || seen.has('img:' + s)) return;
    seen.add('img:' + s);
    out.push({ type: 'image', src: s });
  };
  const addVideo = (embed: string) => {
    const s = (embed || '').trim();
    if (!s || seen.has('vid:' + s)) return;
    seen.add('vid:' + s);
    out.push({ type: 'video', embed: s });
  };
  for (const src of p.images || []) addImage(src);
  for (const block of p.contentBlocks || []) {
    if (block.type === 'image') addImage(block.src);
    if (block.type === 'split') {
      addImage(block.left);
      addImage(block.right);
    }
    if (block.type === 'video') addVideo(block.embed);
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
