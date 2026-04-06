// ─── Country Data ─── Curated list with flag images from flagcdn.com ───
import type { Country } from '../types/index.js';

import vn from 'flag-icons/flags/4x3/vn.svg';
import us from 'flag-icons/flags/4x3/us.svg';
import jp from 'flag-icons/flags/4x3/jp.svg';
import kr from 'flag-icons/flags/4x3/kr.svg';
import br from 'flag-icons/flags/4x3/br.svg';
import fr from 'flag-icons/flags/4x3/fr.svg';
import de from 'flag-icons/flags/4x3/de.svg';
import gb from 'flag-icons/flags/4x3/gb.svg';
import th from 'flag-icons/flags/4x3/th.svg';
import id from 'flag-icons/flags/4x3/id.svg';
import ph from 'flag-icons/flags/4x3/ph.svg';
import my from 'flag-icons/flags/4x3/my.svg';
import mm from 'flag-icons/flags/4x3/mm.svg';
import sg from 'flag-icons/flags/4x3/sg.svg';
import kh from 'flag-icons/flags/4x3/kh.svg';
import inFlag from 'flag-icons/flags/4x3/in.svg';
import cn from 'flag-icons/flags/4x3/cn.svg';

export const COUNTRIES: Country[] = [
  { id: 'vn', name: 'Vietnam', flag: '🇻🇳', flagImage: vn, color: '#ff3333' },
  { id: 'th', name: 'Thailand', flag: '🇹🇭', flagImage: th, color: '#a855f7' },
  { id: 'id', name: 'Indonesia', flag: '🇮🇩', flagImage: id, color: '#ef4444' },
  { id: 'ph', name: 'Philippines', flag: '🇵🇭', flagImage: ph, color: '#0ea5e9' },
  { id: 'my', name: 'Malaysia', flag: '🇲🇾', flagImage: my, color: '#facc15' },
  { id: 'sg', name: 'Singapore', flag: '🇸🇬', flagImage: sg, color: '#ef4444' },
  { id: 'mm', name: 'Myanmar', flag: '🇲🇲', flagImage: mm, color: '#facc15' },
  { id: 'kh', name: 'Cambodia', flag: '🇰🇭', flagImage: kh, color: '#3b82f6' },
  { id: 'jp', name: 'Japan', flag: '🇯🇵', flagImage: jp, color: '#ef4444' },
  { id: 'kr', name: 'South Korea', flag: '🇰🇷', flagImage: kr, color: '#6366f1' },
  { id: 'us', name: 'USA', flag: '🇺🇸', flagImage: us, color: '#3b82f6' },
  { id: 'br', name: 'Brazil', flag: '🇧🇷', flagImage: br, color: '#22c55e' },
  { id: 'fr', name: 'France', flag: '🇫🇷', flagImage: fr, color: '#3b82f6' },
  { id: 'de', name: 'Germany', flag: '🇩🇪', flagImage: de, color: '#eab308' },
  { id: 'gb', name: 'UK', flag: '🇬🇧', flagImage: gb, color: '#dc2626' },
  { id: 'in', name: 'India', flag: '🇮🇳', flagImage: inFlag, color: '#f97316' },
  { id: 'cn', name: 'China', flag: '🇨🇳', flagImage: cn, color: '#dc2626' },
];

// Default selection (first 8)
export const DEFAULT_SELECTED_IDS = COUNTRIES.slice(0, 8).map(c => c.id);
