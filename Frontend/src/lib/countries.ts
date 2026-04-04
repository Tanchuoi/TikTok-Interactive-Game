// ─── Country Data ─── Curated list with flag images from flagcdn.com ───
import type { Country } from '../types/index.js';

export const COUNTRIES: Country[] = [
  { id: 'vn', name: 'Vietnam', flag: '🇻🇳', flagImage: 'https://flagcdn.com/w160/vn.png', color: '#ff3333' },
  { id: 'us', name: 'USA', flag: '🇺🇸', flagImage: 'https://flagcdn.com/w160/us.png', color: '#3b82f6' },
  { id: 'jp', name: 'Japan', flag: '🇯🇵', flagImage: 'https://flagcdn.com/w160/jp.png', color: '#ef4444' },
  { id: 'kr', name: 'Korea', flag: '🇰🇷', flagImage: 'https://flagcdn.com/w160/kr.png', color: '#6366f1' },
  { id: 'br', name: 'Brazil', flag: '🇧🇷', flagImage: 'https://flagcdn.com/w160/br.png', color: '#22c55e' },
  { id: 'fr', name: 'France', flag: '🇫🇷', flagImage: 'https://flagcdn.com/w160/fr.png', color: '#3b82f6' },
  { id: 'de', name: 'Germany', flag: '🇩🇪', flagImage: 'https://flagcdn.com/w160/de.png', color: '#eab308' },
  { id: 'gb', name: 'UK', flag: '🇬🇧', flagImage: 'https://flagcdn.com/w160/gb.png', color: '#dc2626' },
  { id: 'th', name: 'Thailand', flag: '🇹🇭', flagImage: 'https://flagcdn.com/w160/th.png', color: '#a855f7' },
  { id: 'id', name: 'Indonesia', flag: '🇮🇩', flagImage: 'https://flagcdn.com/w160/id.png', color: '#ef4444' },
  { id: 'ph', name: 'Philippines', flag: '🇵🇭', flagImage: 'https://flagcdn.com/w160/ph.png', color: '#0ea5e9' },
  { id: 'in', name: 'India', flag: '🇮🇳', flagImage: 'https://flagcdn.com/w160/in.png', color: '#f97316' },
  { id: 'mx', name: 'Mexico', flag: '🇲🇽', flagImage: 'https://flagcdn.com/w160/mx.png', color: '#16a34a' },
  { id: 'ru', name: 'Russia', flag: '🇷🇺', flagImage: 'https://flagcdn.com/w160/ru.png', color: '#2563eb' },
  { id: 'cn', name: 'China', flag: '🇨🇳', flagImage: 'https://flagcdn.com/w160/cn.png', color: '#dc2626' },
  { id: 'au', name: 'Australia', flag: '🇦🇺', flagImage: 'https://flagcdn.com/w160/au.png', color: '#2563eb' },
  { id: 'ca', name: 'Canada', flag: '🇨🇦', flagImage: 'https://flagcdn.com/w160/ca.png', color: '#ef4444' },
  { id: 'es', name: 'Spain', flag: '🇪🇸', flagImage: 'https://flagcdn.com/w160/es.png', color: '#f59e0b' },
  { id: 'it', name: 'Italy', flag: '🇮🇹', flagImage: 'https://flagcdn.com/w160/it.png', color: '#16a34a' },
  { id: 'tr', name: 'Turkey', flag: '🇹🇷', flagImage: 'https://flagcdn.com/w160/tr.png', color: '#ef4444' },
];

// Default selection (first 8)
export const DEFAULT_SELECTED_IDS = COUNTRIES.slice(0, 8).map(c => c.id);
