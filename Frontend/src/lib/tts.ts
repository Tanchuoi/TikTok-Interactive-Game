import { franc } from 'franc-min';
import langs from 'langs';

// Queue to hold speech requests so they don't overlap
const queue: string[] = [];
let isPlaying = false;

function playNext() {
  if (isPlaying || queue.length === 0) return;
  
  isPlaying = true;
  const text = queue.shift()!;
  
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Detect language using franc
    const iso3Lang = franc(text, { minLength: 3 });
    let langCode = 'vi-VN'; // default
    
    if (iso3Lang && iso3Lang !== 'und') {
      const langMapping = langs.where('3', iso3Lang);
      if (langMapping && langMapping['1']) {
        langCode = langMapping['1'];
        // Try to match regional codes if applicable (en-US, vi-VN, th-TH, ko-KR)
        if (langCode === 'vi') langCode = 'vi-VN';
        if (langCode === 'en') langCode = 'en-US';
        if (langCode === 'th') langCode = 'th-TH';
        if (langCode === 'ko') langCode = 'ko-KR';
      }
    }

    utterance.lang = langCode;
    utterance.rate = 1.1; // slightly faster for live comments
    
    utterance.onend = () => {
      isPlaying = false;
      playNext();
    };
    
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      isPlaying = false;
      playNext();
    };
    
    window.speechSynthesis.speak(utterance);
    
  } catch (error) {
    console.error('TTS setup error:', error);
    isPlaying = false;
    playNext();
  }
}

export function speak(text: string) {
  if (!text) return;
  if (!('speechSynthesis' in window)) return;
  
  const safeText = text.substring(0, 100);
  queue.push(safeText);
  playNext();
}
