import fs from 'fs';
import path from 'path';

export type ResearchCard = {
  number: number;
  src: string;
  alt?: string;
  as?: 'image' | 'kinescope';
  caption?: string;
  date?: string;
};

const DATA_PATH = path.join(process.cwd(), 'public/data/research-cards.json');

const DEFAULT_CARDS: ResearchCard[] = [
  { number: 1, src: '/images/research-1.jpg', alt: 'Research 1' },
  { number: 2, src: '/images/research-2.jpg', alt: 'Research 2' },
  { number: 3, src: '/images/research-3.jpg', alt: 'Research 3' },
  { number: 4, src: '/images/research-4.jpg', alt: 'Research 4' },
  { number: 5, src: '/images/research-5.jpg', alt: 'Research 5' },
];

function normalizeCard(card: unknown, fallbackNumber: number): ResearchCard {
  const c = (card && typeof card === 'object') ? (card as Record<string, unknown>) : {};
  const parsedNumber = Number(c.number);
  const number = Number.isFinite(parsedNumber) ? Math.max(0, Math.round(parsedNumber)) : fallbackNumber;
  const src = typeof c.src === 'string' ? c.src.trim() : '';
  const alt = typeof c.alt === 'string' ? c.alt : '';
  return {
    number,
    src,
    alt,
    as: c.as === 'kinescope' ? 'kinescope' : 'image',
    caption: typeof c.caption === 'string' ? c.caption : '',
    date: typeof c.date === 'string' ? c.date : '',
  };
}

export function getResearchCards(): ResearchCard[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    const data = JSON.parse(raw);
    const arr = Array.isArray(data) ? data : data.cards;
    if (!Array.isArray(arr) || arr.length === 0) {
      return [...DEFAULT_CARDS].sort((a, b) => b.number - a.number);
    }
    return arr
      .slice(0, 100)
      .map((card, index) => normalizeCard(card, index + 1))
      .filter((card) => Boolean(card.src))
      .sort((a, b) => b.number - a.number);
  } catch {
    return [...DEFAULT_CARDS].sort((a, b) => b.number - a.number);
  }
}
