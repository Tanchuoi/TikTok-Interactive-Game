// ─── Glitch Text ─── Chromatic aberration headline ───
import { type ReactNode } from 'react';

interface GlitchTextProps {
  children: ReactNode;
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
  className?: string;
}

export function GlitchText({ children, text, as: Tag = 'h1', className = '' }: GlitchTextProps) {
  return (
    <Tag
      className={`cyber-glitch ${className}`}
      data-text={text}
    >
      {children}
    </Tag>
  );
}
