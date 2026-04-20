'use client';

import React, { useState } from 'react';
import { ArrowLeft, Search, Trash2, ChevronRight } from 'lucide-react';
import HeroCard from './hero-card';
import { BattleReport } from '@/data/reports';
import { CombatSettlement } from './combat-settlement';

interface SLGBattleReportsProps {
  reports: BattleReport[];
  onClose: () => void;
  onReplay: (report: BattleReport) => void;
}

export default function SLGBattleReports({ reports, onClose, onReplay }: SLGBattleReportsProps) {
  const [activeTab, setActiveTab] = useState('全部');
  const [selectedReport, setSelectedReport] = useState<BattleReport | null>(null);

  const filteredReports = activeTab === '全部' 
    ? reports 
    : reports.filter(r => r.type === activeTab);

  if (selectedReport) {
    return (
      <CombatSettlement 
        result={selectedReport.result}
        onClose={() => setSelectedReport(null)}
        onReplay={() => onReplay(selectedReport)}
        playerHeroes={selectedReport.playerHeroes}
        enemyHeroes={selectedReport.enemyHeroes}
        playerFormationName={selectedReport.playerFormationName}
        enemyFormationName={selectedReport.enemyFormationName}
        timeRemaining={selectedReport.timeRemaining}
      />
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-[#1a1c23] flex flex-col animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="h-14 flex items-center px-4 border-b border-amber-900/30 bg-[#2a2c33] shrink-0">
        <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-300 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="text-slate-200 font-serif text-lg tracking-widest ml-4">战报</span>
        <div className="ml-auto flex items-center gap-4">
          <button className="text-slate-400 hover:text-slate-200 transition-colors">
            <Search size={20} />
          </button>
          <button className="text-slate-400 hover:text-red-400 transition-colors">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Tabs Area */}
      <div className="flex flex-col shrink-0 bg-[#1a1c23]">
        <div className="flex px-4 gap-1 pt-4 pb-2">
          {['全部', 'PVE', 'PVP', '收藏'].map(tab => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-1.5 text-[14px] cursor-pointer border-t border-x rounded-t-sm tracking-wider transition-colors ${
                activeTab === tab
                  ? 'bg-gradient-to-t from-slate-800 to-slate-700 text-amber-200 border-amber-900/40 shadow-[0_-2px_10px_rgba(0,0,0,0.2)] font-medium'
                  : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 border-slate-700/30'
              }`}
            >
              {tab}
            </div>
          ))}
          <button className="ml-auto px-4 py-1 text-xs bg-amber-900/20 text-amber-400 border border-amber-900/40 rounded hover:bg-amber-900/40 transition-colors">
            一键阅读
          </button>
        </div>
      </div>

      {/* Report List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 custom-scrollbar">
        {filteredReports.map(report => {
          const playerPower = report.playerHeroes.reduce((sum, h) => sum + h.currentHp, 0);
          const enemyPower = report.enemyHeroes.reduce((sum, h) => sum + h.maxHp, 0);

          return (
            <div 
              key={report.id} 
              onClick={() => setSelectedReport(report)}
              className="group relative bg-[#2a2c33] border border-slate-700/50 hover:border-amber-900/40 rounded-sm p-4 flex items-center transition-all hover:bg-[#2d2f38] cursor-pointer"
            >
              {/* Left: Player Info */}
              <div className="flex items-center gap-4 flex-1">
                <div className="flex -space-x-4">
                  {report.playerHeroes.map((hero, i) => (
                    <div key={i} className="scale-75 origin-left">
                      <HeroCard hero={hero} className="shadow-lg" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-slate-200 font-medium">{report.playerFormationName}</div>
                  <div className="text-[10px] text-slate-500">兵力: {playerPower}</div>
                </div>
              </div>

              {/* Center: Result */}
              <div className="flex flex-col items-center justify-center px-8 shrink-0">
                <div className={`text-3xl font-serif font-bold italic ${report.result.isVictory ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' : 'text-slate-500'}`}>
                  {report.result.isVictory ? '胜' : '败'}
                </div>
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-slate-600 to-transparent my-1"></div>
                <div className="text-[10px] text-slate-500">{report.type}</div>
              </div>

              {/* Right: Enemy Info */}
              <div className="flex items-center gap-4 flex-1 flex-row-reverse">
                <div className="flex -space-x-4 flex-row-reverse">
                  {report.enemyHeroes.map((hero, i) => (
                    <div key={i} className="scale-75 origin-right">
                      <HeroCard hero={hero} className="shadow-lg" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <div className="text-slate-200 font-medium">{report.enemyFormationName}</div>
                  <div className="text-[10px] text-slate-500">兵力: {enemyPower}</div>
                </div>
              </div>

              {/* Meta Info Overlay */}
              <div className="absolute top-1 left-4 right-4 flex justify-between text-[9px] text-slate-600 pointer-events-none">
                <span>{report.location}</span>
                <span>{report.time}</span>
              </div>

              {/* Hover Action */}
              <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="text-amber-500/50" size={20} />
              </div>
            </div>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-600">
            <div className="w-16 h-16 border-2 border-dashed border-slate-800 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="opacity-20" />
            </div>
            <p className="text-sm tracking-widest">暂无相关战报</p>
          </div>
        )}
      </div>
    </div>
  );
}
