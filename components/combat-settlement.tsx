import React from 'react';
import { Hero } from '@/data/heroes';
import HeroCard from './hero-card';
import { ArrowLeft } from 'lucide-react';

export interface CombatHero extends Hero {
  id_unique: string;
  currentHp: number;
  maxHp: number;
  level: number;
  isEnemy: boolean;
  gridIndex: number;
  energy: number;
  currentCooldown: number;
  // Stats for combat report
  damageDealt?: number;
  damageTaken?: number;
  healingDone?: number;
}

interface CombatSettlementProps {
  result: { 
    isVictory: boolean; 
    expGained: number; 
    heroUpdates: { heroId: number; oldLevel: number; newLevel: number; oldExp: number; newExp: number }[] 
  };
  onClose: () => void;
  onReplay?: () => void;
  playerHeroes: CombatHero[];
  enemyHeroes: CombatHero[];
  playerFormationName: string;
  enemyFormationName: string;
  timeRemaining: number;
}

export function CombatSettlement({ 
  result, 
  onClose,
  onReplay,
  playerHeroes,
  enemyHeroes,
  playerFormationName,
  enemyFormationName,
  timeRemaining
}: CombatSettlementProps) {
  const playerDamage = playerHeroes.reduce((sum, h) => sum + (h.damageDealt || 0), 0);
  const enemyDamage = enemyHeroes.reduce((sum, h) => sum + (h.damageDealt || 0), 0);
  const playerCurrentHp = playerHeroes.reduce((sum, h) => sum + h.currentHp, 0);
  const playerMaxHp = playerHeroes.reduce((sum, h) => sum + h.maxHp, 0);
  const enemyCurrentHp = enemyHeroes.reduce((sum, h) => sum + h.currentHp, 0);
  const enemyMaxHp = enemyHeroes.reduce((sum, h) => sum + h.maxHp, 0);
  
  // Assuming total combat duration is 60s, calculate elapsed time
  const totalDuration = 60;
  const elapsedTime = Math.max(0, totalDuration - timeRemaining);

  return (
    <div className="absolute inset-0 z-[100] bg-[#1a1c23]/95 flex flex-col animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="h-14 flex items-center px-4 border-b border-amber-900/30 bg-[#2a2c33]">
        <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-300">
          <ArrowLeft size={20} />
        </button>
        <span className="text-slate-200 font-serif text-lg tracking-widest ml-4">战斗结算</span>
        {onReplay && (
          <button 
            onClick={onReplay} 
            className="ml-auto px-4 py-1.5 bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 border border-amber-700/50 rounded text-sm transition-colors"
          >
            回放战斗
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Troop Stats Bar */}
        <div className="flex items-center justify-between bg-[#2a2c33] p-4 rounded-lg border border-amber-900/30 text-xs">
          {/* Player Module */}
          <div className="flex items-center gap-4 w-[35%]">
            <div className="flex flex-col gap-1 flex-[3]">
              <div className="flex justify-between text-slate-300">
                <span>我方</span>
                <span>总输出: {playerDamage}</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div className="h-full bg-blue-500" style={{ width: `${(playerCurrentHp / playerMaxHp) * 100}%` }} />
              </div>
              <div className="text-slate-400">{playerCurrentHp} / {playerMaxHp}</div>
            </div>
            <div className="flex flex-col items-center gap-1 flex-[2]">
              <div className="text-slate-400">{playerFormationName}</div>
              <FormationGrid heroes={playerHeroes} />
            </div>
          </div>

          {/* Result Module */}
          <div className={`text-3xl font-serif font-bold ${result.isVictory ? 'text-amber-400' : 'text-slate-400'}`}>
            {result.isVictory ? '胜' : '败'}
          </div>

          {/* Enemy Module */}
          <div className="flex items-center gap-4 w-[35%] flex-row-reverse">
            <div className="flex flex-col gap-1 flex-[3] items-end">
              <div className="flex justify-between text-slate-300 w-full">
                <span>总输出: {enemyDamage}</span>
                <span>敌方</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div className="h-full bg-red-500" style={{ width: `${(enemyCurrentHp / enemyMaxHp) * 100}%` }} />
              </div>
              <div className="text-slate-400">{enemyCurrentHp} / {enemyMaxHp}</div>
            </div>
            <div className="flex flex-col items-center gap-1 flex-[2]">
              <div className="text-slate-400">{enemyFormationName}</div>
              <FormationGrid heroes={enemyHeroes} />
            </div>
          </div>
        </div>

        {/* Heroes Section */}
        <div className="flex justify-between items-start gap-4">
          {/* Player Heroes */}
          <div className="flex gap-[10px]">
            {playerHeroes.map((hero, i) => (
              <HeroStatsCard key={i} hero={hero} />
            ))}
          </div>
          
          {/* Central Stats */}
          <div className="w-[200px] bg-[#2a2c33] p-4 rounded-lg border border-amber-900/30 text-sm text-slate-300 space-y-2">
            <div className="text-slate-500">战斗时间</div>
            <div className="text-amber-200">{Math.floor(elapsedTime)}s</div>
            <div className="text-slate-500 pt-2">战果</div>
            <div className="space-y-1 text-xs">
              {result.heroUpdates.map((update, i) => {
                const hero = [...playerHeroes, ...enemyHeroes].find(h => h.id === update.heroId);
                return (
                  <div key={i} className="flex justify-between">
                    <span>{hero?.name}</span>
                    <span className="text-emerald-400">+{update.newExp - update.oldExp} 经验</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enemy Heroes */}
          <div className="flex gap-[10px] flex-row-reverse">
            {enemyHeroes.map((hero, i) => (
              <HeroStatsCard key={i} hero={hero} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormationGrid({ heroes }: { heroes: CombatHero[] }) {
  const grid = Array(9).fill(false);
  heroes.forEach(h => { if(h.gridIndex >= 0 && h.gridIndex < 9) grid[h.gridIndex] = true; });
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {grid.map((occupied, i) => (
        <div key={i} className={`w-2 h-2 ${occupied ? 'bg-amber-500/80' : 'bg-slate-700'}`} />
      ))}
    </div>
  );
}

function HeroStatsCard({ hero }: { hero: CombatHero }) {
  const hpPercent = Math.max(0, Math.min(100, (hero.currentHp / hero.maxHp) * 100));
  
  return (
    <div className="relative flex flex-col items-center gap-1">
      <div className="relative">
        <HeroCard hero={hero} cardClassName={hero.currentHp <= 0 ? 'grayscale' : ''} />
        {hero.currentHp <= 0 && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 text-red-500 font-bold text-sm border-2 border-red-500/50">战败</div>
        )}
      </div>
      
      {/* Troop Health Bar - 80px width */}
      <div className="w-[80px] h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
        <div className="h-full bg-emerald-500" style={{ width: `${hpPercent}%` }} />
      </div>
      
      {/* Stats - 3 items, 80x30px, vertical */}
      <div className="flex flex-col gap-1">
        <div className="w-[80px] h-[30px] bg-slate-800/50 rounded flex items-center justify-between px-2 text-[10px]">
          <span className="text-slate-500">输出</span>
          <span className="text-amber-200">{hero.damageDealt ?? 0}</span>
        </div>
        <div className="w-[80px] h-[30px] bg-slate-800/50 rounded flex items-center justify-between px-2 text-[10px]">
          <span className="text-slate-500">承伤</span>
          <span className="text-red-200">{hero.damageTaken ?? 0}</span>
        </div>
        <div className="w-[80px] h-[30px] bg-slate-800/50 rounded flex items-center justify-between px-2 text-[10px]">
          <span className="text-slate-500">治疗</span>
          <span className="text-emerald-200">{hero.healingDone ?? 0}</span>
        </div>
      </div>
    </div>
  );
}
