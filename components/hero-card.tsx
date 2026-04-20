import React from 'react';
import Image from 'next/image';
import { Hero } from '@/data/heroes';

interface HeroCardProps {
  hero: Hero;
  isSelected?: boolean;
  isDeployed?: boolean;
  deployedText?: string;
  onClick?: () => void;
  className?: string;
  cardClassName?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export default function HeroCard({
  hero,
  isSelected = false,
  isDeployed = false,
  deployedText,
  onClick,
  className = '',
  cardClassName = '',
  draggable = false,
  onDragStart,
  onDragEnd,
}: HeroCardProps) {
  let frameUrl = 'https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/UI/tex_frm_lan.png';
  if (hero.稀有度 === '名将') frameUrl = 'https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/UI/tex_frm_cheng.png';
  else if (hero.稀有度 === '良将') frameUrl = 'https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/UI/tex_frm_zi.png';

  return (
    <div
      className={`relative w-[80px] h-[120px] shrink-0 rounded-sm overflow-hidden ${className}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className={`w-full h-full relative bg-slate-800 transition-all ${cardClassName} ${isSelected ? 'ring-2 ring-amber-400 scale-105 z-10 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : ''}`}>
        <Image src={hero.资源路径} alt={hero.name} fill className="object-cover" unoptimized />
        <Image src={frameUrl} alt="frame" fill className="object-fill z-10 pointer-events-none" unoptimized />
        
        {/* Deployed Indicator */}
        {isDeployed && deployedText && (
          <div className="absolute top-0 left-0 right-0 bg-black/70 text-amber-400 text-[10px] text-center py-0.5 z-30 font-bold border-b border-amber-500/30 backdrop-blur-sm">
            {deployedText}
          </div>
        )}

        {/* Combat and Troop Type (Top Left) */}
        <div className={`absolute left-0 bg-black/60 text-[10px] px-1 py-0.5 rounded-br-sm z-20 flex flex-col items-center border-b border-r border-amber-500/30 gap-0.5 ${isDeployed && deployedText ? 'top-[18px]' : 'top-0'}`}>
          <span className="font-bold leading-tight text-amber-200/90">{hero.战斗页签.charAt(0)}</span>
          <span className="font-bold leading-tight text-blue-200/90">{hero.兵种页签.charAt(0)}</span>
        </div>

        {/* Name */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-6 pb-1.5 px-1 z-20 flex justify-center items-center">
          <span className="text-amber-100 text-xs font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate w-full text-center leading-none">
            {hero.level ? `Lv.${hero.level} ` : ''}{hero.name}
          </span>
        </div>
      </div>
    </div>
  );
}
