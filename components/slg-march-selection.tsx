import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Clock, Zap, Swords } from 'lucide-react';
import { defendersData } from '@/data/defenders';
import { TileData } from './slg-map';
import { TroopData } from '@/data/troops';

interface SLGMarchSelectionProps {
  tile: TileData;
  troops: TroopData[];
  onClose: () => void;
  onMarch: (troopId: string) => void;
  onOpenFormation: () => void;
  isViewLocked: boolean;
  setIsViewLocked: (locked: boolean) => void;
  isTestMarch?: boolean;
}

export default function SLGMarchSelection({ tile, troops, onClose, onMarch, onOpenFormation, isViewLocked, setIsViewLocked, isTestMarch = false }: SLGMarchSelectionProps) {
  const availableTroops = troops;
  const [selectedTroopId, setSelectedTroopId] = useState<string | null>(availableTroops.length > 0 ? availableTroops[0].id : null);

  // Close when clicking outside if view is locked
  useEffect(() => {
    if (!isViewLocked) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.march-selection-container')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isViewLocked, onClose]);

  const selectedTroop = troops.find(t => t.id === selectedTroopId);
  
  const distance = Math.abs(tile.row - 6) + Math.abs(tile.col - 6);
  const timeSeconds = isTestMarch ? 0 : distance * 5;
  
  const formatTime = (secs: number) => {
    if (secs === 0) return '00:00:00';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `00:${m}:${s}`;
  };

  const defender = defendersData.find(d => d.地块等级 === tile.level) || defendersData[0];
  const enemyHp = defender.守军兵力;
  const enemyCount = defender.部队数量;

  let hintColor = 'bg-red-900/80 text-red-400';
  let hintText = '无异于以卵击石';
  
  if (selectedTroop) {
    const ratio = selectedTroop.hp / enemyHp;
    if (ratio > 1.2) {
      hintColor = 'bg-green-900/80 text-green-400';
      hintText = 'so easy';
    } else if (ratio >= 0.8) {
      hintColor = 'bg-orange-900/80 text-orange-400';
      hintText = '实力相当的对手';
    }
  }

  return (
    <div className="march-selection-container absolute bottom-0 left-0 right-0 h-[160px] bg-[#1a1c23]/95 border-t border-[#8b6b4a] flex z-50 animate-in slide-in-from-bottom-4">
      {/* Header / Close */}
      <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-[#1a1c23]/95 to-transparent flex items-center justify-between px-4">
        <div className="text-[#d4b484] font-serif text-lg">请选择出征部队</div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1 text-xs text-slate-300 cursor-pointer">
            <input type="checkbox" checked={isViewLocked} onChange={(e) => setIsViewLocked(e.target.checked)} />
            锁定视角
          </label>
          <button 
            onClick={onOpenFormation}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 transition-colors"
          >
            编队
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Left: Troops */}
      <div className="flex-1 p-3 flex gap-3 overflow-x-auto custom-scrollbar">
        {availableTroops.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            暂无可出征部队
          </div>
        ) : (
          availableTroops.map(troop => (
            <div 
              key={troop.id}
              onClick={() => setSelectedTroopId(troop.id)}
              className={`w-28 h-full shrink-0 border-2 relative cursor-pointer transition-all ${selectedTroopId === troop.id ? 'border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}
            >
                <div className="w-full h-full relative overflow-hidden rounded-full">
                  <Image src={troop.heroAvatar || `https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/hero-avatar/${troop.heroName}.png`} alt={troop.heroName} fill className="object-cover" unoptimized />
                </div>
              
              {/* Status */}
              <div className="absolute top-0 left-0 right-0 bg-black/60 text-center text-[10px] py-0.5 text-green-400">
                {troop.status}
              </div>

              {/* Tags */}
              <div className="absolute top-4 left-1 flex flex-col gap-1">
                <div className="w-4 h-4 bg-red-800 border border-red-400/50 text-[8px] flex items-center justify-center text-white rounded-sm">{troop.combatTag ? troop.combatTag.charAt(0) : '武'}</div>
                <div className="w-4 h-4 bg-slate-800 border border-slate-400/50 text-[8px] flex items-center justify-center text-white rounded-sm">{troop.type ? troop.type.charAt(0) : '骑'}</div>
              </div>

              {/* Name & Level */}
              <div className="absolute bottom-5 left-0 right-0 bg-gradient-to-t from-black to-transparent pt-4 pb-1 px-1 flex items-end gap-1">
                <span className="text-[10px] text-amber-400 font-mono">{troop.level}</span>
                <span className="text-xs text-white drop-shadow-md">{troop.heroName}</span>
              </div>

              {/* HP */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1">
                <div className="flex justify-between text-[9px] text-slate-300 mb-0.5">
                  <span>兵力</span>
                  <span className="font-mono">{troop.hp}</span>
                </div>
                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${(troop.hp / troop.maxHp) * 100}%` }}></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Right: Info & Actions */}
      <div className="w-[240px] bg-black/40 border-l border-slate-700/50 p-3 flex flex-col justify-between">
        <div className="flex flex-col gap-1 text-xs text-slate-300 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1"><Zap size={14} className="text-amber-400" /> 体力</div>
            <span>15(不消耗)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1"><Clock size={14} className="text-blue-400" /> 耗时</div>
            <span className="font-mono">{formatTime(timeSeconds)}</span>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 p-1.5 rounded mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1 text-red-400"><Swords size={14} /> 敌军</div>
            <span className="font-mono text-white">{enemyHp} × {enemyCount}</span>
          </div>
          <div className={`text-[10px] text-center py-0.5 rounded ${hintColor}`}>
            {hintText}
          </div>
        </div>

        <button 
          onClick={() => {
            if (selectedTroopId) {
              onMarch(selectedTroopId);
              onClose();
            }
          }}
          disabled={!selectedTroopId || (selectedTroop?.hp || 0) <= 0 || selectedTroop?.status !== '空闲'}
          className="w-full py-1.5 bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 border border-amber-400/50 rounded text-amber-100 font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(217,119,6,0.3)] mt-auto"
        >
          {selectedTroop?.status !== '空闲' ? '状态不符' : (selectedTroop?.hp || 0) <= 0 ? '兵力不足' : '出征'}
        </button>
      </div>
    </div>
  );
}
