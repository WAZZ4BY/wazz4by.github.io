import fs from 'fs';
import path from 'path';

export interface Project {
  id: string;
  title: string;
  description: string;
  type?: string;
  year?: string;
  images: string[];
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
