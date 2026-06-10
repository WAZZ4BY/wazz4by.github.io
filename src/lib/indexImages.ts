import fs from 'fs';
import path from 'path';

export type IndexImageSlot = { type: 'image' | 'vimeo'; src: string | null };

const SLOT_COUNT = 14;
const DEFAULT_SLOTS: IndexImageSlot[] = Array.from({ length: SLOT_COUNT }, () => ({ type: 'image', src: null }));

/** Данные для блока изображений на главной. В админке: выбор изображение или ссылка на Vimeo (embed fill). */
export function getIndexImages(): IndexImageSlot[] {
  const dataPath = path.join(process.cwd(), 'public/data/index-images.json');
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(raw);
    const arr = Array.isArray(data) ? data : data.slots;
    if (Array.isArray(arr) && arr.length > 0) {
      return arr.slice(0, SLOT_COUNT).map((s: { type?: string; src?: string | null }) => ({
        type: s.type === 'vimeo' ? 'vimeo' : 'image',
        src: s.src ?? null,
      }));
    }
  } catch {
    /* файла нет или невалидный — используем плейсхолдеры */
  }
  return [...DEFAULT_SLOTS];
}
