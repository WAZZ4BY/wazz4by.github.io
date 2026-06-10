import fs from 'fs';
import path from 'path';

export type MediaRatio =
  | 'aspect-16-9'
  | 'aspect-4-5'
  | 'aspect-3-4'
  | 'aspect-1-1'
  | 'aspect-original'
  | 'aspect-free';

export type HomeMediaCard = {
  href?: string;
  src: string;
  alt?: string;
  ratio?: MediaRatio;
  as?: 'image' | 'video' | 'vimeo' | 'kinescope';
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  title?: string;
  caption?: string;
  cursorLabel?: string;
  videoPoster?: string;
  size?: 'normal' | 'wide';
  edge?: 'auto' | 'left' | 'right';
};

const DATA_PATH = path.join(process.cwd(), 'public/data/home-media-cards.json');

const DEFAULT_CARDS: HomeMediaCard[] = [
  { href: '/index/', src: '/images/main/1.png', alt: 'Editorial gallery preview 16 by 9', ratio: 'aspect-16-9', as: 'image', loading: 'lazy', size: 'wide', edge: 'left' },
  { href: '/index/', src: '/images/main/3.png', alt: 'Editorial gallery preview 3 by 4', ratio: 'aspect-3-4', as: 'image', loading: 'lazy', size: 'normal', edge: 'right' },
  { href: '/index/', src: '/images/main/5.png', alt: 'Editorial gallery preview 4 by 5', ratio: 'aspect-4-5', as: 'image', loading: 'lazy', size: 'normal', edge: 'left' },
  { href: '/index/', src: '/images/main/11.png', alt: 'Original aspect media card', ratio: 'aspect-original', as: 'image', loading: 'lazy', size: 'wide', edge: 'right' },
  { href: '/index/', src: '/images/main/14.gif', alt: 'Free aspect media card', ratio: 'aspect-free', as: 'image', loading: 'lazy', size: 'wide', edge: 'left' },
];

function normalizeRatio(value: unknown): MediaRatio {
  const ratios: MediaRatio[] = ['aspect-16-9', 'aspect-4-5', 'aspect-3-4', 'aspect-1-1', 'aspect-original', 'aspect-free'];
  return ratios.includes(value as MediaRatio) ? (value as MediaRatio) : 'aspect-16-9';
}

export function getHomeMediaCards(): HomeMediaCard[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    const data = JSON.parse(raw);
    const arr = Array.isArray(data) ? data : data.cards;
    if (!Array.isArray(arr) || arr.length === 0) return [...DEFAULT_CARDS];
    return arr.slice(0, 30).map((card) => {
      const c = card || {};
      const src = typeof c.src === 'string' ? c.src.trim() : '';
      return {
        href: typeof c.href === 'string' ? c.href : '/index/',
        src: src || '/images/main/1.png',
        alt: typeof c.alt === 'string' ? c.alt : '',
        ratio: normalizeRatio(c.ratio),
        as: c.as === 'video' || c.as === 'vimeo' || c.as === 'kinescope' ? c.as : 'image',
        width: Number(c.width) > 0 ? Number(c.width) : undefined,
        height: Number(c.height) > 0 ? Number(c.height) : undefined,
        className: typeof c.className === 'string' ? c.className : '',
        loading: c.loading === 'eager' ? 'eager' : 'lazy',
        title: typeof c.title === 'string' ? c.title : '',
        caption: typeof c.caption === 'string' ? c.caption : '',
        cursorLabel: typeof c.cursorLabel === 'string' ? c.cursorLabel : '',
        videoPoster: typeof c.videoPoster === 'string' ? c.videoPoster : '',
        size: c.size === 'wide' ? 'wide' : 'normal',
        edge: c.edge === 'left' || c.edge === 'right' ? c.edge : 'auto',
      } as HomeMediaCard;
    });
  } catch {
    return [...DEFAULT_CARDS];
  }
}
