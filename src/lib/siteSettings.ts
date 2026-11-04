import fs from 'fs';
import path from 'path';

export type IndexLayout = 'flat' | 'grouped';

export interface SiteSettings {
  indexLayout: IndexLayout;
}

const DEFAULT_SETTINGS: SiteSettings = {
  indexLayout: 'flat',
};

export function normalizeSiteSettings(raw: unknown): SiteSettings {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    indexLayout: obj.indexLayout === 'grouped' ? 'grouped' : 'flat',
  };
}

export function getSiteSettings(): SiteSettings {
  try {
    const dataPath = path.join(process.cwd(), 'public/data/site-settings.json');
    if (!fs.existsSync(dataPath)) return { ...DEFAULT_SETTINGS };
    const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    return normalizeSiteSettings(raw);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
