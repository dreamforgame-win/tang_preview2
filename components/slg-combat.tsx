import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Play, Pause, SkipForward, X } from 'lucide-react';
import { defendersData } from '@/data/defenders';
import { heroesData, Hero } from '@/data/heroes';
import { getHeroStats, updateHeroExp, getRequiredExpForLevel } from '@/data/experience';
import HeroCard from './hero-card';

// ... (rest of the file)

import { CombatSettlement, CombatHero } from './combat-settlement';
import { BattleReport } from '@/data/reports';

interface SLGCombatProps {
  tileLevel: number;
  troopId?: string | null;
  isReplay?: boolean;
  onClose: () => void;
  onBattleComplete?: (report: BattleReport) => void;
}

interface CombatLog {
  id: number;
  text: string;
  isPlayer: boolean;
}

interface FloatingText {
  id: number;
  heroId: string;
  text: string;
  type: 'damage' | 'heal' | 'skill';
}

export default function SLGCombat({ tileLevel, troopId, isReplay, onClose, onBattleComplete }: SLGCombatProps) {
  const [logs, setLogs] = useState<CombatLog[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [speed, setSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [combatResult, setCombatResult] = useState<{
    isVictory: boolean;
    expGained: number;
    heroUpdates: { heroId: number; oldLevel: number; newLevel: number; oldExp: number; newExp: number }[];
  } | null>(null);
  
  const [combatState, setCombatState] = useState<{ player: CombatHero[], enemy: CombatHero[] }>({ player: [], enemy: [] });
  const { player: playerHeroes, enemy: enemyHeroes } = combatState;
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [playerFormationName, setPlayerFormationName] = useState('默认阵型');
  const [enemyFormationName, setEnemyFormationName] = useState('默认阵型');
  
  const [animatingHero, setAnimatingHero] = useState<{ id: string, type: 'attack' | 'skill', key: number } | null>(null);
  
  const sideEffectsRef = useRef<{
    logs: {text: string, isPlayer: boolean}[];
    floatingTexts: {id: string, text: string, type: 'damage' | 'heal' | 'skill'}[];
    animatingHero: {id: string, type: 'attack' | 'skill', key: number} | null;
    isFinished: boolean;
    finishMessage: {text: string, isPlayer: boolean} | null;
  }>({ logs: [], floatingTexts: [], animatingHero: null, isFinished: false, finishMessage: null });

  const logsEndRef = useRef<HTMLDivElement>(null);

  const addFloatingText = (heroId: string, text: string, type: 'damage' | 'heal' | 'skill') => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, heroId, text, type }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1500);
  };

  const calculateDamage = useCallback((desc: string, attacker: CombatHero, target: CombatHero) => {
    let multiplier = 1;
    let isStrategy = desc.includes('谋略') || desc.includes('法术');
    let isHeal = desc.includes('恢复') || desc.includes('回血') || desc.includes('治疗');
    let isCrit = false;
    
    const match = desc.match(/(\d+)%/);
    if (match) {
      multiplier = parseInt(match[1]) / 100;
    }
    
    if (!isStrategy && !isHeal && !desc.includes('武力') && !desc.includes('物理')) {
      isStrategy = attacker.谋略 > attacker.武力;
    }
    
    // Passive Skill Effects (Attacker)
    const attackerPassive = attacker['被动技能 (Passive)'] || '';
    if (attackerPassive.includes('暴击率额外提升') && Math.random() < 0.2) {
      multiplier *= 1.5; // Simple crit
      isCrit = true;
    }
    if (attackerPassive.includes('普攻有') && attackerPassive.includes('概率') && Math.random() < 0.3) {
      multiplier *= 1.3; // Simple proc
    }
    if (attackerPassive.includes('距离目标越远') || attackerPassive.includes('破城')) {
      multiplier *= 1.2; // Simple damage boost
    }

    let value = 0;
    if (isHeal) {
      value = attacker.谋略 * multiplier * 2; 
    } else {
      if (isStrategy) {
        value = (attacker.谋略 * multiplier) * (300 / (300 + target.谋略));
      } else {
        value = (attacker.武力 * multiplier) * (300 / (300 + target.防御));
      }
      
      // Passive Skill Effects (Target)
      const targetPassive = target['被动技能 (Passive)'] || '';
      if (targetPassive.includes('自身血量低于50%') && (target.currentHp / target.maxHp) < 0.5) {
        value *= 0.6; // 40% damage reduction
      }
      if (targetPassive.includes('坚壁')) {
        value *= 0.8; // 20% damage reduction
      }
    }
    
    return { value: Math.max(1, Math.floor(value)), isHeal, isStrategy, isCrit };
  }, []);

  const addLog = (text: string, isPlayer: boolean) => {
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), text, isPlayer }]);
  };

  // Initialize combat
  useEffect(() => {
    setTimeout(() => {
      // Load player formation
      let pHeroes: CombatHero[] = [];
      let pFormName = '默认阵型';
      
      if (troopId) {
        try {
          const savedDataStr = localStorage.getItem('slg_formation_save');
          if (savedDataStr) {
            const savedData = JSON.parse(savedDataStr);
            const index = parseInt(troopId.replace('t', '')) - 1;
            const formation = savedData.formations?.[index];
            const formId = savedData.troopFormations?.[index];
            
            if (formId) {
               // We don't have formationsData imported here, so just use a generic name or hardcode a few
               const formNames: Record<number, string> = {
                 1001: "纵队阵", 1002: "雁行阵", 1003: "锥形阵", 1004: "六花阵", 1005: "疏阵"
               };
               pFormName = formNames[formId] || '未知阵法';
            }

            if (formation && Array.isArray(formation)) {
              formation.forEach((heroId, gridIndex) => {
                if (heroId) {
                  const hero = heroesData.find(h => h.id === heroId);
                  if (hero) {
                    const stats = getHeroStats(heroId);
                    const hp = stats.level * 100;
                    pHeroes.push({
                      ...hero,
                      id_unique: `player-${gridIndex}`,
                      currentHp: hp,
                      maxHp: hp,
                      level: stats.level,
                      isEnemy: false,
                      gridIndex,
                      energy: 0,
                      currentCooldown: (hero['普攻冷却时间/秒'] || 2) * 1000,
                      damageDealt: 0,
                      damageTaken: 0,
                      healingDone: 0,
                    });
                  }
                }
              });
            }
          }
        } catch (e) {
          console.error("Failed to load formation", e);
        }
      }

      // Fallback if no formation loaded
      if (pHeroes.length === 0) {
        pHeroes = [
          { ...heroesData[0], id_unique: 'player-4', currentHp: heroesData[0]['兵力(HP)'], maxHp: heroesData[0]['兵力(HP)'], level: 1, isEnemy: false, gridIndex: 4, energy: 0, currentCooldown: (heroesData[0]['普攻冷却时间/秒'] || 2) * 1000, damageDealt: 0, damageTaken: 0, healingDone: 0 },
          { ...heroesData[1], id_unique: 'player-3', currentHp: heroesData[1]['兵力(HP)'], maxHp: heroesData[1]['兵力(HP)'], level: 1, isEnemy: false, gridIndex: 3, energy: 0, currentCooldown: (heroesData[1]['普攻冷却时间/秒'] || 2) * 1000, damageDealt: 0, damageTaken: 0, healingDone: 0 },
          { ...heroesData[2], id_unique: 'player-5', currentHp: heroesData[2]['兵力(HP)'], maxHp: heroesData[2]['兵力(HP)'], level: 1, isEnemy: false, gridIndex: 5, energy: 0, currentCooldown: (heroesData[2]['普攻冷却时间/秒'] || 2) * 1000, damageDealt: 0, damageTaken: 0, healingDone: 0 }
        ];
      }
      
      setPlayerFormationName(pFormName);

      // Generate enemy heroes based on level
      const defenderConfig = defendersData.find(d => d.地块等级 === tileLevel) || defendersData[0];
      const eHeroes: CombatHero[] = [];
      const usedGridIndices = new Set<number>();
      
      for (let i = 0; i < defenderConfig.单部队武将数量; i++) {
        const randomHero = heroesData[Math.floor(Math.random() * heroesData.length)];
        let gridIndex = Math.floor(Math.random() * 9);
        while (usedGridIndices.has(gridIndex)) {
          gridIndex = Math.floor(Math.random() * 9);
        }
        usedGridIndices.add(gridIndex);
        
        eHeroes.push({
          ...randomHero,
          id_unique: `enemy-${gridIndex}`,
          currentHp: defenderConfig.武将兵力,
          maxHp: defenderConfig.武将兵力,
          level: defenderConfig.武将等级,
          isEnemy: true,
          gridIndex,
          energy: 0,
          currentCooldown: (randomHero['普攻冷却时间/秒'] || 2) * 1000,
          damageDealt: 0,
          damageTaken: 0,
          healingDone: 0,
        });
      }
      setEnemyFormationName('散兵阵');
      setCombatState({ player: pHeroes, enemy: eHeroes });

      addLog(`遭遇了 ${tileLevel}级地 守军，战斗开始！`, false);
    }, 0);
  }, [tileLevel, troopId]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Combat Loop
  useEffect(() => {
    if (isPaused || isFinished || playerHeroes.length === 0 || enemyHeroes.length === 0) return;

    const tickMs = 100;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0.1) {
          setIsFinished(true);
          addLog('战斗超时，平局！', false);
          return 0;
        }
        return prev - (tickMs / 1000) * speed;
      });

      setCombatState(prevState => {
        let newPlayer = prevState.player.map(h => ({...h}));
        let newEnemy = prevState.enemy.map(h => ({...h}));
        let logsToAdd: {text: string, isPlayer: boolean}[] = [];
        let floatingTextsToAdd: {id: string, text: string, type: 'damage' | 'heal' | 'skill'}[] = [];
        let newAnimatingHero: {id: string, type: 'attack' | 'skill', key: number} | null = null;
        
        const allHeroes = [...newPlayer, ...newEnemy].filter(h => h.currentHp > 0);
        if (allHeroes.length === 0) return prevState;
        
        allHeroes.forEach(hero => {
          if (hero.currentHp <= 0) return;
          
          hero.currentCooldown -= tickMs * speed;
          
          if (hero.currentCooldown <= 0) {
            const isPlayer = !hero.isEnemy;
            const allies = isPlayer ? newPlayer : newEnemy;
            const enemies = isPlayer ? newEnemy : newPlayer;
            const aliveEnemies = enemies.filter(h => h.currentHp > 0);
            const aliveAllies = allies.filter(h => h.currentHp > 0);
            
            if (aliveEnemies.length === 0) return;
            
            const isSkill = hero.energy >= 100;
            const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
            
            if (isSkill) {
              hero.energy = 0;
              const skillDesc = hero['主动技能 (Active, 100能量释放)'] || '';
              const skillMatch = skillDesc.match(/^【(.*?)】/);
              const skillName = skillMatch ? skillMatch[1] : '绝技';
              
              const { value, isHeal, isCrit } = calculateDamage(skillDesc, hero, target);
              
              newAnimatingHero = { id: hero.id_unique, type: 'skill', key: Date.now() + Math.random() };
              floatingTextsToAdd.push({ id: hero.id_unique, text: skillName, type: 'skill' });
              if (isCrit) floatingTextsToAdd.push({ id: hero.id_unique, text: '暴击!', type: 'skill' });
              
              if (isHeal) {
                const healTarget = aliveAllies.sort((a, b) => (a.currentHp/a.maxHp) - (b.currentHp/b.maxHp))[0];
                healTarget.currentHp = Math.min(healTarget.maxHp, healTarget.currentHp + value);
                healTarget.healingDone = (healTarget.healingDone || 0) + value;
                logsToAdd.push({ text: `[${hero.name}] 释放了技能【${skillName}】，为 [${healTarget.name}] 恢复了 ${value} 点生命！`, isPlayer });
                floatingTextsToAdd.push({ id: healTarget.id_unique, text: `+${value}`, type: 'heal' });
              } else {
                target.currentHp = Math.max(0, target.currentHp - value);
                hero.damageDealt = (hero.damageDealt || 0) + value;
                target.damageTaken = (target.damageTaken || 0) + value;
                logsToAdd.push({ text: `[${hero.name}] 释放了技能【${skillName}】，对 [${target.name}] 造成了 ${value} 点伤害！`, isPlayer });
                floatingTextsToAdd.push({ id: target.id_unique, text: `-${value}`, type: 'damage' });
              }
            } else {
              hero.energy = Math.min(100, hero.energy + 20);
              const attackDesc = hero['普通攻击'] || '';
              const { value, isCrit } = calculateDamage(attackDesc, hero, target);
              
              if (isCrit) floatingTextsToAdd.push({ id: hero.id_unique, text: '暴击!', type: 'skill' });
              
              target.currentHp = Math.max(0, target.currentHp - value);
              hero.damageDealt = (hero.damageDealt || 0) + value;
              target.damageTaken = (target.damageTaken || 0) + value;
              logsToAdd.push({ text: `[${hero.name}] 发动了普通攻击，对 [${target.name}] 造成了 ${value} 点伤害！`, isPlayer });
              newAnimatingHero = { id: hero.id_unique, type: 'attack', key: Date.now() + Math.random() };
              floatingTextsToAdd.push({ id: target.id_unique, text: `-${value}`, type: 'damage' });
            }
            
            hero.currentCooldown = (hero['普攻冷却时间/秒'] || 2) * 1000;
          }
        });
        
        const playerAlive = newPlayer.some(h => h.currentHp > 0);
        const enemyAlive = newEnemy.some(h => h.currentHp > 0);
        
        // Apply side effects outside of state calculation by using sideEffectsRef
        sideEffectsRef.current = {
          logs: logsToAdd,
          floatingTexts: floatingTextsToAdd,
          animatingHero: newAnimatingHero,
          isFinished: !playerAlive || !enemyAlive,
          finishMessage: (!playerAlive && !isFinished) ? { text: '我方部队全军覆没，战斗失败！', isPlayer: false } :
                         (!enemyAlive && !isFinished) ? { text: '敌方部队全军覆没，战斗胜利！', isPlayer: true } : null
        };
        
        return { player: newPlayer, enemy: newEnemy };
      });

    }, tickMs);

    return () => clearInterval(timer);
  }, [isPaused, isFinished, speed, playerHeroes.length, enemyHeroes.length, calculateDamage]);

  // Process side effects
  useEffect(() => {
    const effects = sideEffectsRef.current;
    
    if (effects.logs.length > 0) {
      const logsToAdd = [...effects.logs];
      setLogs(prev => [...prev, ...logsToAdd.map(l => ({ id: Date.now() + Math.random(), text: l.text, isPlayer: l.isPlayer }))]);
      effects.logs = [];
    }
    
    if (effects.floatingTexts.length > 0) {
      const ftsToAdd = [...effects.floatingTexts];
      ftsToAdd.forEach(ft => addFloatingText(ft.id, ft.text, ft.type));
      effects.floatingTexts = [];
    }
    
    if (effects.animatingHero) {
      setAnimatingHero(effects.animatingHero);
      effects.animatingHero = null;
    }
    
    if (effects.isFinished && !isFinished) {
      setIsFinished(true);
      if (effects.finishMessage) {
        const msg = { ...effects.finishMessage };
        setLogs(prev => [...prev, { id: Date.now() + Math.random(), text: msg.text, isPlayer: msg.isPlayer }]);
        effects.finishMessage = null;
      }
      
      // Calculate combat result
      const playerAlive = combatState.player.some(h => h.currentHp > 0);
      const enemyAlive = combatState.enemy.some(h => h.currentHp > 0);
      const isVictory = playerAlive && !enemyAlive;
      
      const defenderConfig = defendersData.find(d => d.地块等级 === tileLevel) || defendersData[0];
      let totalExp = defenderConfig.战斗胜利总经验;
      
      if (!isVictory) {
        const enemyTotalMaxHp = combatState.enemy.reduce((sum, h) => sum + h.maxHp, 0);
        const enemyTotalCurrentHp = combatState.enemy.reduce((sum, h) => sum + h.currentHp, 0);
        const defeatedRatio = enemyTotalMaxHp > 0 ? (enemyTotalMaxHp - enemyTotalCurrentHp) / enemyTotalMaxHp : 0;
        totalExp = Math.floor(totalExp * defeatedRatio);
      }
      
      const expPerHero = combatState.player.length > 0 ? Math.floor(totalExp / combatState.player.length) : 0;
      
      const heroUpdates = combatState.player.map(hero => {
        const oldStats = getHeroStats(hero.id);
        const newStats = updateHeroExp(hero.id, expPerHero);
        return {
          heroId: hero.id,
          oldLevel: oldStats.level,
          newLevel: newStats.level,
          oldExp: oldStats.exp,
          newExp: newStats.exp
        };
      });
      
      const resultObj = {
        isVictory,
        expGained: expPerHero,
        heroUpdates
      };
      
      setCombatResult(resultObj);

      if (onBattleComplete) {
        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        onBattleComplete({
          id: Date.now(),
          type: 'PVE',
          location: `资源土地 (${tileLevel}级)`,
          time: timeStr,
          result: resultObj,
          playerFormationName: playerFormationName,
          enemyFormationName: enemyFormationName,
          playerHeroes: combatState.player,
          enemyHeroes: combatState.enemy,
          timeRemaining,
          tileLevel,
          troopId: troopId || null
        });
      }
    }
  }, [combatState, isFinished, enemyFormationName, onBattleComplete, playerFormationName, tileLevel, timeRemaining, troopId]);

  const handleSkip = () => {
    setIsFinished(true);
    addLog('跳过战斗，直接结算！', true);
    // Set all enemies to 0 HP for win
    setCombatState(prev => ({ ...prev, enemy: prev.enemy.map(h => ({ ...h, currentHp: 0 })) }));
  };

  const cycleSpeed = () => {
    const speeds = [1, 2, 3, 5];
    const currentIndex = speeds.indexOf(speed);
    setSpeed(speeds[(currentIndex + 1) % speeds.length]);
  };

  const playerTotalHp = playerHeroes.reduce((sum, h) => sum + h.currentHp, 0);
  const playerMaxHp = playerHeroes.reduce((sum, h) => sum + h.maxHp, 0);
  const enemyTotalHp = enemyHeroes.reduce((sum, h) => sum + h.currentHp, 0);
  const enemyMaxHp = enemyHeroes.reduce((sum, h) => sum + h.maxHp, 0);

  const renderGrid = (heroes: CombatHero[], isEnemy: boolean) => {
    const cells = Array(9).fill(null);
    heroes.forEach(h => {
      // Rotate 90 degrees clockwise:
      // (0,0) -> (0,2), (0,1) -> (1,2), (0,2) -> (2,2)
      // (1,0) -> (0,1), (1,1) -> (1,1), (1,2) -> (2,1)
      // (2,0) -> (0,0), (2,1) -> (1,0), (2,2) -> (2,0)
      // Formula: newRow = oldCol, newCol = 2 - oldRow
      const oldRow = Math.floor(h.gridIndex / 3);
      const oldCol = h.gridIndex % 3;
      const newRow = oldCol;
      const newCol = 2 - oldRow;
      const newIndex = newRow * 3 + newCol;
      
      if (newIndex >= 0 && newIndex < 9) {
        cells[newIndex] = h;
      }
    });

    return (
      <div className="relative perspective-[1000px] w-[240px] h-[240px]">
        <div 
          className="grid grid-cols-3 gap-2 absolute inset-0"
          style={{
            transform: `rotateX(55deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {cells.map((hero, i) => {
            const heroId = `${isEnemy ? 'enemy' : 'player'}-${i}`;
            const isAnimating = animatingHero?.id === heroId;
            const animDuration = Math.min(600, 800 / speed);
            
            let animStyle = {};
            if (isAnimating) {
              const animName = animatingHero.type === 'skill' 
                ? 'combat-skill' 
                : (isEnemy ? 'combat-attack-left' : 'combat-attack-right');
              animStyle = { animation: `${animName} ${animDuration}ms ease-in-out` };
            }

            return (
              <div
                key={i}
                className={`w-full h-full bg-slate-800/50 border rounded-sm shadow-[inset_0_0_10px_rgba(0,0,0,0.6)] relative flex items-center justify-center ${isEnemy ? 'border-red-900/50' : 'border-blue-900/50'}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_48%,rgba(148,163,184,0.1)_49%,rgba(148,163,184,0.1)_51%,transparent_52%),linear-gradient(90deg,transparent_48%,rgba(148,163,184,0.1)_49%,rgba(148,163,184,0.1)_51%,transparent_52%)] bg-[length:8px_8px]"></div>
                
                {hero && (
                  <div 
                    className={`absolute inset-0 flex flex-col items-center justify-center z-20 transition-opacity duration-300 ${hero.currentHp <= 0 ? 'opacity-30 grayscale' : 'opacity-100'}`}
                    style={{ transform: `translateZ(30px) rotateX(-55deg) translateY(10px)` }}
                  >
                    <div className="relative flex flex-col items-center" style={animStyle}>
                      {/* Floating Texts */}
                      {floatingTexts.filter(ft => ft.heroId === hero.id_unique).map(ft => (
                        <div 
                          key={ft.id}
                          className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-bold text-sm pointer-events-none z-50 animate-float-up ${
                            ft.type === 'damage' ? 'text-red-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' :
                            ft.type === 'heal' ? 'text-green-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' :
                            'text-amber-300 text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                          }`}
                          style={{
                            animationDuration: '1s',
                            animationFillMode: 'forwards'
                          }}
                        >
                          {ft.text}
                        </div>
                      ))}

                      <Image src={hero.资源路径 || `https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/hero-avatar/${hero.name}.png`} alt={hero.name} width={48} height={48} className={`w-12 h-12 object-cover rounded-full border-2 shadow-[0_5px_10px_rgba(0,0,0,0.6)] ${isEnemy ? 'border-red-500' : 'border-blue-500'}`} unoptimized />
                      <div className="absolute bottom-[-6px] z-10 flex items-center gap-0.5 drop-shadow-lg bg-slate-900/90 px-1 py-0.5 rounded border border-slate-700/50 whitespace-nowrap">
                        <span className="text-[9px] font-bold text-white">{hero.name}</span>
                      </div>
                      {/* HP Bar */}
                      <div className="absolute top-[-12px] w-10 h-1.5 bg-slate-900 border border-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full transition-all ${isEnemy ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${(hero.currentHp / hero.maxHp) * 100}%` }}></div>
                      </div>
                      {/* Energy Bar */}
                      <div className="absolute top-[-4px] w-10 h-1 bg-slate-900 border border-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 transition-all" style={{ width: `${Math.min(100, Math.max(0, hero.energy))}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#1a1c23] flex flex-col text-slate-200 font-sans overflow-hidden">
      <style>{`
        @keyframes combat-attack-right {
          0% { transform: translateX(0) scale(1); }
          50% { transform: translateX(40px) scale(1.1); filter: brightness(1.2); }
          100% { transform: translateX(0) scale(1); }
        }
        @keyframes combat-attack-left {
          0% { transform: translateX(0) scale(1); }
          50% { transform: translateX(-40px) scale(1.1); filter: brightness(1.2); }
          100% { transform: translateX(0) scale(1); }
        }
        @keyframes combat-skill {
          0% { transform: translateY(0) scale(1); filter: brightness(1); }
          50% { transform: translateY(-30px) scale(1.3); filter: brightness(1.5) drop-shadow(0 0 15px rgba(251, 191, 36, 0.8)); }
          100% { transform: translateY(0) scale(1); filter: brightness(1); }
        }
        @keyframes float-up {
          0% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -30px); opacity: 0; }
        }
      `}</style>

      {/* Settlement Screen */}
      {isFinished && combatResult && (
        <CombatSettlement 
          result={combatResult} 
          onClose={onClose} 
          playerHeroes={playerHeroes}
          enemyHeroes={enemyHeroes}
          playerFormationName={playerFormationName}
          enemyFormationName={enemyFormationName}
          timeRemaining={timeRemaining}
        />
      )}

      {/* Top Bar */}
      <div className="h-20 bg-gradient-to-b from-[#2a2c33] to-[#1a1c23] border-b border-amber-900/50 flex items-center justify-between px-6 shrink-0 shadow-lg relative z-10">
        
        {/* Player Info */}
        <div className="flex items-center gap-4 w-[40%]">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-bold text-sm">{playerFormationName}</span>
              <span className="text-slate-300 text-xs">我方部队</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-40 h-2.5 bg-slate-900 border border-slate-700 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all" style={{ width: `${(playerTotalHp / Math.max(1, playerMaxHp)) * 100}%` }}></div>
              </div>
              <span className="text-xs font-mono text-blue-200">{playerTotalHp}/{playerMaxHp}</span>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="w-16 h-16 rounded-full border-2 border-amber-600/50 bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center shadow-[0_0_15px_rgba(217,119,6,0.3)] z-20">
          <span className="text-2xl font-serif text-amber-500 drop-shadow-md">{Math.ceil(timeRemaining)}</span>
        </div>

        {/* Enemy Info */}
        <div className="flex items-center justify-end gap-4 w-[40%] text-right">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-xs">{tileLevel}级地守军</span>
              <span className="text-red-400 font-bold text-sm">{enemyFormationName}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-red-200">{enemyTotalHp}/{enemyMaxHp}</span>
              <div className="w-40 h-2.5 bg-slate-900 border border-slate-700 rounded-full overflow-hidden shadow-inner flex justify-end">
                <div className="h-full bg-gradient-to-l from-red-600 to-red-400 transition-all" style={{ width: `${(enemyTotalHp / Math.max(1, enemyMaxHp)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battlefield Middle */}
      <div className="flex-1 relative bg-[#22252e] overflow-hidden flex items-center justify-center">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#8b6b4a 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#1a1c23_100%)] pointer-events-none"></div>
        
        {/* Player Formation */}
        <div className="absolute left-10 md:left-20 top-1/2 -translate-y-1/2">
          {renderGrid(playerHeroes, false)}
        </div>

        {/* Enemy Formation */}
        <div className="absolute right-10 md:right-20 top-1/2 -translate-y-1/2">
          {renderGrid(enemyHeroes, true)}
        </div>
      </div>

      {/* Bottom Log & Controls */}
      <div className="h-[120px] bg-gradient-to-t from-[#1a1c23] to-[#2a2c33] border-t border-amber-900/50 flex shrink-0 relative z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        {/* Logs */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar text-xs leading-relaxed font-mono">
          {logs.map(log => (
            <div key={log.id} className="mb-1.5 flex items-start gap-2">
              <span className={`shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full ${log.isPlayer ? 'bg-blue-500' : 'bg-red-500'}`}></span>
              <span className={log.isPlayer ? 'text-blue-200' : 'text-red-200'}>
                {log.text}
              </span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>

        {/* Controls */}
        <div className="w-[220px] border-l border-amber-900/30 flex flex-col items-center justify-center gap-3 p-4 bg-black/20">
          <button 
            onClick={onClose}
            className="w-full py-2 bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border border-slate-500 rounded text-sm text-slate-200 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <X size={16} /> {isFinished ? '退出战斗' : '撤退'}
          </button>
          
          <div className="flex items-center gap-2 w-full">
            <button 
              onClick={handleSkip}
              disabled={isFinished}
              className="flex-1 py-2 bg-gradient-to-b from-amber-700/80 to-amber-900/80 hover:from-amber-600/80 hover:to-amber-800/80 border border-amber-500/50 rounded text-sm text-amber-100 flex items-center justify-center gap-1 disabled:opacity-50 disabled:grayscale transition-all shadow-md"
            >
              <SkipForward size={14} /> 跳过
            </button>
            <button 
              onClick={() => setIsPaused(!isPaused)}
              disabled={isFinished}
              className="w-12 h-9 bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border border-slate-500 rounded flex items-center justify-center text-slate-200 disabled:opacity-50 transition-all shadow-md"
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button 
              onClick={cycleSpeed}
              className="w-12 h-9 bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border border-slate-500 rounded flex items-center justify-center text-amber-400 text-xs font-bold transition-all shadow-md"
            >
              x{speed}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

