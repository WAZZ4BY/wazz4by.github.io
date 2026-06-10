import fs from 'fs';
import path from 'path';

export type IndexMediaBlock = {
  images: (string | null)[];
  /** Для одного изображения: выравнивание в контейнере */
  singleAlign?: 'left' | 'right' | 'center';
};

const DATA_PATH = path.join(process.cwd(), 'public/data/index-media-blocks.json');

/** Медиа-блоки на главной: контейнеры на всю ширину (1–3 фото, сплит без зазоров, выравнивание по верху). */
export function getIndexMediaBlocks(): IndexMediaBlock[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    const data = JSON.parse(raw);
    const arr = Array.isArray(data) ? data : data.blocks;
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, 20).map((b: { images?: (string | null)[]; singleAlign?: string }) => ({
      images: Array.isArray(b.images) ? b.images.slice(0, 3).map((s) => (s && String(s).trim()) || null) : [],
      singleAlign: b.singleAlign === 'right' || b.singleAlign === 'center' ? b.singleAlign : 'left',
    }));
  } catch {
    return [];
  }
}
