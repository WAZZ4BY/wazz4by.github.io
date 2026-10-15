import fs from 'fs';
import path from 'path';

export type ResearchSpan = 2 | 4 | 6;
export type ResearchMaxWidth = 2 | 4 | 6 | 8;
export type ResearchCoverFit = 'height' | 'cols';
export type ResearchColSpan = 2 | 4 | 6 | 8;
export type ResearchMediaKind = 'image' | 'kinescope' | 'video' | 'audio';

export type ResearchTextLink = {
  text: string;
  url: string;
};

export type ResearchScreenItem = {
  src: string;
  as: ResearchMediaKind;
  span: ResearchColSpan;
  fit: 'height' | 'cols';
  aspectRatio: number;
  alt?: string;
};

export type ResearchScreen = {
  items: ResearchScreenItem[];
};

export type ResearchCard = {
  number: number;
  src: string;
  /** Optional mobile cover; falls back to `src` when empty. */
  srcMobile?: string;
  /** Audio file path when `as === 'audio'`. Cover image stays in `src`. */
  audioSrc?: string;
  alt?: string;
  as?: ResearchMediaKind;
  caption?: string;
  date?: string;
  text?: string;
  links: ResearchTextLink[];
  sideSrcs: string[];
  screens: ResearchScreen[];
  spanW: ResearchMaxWidth;
  coverFit: ResearchCoverFit;
  spanH: ResearchSpan;
  aspectRatio: number;
  aspectRatioMobile: number;
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

function isAudioPath(src: string): boolean {
  return /\.(mp3|wav|ogg|m4a|aac)(\?|#|$)/i.test(String(src || '').trim());
}

function aspectForCard(as: ResearchCard['as'], src: string): number {
  if (as === 'kinescope' || as === 'video') {
    if (as === 'kinescope') return aspectFromKinescope(src) || 16 / 9;
    return 16 / 9;
  }
  // audio uses cover image aspect (circle crop is CSS on desktop only)
  if (as === 'audio' && (!src || isAudioPath(src))) return 1;
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

function parseLinks(value: unknown): ResearchTextLink[] {
  if (!Array.isArray(value)) return [];
  const out: ResearchTextLink[] = [];
  value.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const rec = item as Record<string, unknown>;
    const text = typeof rec.text === 'string' ? rec.text.trim() : '';
    const url = typeof rec.url === 'string' ? rec.url.trim() : '';
    if (!text && !url) return;
    out.push({ text, url });
  });
  return out;
}

function parseMaxWidth(value: unknown): ResearchMaxWidth {
  const n = Number(value);
  if (n === 2 || n === 4 || n === 6 || n === 8) return n;
  return 4;
}

function parseCoverFit(value: unknown, aspectRatio: number): ResearchCoverFit {
  if (value === 'height' || value === 'cols') return value;
  // legacy: tall covers used to snap to viewport height
  return aspectRatio > 0 && aspectRatio < 0.95 ? 'height' : 'cols';
}

function parseSpan(value: unknown): ResearchSpan | null {
  const n = Number(value);
  if (n === 2 || n === 4 || n === 6) return n;
  return null;
}

function parseColSpan(value: unknown): ResearchColSpan | null {
  const n = Number(value);
  if (n === 2 || n === 4 || n === 6 || n === 8) return n;
  return null;
}

function parseMediaKind(value: unknown): ResearchMediaKind {
  if (value === 'kinescope' || value === 'video' || value === 'audio') return value;
  return 'image';
}

function fitForAspect(aspectRatio: number): 'height' | 'cols' {
  return aspectRatio > 0 && aspectRatio < 0.95 ? 'height' : 'cols';
}

function makeScreenItem(
  src: string,
  span: ResearchColSpan,
  as: ResearchMediaKind = 'image',
  alt = '',
  forceFit?: 'height' | 'cols',
): ResearchScreenItem {
  const aspectRatio = aspectForCard(as, src);
  return {
    src,
    as,
    span,
    fit: forceFit || fitForAspect(aspectRatio),
    aspectRatio,
    alt,
  };
}

function defaultSpanForAspect(aspectRatio: number): ResearchColSpan {
  if (aspectRatio >= 1.4) return 6;
  if (aspectRatio >= 1.05) return 4;
  return 4;
}

function mediaKindFromSrc(src: string, fallback: ResearchMediaKind = 'image'): ResearchMediaKind {
  if (fallback === 'kinescope' || fallback === 'audio') return fallback;
  if (/\.(mp4|webm|mov)(\?|#|$)/i.test(src)) return 'video';
  if (/kinescope\.(io|ru)|player\.vimeo\.com|<iframe/i.test(src)) return 'kinescope';
  return fallback === 'video' ? 'video' : 'image';
}

function screensFromSideSrcs(srcs: string[]): ResearchScreen[] {
  return srcs.map((src) => {
    const as = mediaKindFromSrc(src);
    const aspectRatio = aspectForCard(as, src);
    return {
      items: [makeScreenItem(src, defaultSpanForAspect(aspectRatio), as)],
    };
  });
}

function parseScreenItem(entry: unknown): ResearchScreenItem | null {
  if (typeof entry === 'string' && entry.trim()) {
    const src = entry.trim();
    const as = mediaKindFromSrc(src);
    return makeScreenItem(src, defaultSpanForAspect(aspectForCard(as, src)), as);
  }
  if (!entry || typeof entry !== 'object') return null;
  const item = entry as Record<string, unknown>;
  const src = typeof item.src === 'string' ? item.src.trim() : '';
  if (!src) return null;
  const as = mediaKindFromSrc(src, parseMediaKind(item.as));
  const aspectRatio = aspectForCard(as, src);
  const span = parseColSpan(item.span) ?? defaultSpanForAspect(aspectRatio);
  const fit = item.fit === 'height' || item.fit === 'cols' ? item.fit : undefined;
  return makeScreenItem(src, span, as, typeof item.alt === 'string' ? item.alt : '', fit);
}

function parseScreens(value: unknown, fallbackSrcs: string[]): ResearchScreen[] {
  if (!Array.isArray(value)) return screensFromSideSrcs(fallbackSrcs);
  const screens: ResearchScreen[] = [];
  value.forEach((raw) => {
    const rec = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
    const list = Array.isArray(rec.items) ? rec.items : Array.isArray(raw) ? raw : [];
    const items = list
      .map(parseScreenItem)
      .filter((item): item is ResearchScreenItem => Boolean(item))
      .slice(0, 3);
    if (items.length) screens.push({ items });
  });
  return screens.length ? screens : screensFromSideSrcs(fallbackSrcs);
}

function normalizeCard(card: unknown, fallbackNumber: number): ResearchCard {
  const c = (card && typeof card === 'object') ? (card as Record<string, unknown>) : {};
  const parsedNumber = Number(c.number);
  const number = Number.isFinite(parsedNumber) ? Math.max(0, Math.round(parsedNumber)) : fallbackNumber;
  let src = typeof c.src === 'string' ? c.src.trim() : '';
  let srcMobile = typeof c.srcMobile === 'string' ? c.srcMobile.trim() : '';
  let audioSrc = typeof c.audioSrc === 'string' ? c.audioSrc.trim() : '';
  const alt = typeof c.alt === 'string' ? c.alt : '';
  const as = parseMediaKind(c.as);
  // Legacy: audio cards stored the sound in `src`
  if (as === 'audio' && isAudioPath(src) && !audioSrc) {
    audioSrc = src;
    src = typeof c.poster === 'string' ? c.poster.trim() : '';
  } else if (as === 'audio' && !src && typeof c.poster === 'string') {
    src = c.poster.trim();
  }
  const aspectRatio = aspectForCard(as === 'audio' ? 'image' : as, src);
  const aspectRatioMobile = srcMobile
    ? aspectForCard('image', srcMobile)
    : aspectRatio;
  const auto = spansFromAspect(aspectRatio);
  const sideSrcs = parseSideSrcs(c.sideSrcs, c.sideSrc);
  return {
    number,
    src,
    srcMobile: srcMobile || undefined,
    audioSrc: as === 'audio' ? audioSrc : undefined,
    alt,
    as,
    caption: typeof c.caption === 'string' ? c.caption : '',
    date: typeof c.date === 'string' ? c.date : '',
    text: typeof c.text === 'string' ? c.text : '',
    links: parseLinks(c.links),
    sideSrcs,
    screens: parseScreens(c.screens, sideSrcs),
    spanW: parseMaxWidth(c.spanW),
    coverFit: parseCoverFit(c.coverFit, aspectRatio),
    spanH: parseSpan(c.spanH) ?? auto.spanH,
    aspectRatio,
    aspectRatioMobile,
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
      .filter((card) => Boolean(card.src) || (card.as === 'audio' && Boolean(card.audioSrc)));
  } catch {
    return [];
  }
}

export function getResearchCards(): ResearchCard[] {
  return loadJsonCards().sort((a, b) => a.number - b.number);
}
