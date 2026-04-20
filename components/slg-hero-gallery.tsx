'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Undo2, Filter, ChevronLeft } from 'lucide-react';
import { heroesData, Hero } from '@/data/heroes';
import HeroCard from './hero-card';
import SLGHeroDetail from './slg-hero-detail';

export default function SLGHeroGallery({ onClose }: { onClose: () => void }) {
  const [selectedHero, setSelectedHero] = useState<Hero>(heroesData[0]);
  const [showFilter, setShowFilter] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    quality: [] as string[],
    troop: [] as string[],
    combat: [] as string[],
    owned: 'all' // 'all', 'owned', 'unowned'
  });

  // Apply filters
  const filteredHeroes = heroesData.filter(hero => {
    if (filters.quality.length > 0 && !filters.quality.includes(hero.稀有度)) return false;
    if (filters.troop.length > 0 && !filters.troop.includes(hero.兵种页签)) return false;
    if (filters.combat.length > 0 && !filters.combat.includes(hero.战斗页签)) return false;
    // Ownership is mock for now, assume all owned
    return true;
  });

  const toggleFilter = (type: keyof typeof filters, value: string) => {
    setFilters(prev => {
      if (type === 'owned') {
        return { ...prev, owned: value };
      }
      const list = prev[type] as string[];
      if (list.includes(value)) {
        return { ...prev, [type]: list.filter(v => v !== value) };
      } else {
        return { ...prev, [type]: [...list, value] };
      }
    });
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900 flex text-slate-200 font-sans overflow-hidden">
      {/* Full screen background of selected hero */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-slate-900">
        {/* Preload all hero backgrounds */}
        <div className="hidden">
          {heroesData.map(hero => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={`preload-${hero.id}`} src={`https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/hero-texture2/${hero.name2}.jpg`} alt="preload" />
          ))}
        </div>
        
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/hero-texture2/${selectedHero.name2}.jpg`}
          alt={selectedHero.name}
          className="absolute left-0 top-0 h-full w-auto max-w-none opacity-100"
        />
      </div>

      {/* Left Panel: Hero List & Top Bar */}
      <div className="w-[300px] h-full flex flex-col bg-slate-900/80 backdrop-blur-sm border-r border-slate-700/50 z-10 relative shrink-0">
        {/* Top Bar */}
        <div className="h-14 border-b border-slate-700/50 flex items-center px-4 shrink-0">
          <button onClick={onClose} className="flex items-center text-slate-400 hover:text-white transition-colors">
            <Undo2 size={24} className="mr-2" />
            <span className="text-lg tracking-widest font-serif">武将</span>
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-3 gap-2 content-start justify-items-center">
              {filteredHeroes.map(hero => (
                <HeroCard
                  key={hero.id}
                  hero={hero}
                  isSelected={selectedHero.id === hero.id}
                  onClick={() => setSelectedHero(hero)}
                  className="cursor-pointer"
                  cardClassName={selectedHero.id === hero.id ? '' : 'hover:scale-105 hover:z-10 opacity-90 hover:opacity-100'}
                />
              ))}
            </div>
          </div>

          {/* Bottom Filter Bar */}
          <div className="h-12 border-t border-slate-700/50 bg-slate-800/80 flex items-center px-4 shrink-0 justify-between relative">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 text-sm text-amber-200/80 hover:text-amber-200 transition-colors"
            >
              <Filter size={16} />
              <span>筛选</span>
            </button>
            <div className="text-xs text-slate-400">
              已拥有: {heroesData.length}/{heroesData.length}
            </div>

            {/* Filter Modal */}
            {showFilter && (
              <div className="absolute bottom-full left-0 w-full bg-slate-800 border-t border-slate-600 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] z-30 p-4 flex flex-col gap-4 animate-in slide-in-from-bottom-2">
                {/* 品质 */}
                <div>
                  <div className="text-xs text-slate-400 mb-2">品质</div>
                  <div className="flex gap-2 flex-wrap">
                    {['名将', '良将', '裨将'].map(q => (
                      <button 
                        key={q}
                        onClick={() => toggleFilter('quality', q)}
                        className={`px-3 py-1 text-xs rounded-sm border ${filters.quality.includes(q) ? 'bg-amber-500/20 border-amber-500 text-amber-200' : 'bg-slate-700/50 border-slate-600 text-slate-300'}`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 兵种 */}
                <div>
                  <div className="text-xs text-slate-400 mb-2">兵种</div>
                  <div className="flex gap-2 flex-wrap">
                    {['步兵', '骑兵', '弓兵', '枪兵'].map(t => (
                      <button 
                        key={t}
                        onClick={() => toggleFilter('troop', t)}
                        className={`px-3 py-1 text-xs rounded-sm border ${filters.troop.includes(t) ? 'bg-amber-500/20 border-amber-500 text-amber-200' : 'bg-slate-700/50 border-slate-600 text-slate-300'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 战斗类型 */}
                <div>
                  <div className="text-xs text-slate-400 mb-2">战斗类型</div>
                  <div className="flex gap-2 flex-wrap">
                    {['武力', '谋略', '辅助', '防御'].map(c => (
                      <button 
                        key={c}
                        onClick={() => toggleFilter('combat', c)}
                        className={`px-3 py-1 text-xs rounded-sm border ${filters.combat.includes(c) ? 'bg-amber-500/20 border-amber-500 text-amber-200' : 'bg-slate-700/50 border-slate-600 text-slate-300'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 拥有情况 */}
                <div>
                  <div className="text-xs text-slate-400 mb-2">拥有情况</div>
                  <div className="flex gap-2">
                    {[
                      { label: '全部', value: 'all' },
                      { label: '已拥有', value: 'owned' },
                      { label: '未拥有', value: 'unowned' }
                    ].map(o => (
                      <button 
                        key={o.value}
                        onClick={() => toggleFilter('owned', o.value)}
                        className={`px-3 py-1 text-xs rounded-sm border ${filters.owned === o.value ? 'bg-amber-500/20 border-amber-500 text-amber-200' : 'bg-slate-700/50 border-slate-600 text-slate-300'}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-700">
                  <button 
                    onClick={() => setFilters({ quality: [], troop: [], combat: [], owned: 'all' })}
                    className="px-4 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-sm transition-colors"
                  >
                    重置
                  </button>
                  <button 
                    onClick={() => setShowFilter(false)}
                    className="px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded-sm transition-colors"
                  >
                    确定
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Hero Details Overlay */}
        <div className="flex-1 relative pointer-events-none z-10">
          {/* Right side info */}
          <div className="absolute right-12 top-12 flex items-start gap-2 pointer-events-auto">
            {/* Name Vertical (Scaled down ~40%) */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-2 py-4 flex justify-center">
              <div className="text-white font-serif text-[18px] drop-shadow-md" style={{ writingMode: 'vertical-rl', letterSpacing: '0.15em' }}>
                <span className="text-amber-400">{selectedHero.战斗页签.charAt(0)}</span>
                <span className="inline-block h-2"></span>
                <span className="text-blue-300">{selectedHero.兵种页签.charAt(0)}</span>
                <span className="inline-block h-2"></span>
                <span>{selectedHero.name}</span>
              </div>
            </div>

            {/* Stars */}
            <div className="flex flex-col gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-3 h-3 bg-slate-500/60 clip-star rotate-180" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}></div>
              ))}
            </div>
          </div>

          {/* Details Button */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-auto">
            <button 
              onClick={() => setShowDetail(true)}
              className="flex items-center bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-r-0 border-white/20 text-amber-200/80 hover:text-amber-200 py-4 pl-2 pr-1 rounded-l-md transition-colors"
            >
              <ChevronLeft size={16} />
              <span className="text-sm" style={{ writingMode: 'vertical-rl' }}>详情</span>
            </button>
          </div>
        </div>

      {showDetail && (
        <SLGHeroDetail hero={selectedHero} onClose={() => setShowDetail(false)} />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.8);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 1);
        }
      `}} />
    </div>
  );
}
