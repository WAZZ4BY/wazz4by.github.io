import fs from 'fs';
import path from 'path';

export type ResearchSpan = 2 | 4 | 6;
export type ResearchMaxWidth = 4 | 6;

export type ResearchCard = {
  number: number;
  src: string;
  alt?: string;
  as?: 'image' | 'kinescope';
  caption?: string;
  date?: string;
  text?: string;
  sideSrcs: string[];
  spanW: ResearchMaxWidth;
  spanH: ResearchSpan;
  aspectRatio: number;
};

const DATA_PATH = path.join(process.cwd(), 'public/data/research-cards.json');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

function spansFromAspect(aspectRatio: number): { spanW: ResearchSpan; spanH: ResearchSpan } {
  if (aspectRatio >= 1.2) return { spanW: 4, spanH: 2 };
  if (aspectRatio <= 0.7) return { spanW: 2, spanH: 4 };
  return { spanW: 2, spanH: 2 };
}

function readImageSize(filePath: string): { width: number; height: number } | null {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.length >= 10 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
      return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    }
    if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (buf.length >= 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      const chunk = buf.toString('ascii', 12, 16);
      if (chunk === 'VP8X') {
        return {
          width: (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1,
          height: (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1,
        };
      }
      if (chunk === 'VP8 ') {
        return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      }
      if (chunk === 'VP8L') {
        const bits = buf.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
    }
  } catch {
    return null;
  }
  return null;
}

function publicFilePath(src: string): string {
  const clean = src.split('?')[0].split('#')[0];
  if (!clean.startsWith('/') || clean.includes('..')) return '';
  return path.join(PUBLIC_DIR, clean.replace(/^\//, ''));
}

function aspectFromKinescope(src: string): number | null {
  const pad = src.match(/padding-top:\s*([\d.]+)%/i);
  if (pad) {
    const pct = Number(pad[1]);
    if (Number.isFinite(pct) && pct > 0) return 100 / pct;
  }
  const widthMatch = src.match(/\bwidth=["'](\d+)["']/i);
  const heightMatch = src.match(/\bheight=["'](\d+)["']/i);
  if (widthMatch && heightMatch) {
    const width = Number(widthMatch[1]);
    const height = Number(heightMatch[1]);
    if (width > 0 && height > 0) return width / height;
  }
  return null;
}

function aspectForCard(as: ResearchCard['as'], src: string): number {
  if (as === 'kinescope') {
    return aspectFromKinescope(src) || 1;
  }
  const filePath = publicFilePath(src);
  if (!filePath) return 1;
  const size = readImageSize(filePath);
  if (!size || size.width <= 0 || size.height <= 0) return 1;
  return size.width / size.height;
}

function parseSideSrcs(value: unknown, legacy?: unknown): string[] {
  const out: string[] = [];
  const push = (item: unknown) => {
    if (typeof item === 'string' && item.trim()) out.push(item.trim());
  };
  if (Array.isArray(value)) value.forEach(push);
  else push(legacy);
  return out;
}

function parseMaxWidth(value: unknown): ResearchMaxWidth {
  return Number(value) === 6 ? 6 : 4;
}

function parseSpan(value: unknown): ResearchSpan | null {
  const n = Number(value);
  if (n === 2 || n === 4 || n === 6) return n;
  return null;
}

function normalizeCard(card: unknown, fallbackNumber: number): ResearchCard {
  const c = (card && typeof card === 'object') ? (card as Record<string, unknown>) : {};
  const parsedNumber = Number(c.number);
  const number = Number.isFinite(parsedNumber) ? Math.max(0, Math.round(parsedNumber)) : fallbackNumber;
  const src = typeof c.src === 'string' ? c.src.trim() : '';
  const alt = typeof c.alt === 'string' ? c.alt : '';
  const as: ResearchCard['as'] = c.as === 'kinescope' ? 'kinescope' : 'image';
  const aspectRatio = aspectForCard(as, src);
  const auto = spansFromAspect(aspectRatio);
  return {
    number,
    src,
    alt,
    as,
    caption: typeof c.caption === 'string' ? c.caption : '',
    date: typeof c.date === 'string' ? c.date : '',
    text: typeof c.text === 'string' ? c.text : '',
    sideSrcs: parseSideSrcs(c.sideSrcs, c.sideSrc),
    spanW: parseMaxWidth(c.spanW),
    spanH: parseSpan(c.spanH) ?? auto.spanH,
    aspectRatio,
  };
}

function loadJsonCards(): ResearchCard[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    const data = JSON.parse(raw);
    const arr = Array.isArray(data) ? data : data.cards;
    if (!Array.isArray(arr)) return [];
    return arr
      .slice(0, 100)
      .map((card, index) => normalizeCard(card, index + 1))
      .filter((card) => Boolean(card.src));
  } catch {
    return [];
  }
}

export function getResearchCards(): ResearchCard[] {
  return loadJsonCards().sort((a, b) => a.number - b.number);
}
