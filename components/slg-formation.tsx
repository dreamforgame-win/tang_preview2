'use client';

import React, { useState } from 'react';
import { Undo2, X, Trash2 } from 'lucide-react';
import { heroesData, Hero } from '@/data/heroes';
import { strategiesData, Strategy } from '@/data/strategies';

const formationsData = [
    {
        "阵法id": 1001,
        "阵法名称": "纵队阵",
        "阵眼1位置": "[前排中]",
        "阵眼1效果": "防御 +15%，受击回能 +2",
        "阵眼2位置": "[中排中]",
        "阵眼2效果": "基础武力 +10%，物理吸血 +5%",
        "阵眼3位置": "[后排中]",
        "阵眼3效果": "敏捷 +10"
    },
    {
        "阵法id": 1002,
        "阵法名称": "雁行阵",
        "阵眼1位置": "[前排左]",
        "阵眼1效果": "最终减伤 +8%",
        "阵眼2位置": "[前排右]",
        "阵眼2效果": "最终减伤 +8%",
        "阵眼3位置": "[后排中]",
        "阵眼3效果": "谋略 +10%，初始能量 +15"
    },
    {
        "阵法id": 1003,
        "阵法名称": "锥形阵",
        "阵眼1位置": "[前排中]",
        "阵眼1效果": "最大兵力 +15%，治疗受护效果 +10%",
        "阵眼2位置": "[后排左]",
        "阵眼2效果": "每2秒恢复3点能量",
        "阵眼3位置": "[后排右]",
        "阵眼3效果": "每2秒恢复3点能量"
    },
    {
        "阵法id": 1004,
        "阵法名称": "六花阵",
        "阵眼1位置": "[前排中]",
        "阵眼1效果": "攻速 +15",
        "阵眼2位置": "[中排左]",
        "阵眼2效果": "物理穿透 +10%",
        "阵眼3位置": "[中排中]",
        "阵眼3效果": "武力 +15",
        "阵眼4位置": "[中排右]",
        "阵眼4效果": "攻速 +15"
    },
    {
        "阵法id": 1005,
        "阵法名称": "疏阵",
        "阵眼1位置": "[前排左]",
        "阵眼1效果": "武力 +12%",
        "阵眼2位置": "[前排右]",
        "阵眼2效果": "防御 +15%",
        "阵眼3位置": "[后排左]",
        "阵眼3效果": "谋略 +12%",
        "阵眼4位置": "[后排右]",
        "阵眼4效果": "初始能量 +25"
    }
];

const positionToIndex: Record<string, number> = {
  '[前排左]': 0, '[前排中]': 1, '[前排右]': 2,
  '[中排左]': 3, '[中排中]': 4, '[中排右]': 5,
  '[后排左]': 6, '[后排中]': 7, '[后排右]': 8,
};

const getActivePositions = (form: any) => {
  const positions: number[] = [];
  for (let i = 1; i <= 4; i++) {
    const posStr = form[`阵眼${i}位置`];
    if (posStr && positionToIndex[posStr] !== undefined) {
      positions.push(positionToIndex[posStr]);
    }
  }
  return positions;
};

const getEffects = (form: any) => {
  const effects = [];
  for (let i = 1; i <= 4; i++) {
    const posStr = form[`阵眼${i}位置`];
    const desc = form[`阵眼${i}效果`];
    if (posStr && desc) {
      effects.push({ pos: posStr, desc, index: positionToIndex[posStr] });
    }
  }
  return effects;
};

const getStrategyPreviewGrid = (condition: string) => {
  let selfIndex = 4;
  let targetIndices: number[] = [];

  switch (condition) {
    case '右侧1格': targetIndices = [5]; break;
    case '左侧1格': targetIndices = [3]; break;
    case '上方1格': targetIndices = [1]; break;
    case '下方1格': targetIndices = [7]; break;
    case '右下方1格': targetIndices = [8]; break;
    case '左上方1格': targetIndices = [0]; break;
    case '右上方1格': targetIndices = [2]; break;
    case '右侧第2格': selfIndex = 3; targetIndices = [5]; break;
    case '同一列': targetIndices = [1, 4, 7]; break;
    case '同一行': targetIndices = [3, 4, 5]; break;
    case '周边8格': targetIndices = [0, 1, 2, 3, 5, 6, 7, 8]; break;
    case '全图': targetIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8]; break;
    case '距离最远的': targetIndices = [0, 2, 6, 8]; break;
    case '距离最近的': targetIndices = [1, 3, 5, 7]; break;
    default: break;
  }

  return { selfIndex, targetIndices };
};

const getBuffedSlots = (strategy: Strategy, stratIndex: number, currentFormation: (number | null)[], currentStrategyFormation: (number | null)[]) => {
  const buffed: number[] = [];
  const row = Math.floor(stratIndex / 3);
  const col = stratIndex % 3;

  const addIfValid = (r: number, c: number) => {
    if (r >= 0 && r < 3 && c >= 0 && c < 3) {
      buffed.push(r * 3 + c);
    }
  };

  switch (strategy.空间条件) {
    case '右侧1格': addIfValid(row, col + 1); break;
    case '左侧1格': addIfValid(row, col - 1); break;
    case '上方1格': addIfValid(row - 1, col); break;
    case '下方1格': addIfValid(row + 1, col); break;
    case '右下方1格': addIfValid(row + 1, col + 1); break;
    case '左上方1格': addIfValid(row - 1, col - 1); break;
    case '右上方1格': addIfValid(row - 1, col + 1); break;
    case '右侧第2格': addIfValid(row, col + 2); break;
    case '同一列': 
      for (let r = 0; r < 3; r++) addIfValid(r, col);
      break;
    case '同一行':
      for (let c = 0; c < 3; c++) addIfValid(row, c);
      break;
    case '周边8格':
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r !== row || c !== col) addIfValid(r, c);
        }
      }
      break;
    case '全图':
      for (let i = 0; i < 9; i++) buffed.push(i);
      break;
    case '距离最远的':
    case '距离最近的':
      let targetIndex = -1;
      let targetDist = strategy.空间条件 === '距离最远的' ? -1 : 999;
      const targetArray = strategy.目标类型 === '兵略' ? currentStrategyFormation : currentFormation;
      
      targetArray.forEach((id, idx) => {
        if (id && idx !== stratIndex) {
          const hRow = Math.floor(idx / 3);
          const hCol = idx % 3;
          const dist = Math.abs(hRow - row) + Math.abs(hCol - col);
          if (strategy.空间条件 === '距离最远的' && dist > targetDist) {
            targetDist = dist;
            targetIndex = idx;
          } else if (strategy.空间条件 === '距离最近的' && dist < targetDist && dist > 0) {
            targetDist = dist;
            targetIndex = idx;
          }
        }
      });
      if (targetIndex !== -1) buffed.push(targetIndex);
      break;
  }
  return buffed;
};

export default function SLGFormation({ onClose }: { onClose?: () => void }) {
  const [activeTroop, setActiveTroop] = useState(0);
  const [activeTab, setActiveTab] = useState<'兵力' | '武将' | '军略'>('兵力');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingFromGrid, setIsDraggingFromGrid] = useState(false);
  const [isOverRemoveZone, setIsOverRemoveZone] = useState(false);
  const [selectedBuffs, setSelectedBuffs] = useState<{heroName: string, formationBuff?: string, strategyBuffs?: string[]} | null>(null);
  const [noTargetModal, setNoTargetModal] = useState<{show: boolean, stratName: string}>({show: false, stratName: ''});
  
  // Interaction states
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [pressingStrategyId, setPressingStrategyId] = useState<number | null>(null);
  const [pressProgress, setPressProgress] = useState(0);
  
  // Selection states for connections
  const [selectedGridSlot, setSelectedGridSlot] = useState<number | null>(null);
  const [connectionLines, setConnectionLines] = useState<{from: number, to: number}[]>([]);
  
  // 5 troops, each with 9 slots
  const [formations, setFormations] = useState<(number | null)[][]>(
    Array.from({ length: 5 }, () => Array(9).fill(null))
  );

  // 5 troops, each with 9 strategy slots
  const [strategyFormations, setStrategyFormations] = useState<(number | null)[][]>(
    Array.from({ length: 5 }, () => Array(9).fill(null))
  );

  // 5 troops, each with a selected formation ID (default to 1001)
  const [troopFormations, setTroopFormations] = useState<number[]>(
    Array(5).fill(1001)
  );

  const handleDragStartHero = (e: React.DragEvent, heroId: number, sourceIndex?: number) => {
    setIsDragging(true);
    if (sourceIndex !== undefined) setIsDraggingFromGrid(true);
    e.dataTransfer.setData('heroId', heroId.toString());
    if (sourceIndex !== undefined) {
      e.dataTransfer.setData('sourceIndex', sourceIndex.toString());
    }
    
    // Create a custom drag image
    const hero = heroesData.find(h => h.id === heroId);
    if (hero) {
      const dragIcon = document.createElement('div');
      dragIcon.style.position = 'absolute';
      dragIcon.style.top = '-1000px';
      dragIcon.style.left = '-1000px';
      dragIcon.className = 'w-[60px] h-[60px] rounded-full border-2 border-blue-400 overflow-hidden';
      dragIcon.innerHTML = `<img src="${hero.资源路径}" style="width: 100%; height: 100%; object-fit: cover;" />`;
      document.body.appendChild(dragIcon);
      e.dataTransfer.setDragImage(dragIcon, 30, 30);
      setTimeout(() => document.body.removeChild(dragIcon), 0);
    }
  };

  const handleDragStartStrategy = (e: React.DragEvent, strategyId: number, sourceIndex?: number) => {
    setIsDragging(true);
    if (sourceIndex !== undefined) setIsDraggingFromGrid(true);
    e.dataTransfer.setData('strategyId', strategyId.toString());
    if (sourceIndex !== undefined) {
      e.dataTransfer.setData('sourceIndex', sourceIndex.toString());
    }

    if (longPressTimer) {
      clearInterval(longPressTimer);
      setLongPressTimer(null);
    }
    setPressingStrategyId(null);
    setPressProgress(0);

    // Create a custom drag image
    const strat = strategiesData.find(s => s.id === strategyId);
    if (strat) {
      const dragIcon = document.createElement('div');
      dragIcon.style.position = 'absolute';
      dragIcon.style.top = '-1000px';
      dragIcon.style.left = '-1000px';
      const borderColor = strat.等级 === '橙品' ? 'border-orange-400' : strat.等级 === '紫品' ? 'border-purple-400' : 'border-blue-400';
      const textColor = strat.等级 === '橙品' ? 'text-orange-400' : strat.等级 === '紫品' ? 'text-purple-400' : 'text-blue-400';
      dragIcon.className = `w-[60px] h-[60px] rounded-full border-2 ${borderColor} bg-slate-800 flex items-center justify-center`;
      dragIcon.innerHTML = `<span class="text-xs font-bold leading-tight text-center px-1 ${textColor}">${strat.名称.substring(0, 4)}</span>`;
      document.body.appendChild(dragIcon);
      e.dataTransfer.setDragImage(dragIcon, 30, 30);
      setTimeout(() => document.body.removeChild(dragIcon), 0);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDraggingFromGrid(false);
    setIsOverRemoveZone(false);
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    setIsDragging(false);
    const heroIdStr = e.dataTransfer.getData('heroId');
    const strategyIdStr = e.dataTransfer.getData('strategyId');
    const sourceIndexStr = e.dataTransfer.getData('sourceIndex');
    const sourceIndex = sourceIndexStr ? parseInt(sourceIndexStr, 10) : -1;

    if (heroIdStr) {
      const heroId = parseInt(heroIdStr, 10);
      setFormations(prev => {
        const newFormations = [...prev];
        const currentFormation = [...newFormations[activeTroop]];
        
        // If swapping from another slot
        if (sourceIndex !== -1 && sourceIndex !== slotIndex) {
          const targetHeroId = currentFormation[slotIndex];
          currentFormation[sourceIndex] = targetHeroId; // Swap or clear
        } else {
          // Remove hero from previous slot if already in formation but not from a slot drag
          const existingIndex = currentFormation.indexOf(heroId);
          if (existingIndex !== -1 && existingIndex !== slotIndex) {
            currentFormation[existingIndex] = null;
          }
        }
        
        // Place hero in new slot
        currentFormation[slotIndex] = heroId;
        newFormations[activeTroop] = currentFormation;
        return newFormations;
      });
    } else if (strategyIdStr) {
      const strategyId = parseInt(strategyIdStr, 10);
      setStrategyFormations(prev => {
        const newFormations = [...prev];
        const currentFormation = [...newFormations[activeTroop]];
        
        // If swapping from another slot
        if (sourceIndex !== -1 && sourceIndex !== slotIndex) {
          const targetStrategyId = currentFormation[slotIndex];
          currentFormation[sourceIndex] = targetStrategyId; // Swap or clear
        } else {
          // Remove strategy from previous slot if already in formation
          const existingIndex = currentFormation.indexOf(strategyId);
          if (existingIndex !== -1 && existingIndex !== slotIndex) {
            currentFormation[existingIndex] = null;
          }
        }
        
        // Place strategy in new slot
        currentFormation[slotIndex] = strategyId;
        newFormations[activeTroop] = currentFormation;
        return newFormations;
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveHero = (slotIndex: number) => {
    setFormations(prev => {
      const newFormations = [...prev];
      const currentFormation = [...newFormations[activeTroop]];
      currentFormation[slotIndex] = null;
      newFormations[activeTroop] = currentFormation;
      return newFormations;
    });
  };

  const handleRemoveStrategy = (slotIndex: number) => {
    setStrategyFormations(prev => {
      const newFormations = [...prev];
      const currentFormation = [...newFormations[activeTroop]];
      currentFormation[slotIndex] = null;
      newFormations[activeTroop] = currentFormation;
      return newFormations;
    });
  };

  const handleRemoveDrop = (e: React.DragEvent) => {
    const sourceIndexStr = e.dataTransfer.getData('sourceIndex');
    const heroIdStr = e.dataTransfer.getData('heroId');
    const strategyIdStr = e.dataTransfer.getData('strategyId');
    
    if (sourceIndexStr) {
      const sourceIndex = parseInt(sourceIndexStr, 10);
      if (heroIdStr) {
        handleRemoveHero(sourceIndex);
      } else if (strategyIdStr) {
        handleRemoveStrategy(sourceIndex);
      }
    }
  };

  const currentFormation = formations[activeTroop];
  const currentStrategyFormation = strategyFormations[activeTroop];
  
  const deployedHeroes = currentFormation
    .map(id => heroesData.find(h => h.id === id))
    .filter((h): h is Hero => h !== undefined);

  const totalTroops = deployedHeroes.reduce((sum, hero) => sum + hero['兵力(HP)'], 0);

  const currentFormId = troopFormations[activeTroop];
  const currentFormData = formationsData.find(f => f.阵法id === currentFormId)!;
  const activePositions = getActivePositions(currentFormData);
  const currentEffects = getEffects(currentFormData);

  // Calculate buffed slots
  const heroBuffedSlots = new Set<number>();
  const heroBuffsPerSlot = new Map<number, string[]>();
  const heroBuffSourcesPerSlot = new Map<number, number[]>();
  
  const stratBuffedSlots = new Set<number>();
  const stratBuffsPerSlot = new Map<number, string[]>();
  const stratBuffSourcesPerSlot = new Map<number, number[]>();

  const activeStrategies = new Set<number>();

  currentStrategyFormation.forEach((stratId, stratIndex) => {
    if (!stratId) return;
    const strat = strategiesData.find(s => s.id === stratId);
    if (!strat) return;
    
    const targetSlots = getBuffedSlots(strat, stratIndex, currentFormation, currentStrategyFormation);
    let hasValidTarget = false;
    
    targetSlots.forEach(slotIdx => {
      if (strat.目标类型 === '兵略') {
        const targetStratId = currentStrategyFormation[slotIdx];
        if (targetStratId && slotIdx !== stratIndex) {
          hasValidTarget = true;
          stratBuffedSlots.add(slotIdx);
          if (!stratBuffsPerSlot.has(slotIdx)) stratBuffsPerSlot.set(slotIdx, []);
          stratBuffsPerSlot.get(slotIdx)!.push(`【${strat.名称}】${strat.效果}`);
          
          if (!stratBuffSourcesPerSlot.has(slotIdx)) stratBuffSourcesPerSlot.set(slotIdx, []);
          stratBuffSourcesPerSlot.get(slotIdx)!.push(stratIndex);
        }
      } else {
        const heroId = currentFormation[slotIdx];
        if (heroId) {
          const hero = heroesData.find(h => h.id === heroId);
          if (hero) {
            let isValidTarget = false;
            if (strat.目标类型 === '任意武将') isValidTarget = true;
            else if (strat.目标类型 === '勇武型武将' && hero.战斗页签 === '勇武') isValidTarget = true;
            else if (strat.目标类型 === '突袭型武将' && hero.战斗页签 === '突袭') isValidTarget = true;
            else if (strat.目标类型 === '辅助型武将' && hero.战斗页签 === '辅助') isValidTarget = true;
            else if (strat.目标类型 === '奇谋型武将' && hero.战斗页签 === '奇谋') isValidTarget = true;
            else if (strat.目标类型 === '武力最高的武将') isValidTarget = true; // simplified
            
            if (isValidTarget) {
              hasValidTarget = true;
              heroBuffedSlots.add(slotIdx);
              if (!heroBuffsPerSlot.has(slotIdx)) heroBuffsPerSlot.set(slotIdx, []);
              heroBuffsPerSlot.get(slotIdx)!.push(`【${strat.名称}】${strat.效果}`);
              
              if (!heroBuffSourcesPerSlot.has(slotIdx)) heroBuffSourcesPerSlot.set(slotIdx, []);
              heroBuffSourcesPerSlot.get(slotIdx)!.push(stratIndex);
            }
          }
        }
      }
    });

    if (hasValidTarget) {
      activeStrategies.add(stratIndex);
    }
  });

  const handleSlotClick = (index: number) => {
    if (selectedGridSlot === index) {
      setSelectedGridSlot(null);
      setConnectionLines([]);
      return;
    }
    
    setSelectedGridSlot(index);
    const lines: {from: number, to: number}[] = [];
    
    // If clicked a strategy, show lines to its targets AND lines from strategies buffing it
    const stratId = currentStrategyFormation[index];
    if (stratId) {
      const strat = strategiesData.find(s => s.id === stratId);
      if (strat) {
        const targetSlots = getBuffedSlots(strat, index, currentFormation, currentStrategyFormation);
        targetSlots.forEach(targetIdx => {
          if (strat.目标类型 === '兵略') {
            if (currentStrategyFormation[targetIdx] && targetIdx !== index) {
              lines.push({ from: index, to: targetIdx });
            }
          } else {
            const heroId = currentFormation[targetIdx];
            if (heroId) {
              const hero = heroesData.find(h => h.id === heroId);
              if (hero) {
                let isValidTarget = false;
                if (strat.目标类型 === '任意武将') isValidTarget = true;
                else if (strat.目标类型 === '勇武型武将' && hero.战斗页签 === '勇武') isValidTarget = true;
                else if (strat.目标类型 === '突袭型武将' && hero.战斗页签 === '突袭') isValidTarget = true;
                else if (strat.目标类型 === '辅助型武将' && hero.战斗页签 === '辅助') isValidTarget = true;
                else if (strat.目标类型 === '奇谋型武将' && hero.战斗页签 === '奇谋') isValidTarget = true;
                else if (strat.目标类型 === '武力最高的武将') isValidTarget = true;
                
                if (isValidTarget) {
                  lines.push({ from: index, to: targetIdx });
                }
              }
            }
          }
        });
      }
      
      // Also show lines FROM strategies buffing THIS strategy
      const sources = stratBuffSourcesPerSlot.get(index);
      if (sources) {
        sources.forEach(sourceIdx => {
          lines.push({ from: sourceIdx, to: index });
        });
      }
    }
    
    // If clicked a hero, show lines from strategies buffing it
    const heroId = currentFormation[index];
    if (heroId) {
      const sources = heroBuffSourcesPerSlot.get(index);
      if (sources) {
        sources.forEach(sourceIdx => {
          lines.push({ from: sourceIdx, to: index });
        });
      }
    }
    
    setConnectionLines(lines);
  };

  const handleStrategyPointerDown = (strat: Strategy, index: number) => {
    setPressingStrategyId(index);
    setPressProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setPressProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setSelectedStrategy(strat);
        setPressingStrategyId(null);
        setPressProgress(0);
      }
    }, 50); // 500ms total (100 / 10 * 50)
    
    setLongPressTimer(interval);
  };

  const handleStrategyPointerUp = () => {
    if (longPressTimer) {
      clearInterval(longPressTimer);
      setLongPressTimer(null);
    }
    setPressingStrategyId(null);
    setPressProgress(0);
  };

  return (
    <div className="w-[956px] h-[460px] relative text-slate-200 font-sans flex flex-col select-none overflow-hidden shadow-2xl mx-auto border border-slate-700/60 rounded-sm bg-slate-900">
      {/* Background Image with Cold Ink Wash Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://picsum.photos/seed/misty-mountain/1000/500?grayscale"
          className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
          alt="background"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/95 via-[#1e293b]/85 to-[#0f172a]/95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.15)_0%,transparent_70%)]"></div>
      </div>

      {/* Header */}
      <div className="h-[48px] flex items-center px-4 bg-gradient-to-r from-slate-900/90 to-transparent z-10 border-b border-slate-700/50 shadow-sm shrink-0">
        <Undo2 
          className="w-6 h-6 mr-3 cursor-pointer text-slate-400 hover:text-slate-100 transition-colors" 
          strokeWidth={2} 
          onClick={onClose}
        />
        <span className="text-[18px] tracking-widest font-serif text-slate-200">编队</span>
      </div>

      <div className="flex flex-1 z-20 overflow-hidden">
        {/* Sidebar */}
        <div className="w-[180px] flex flex-col pt-4 bg-slate-900/40 backdrop-blur-sm border-r border-slate-800/50 shrink-0">
          {['部队一', '部队二', '部队三', '部队四', '部队五'].map((item, index) => (
            <div
              key={item}
              onClick={() => setActiveTroop(index)}
              className={`h-[52px] flex items-center justify-center text-[16px] cursor-pointer transition-all duration-300 ${
                activeTroop === index
                  ? 'bg-gradient-to-r from-transparent via-blue-900/40 to-blue-800/60 text-blue-100 font-medium border-r-2 border-blue-400 shadow-[inset_-15px_0_30px_rgba(30,58,138,0.3)]'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <span className="tracking-[0.2em]">{item}</span>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Grid Area - 3D Perspective */}
          <div className="flex-1 relative perspective-[1000px] min-h-0 z-20">
            <div 
              className="grid grid-cols-3 gap-3 p-4 absolute"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: '-170px',
                marginTop: '-170px',
                transform: 'rotateX(55deg)',
                transformStyle: 'preserve-3d',
                width: '340px',
                height: '340px'
              }}
            >
              {/* SVG Lines Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" style={{ transform: 'translateZ(22px)' }}>
                <defs>
                  <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                    <stop offset="50%" stopColor="rgba(96, 165, 250, 0.8)" />
                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {connectionLines.map((line, idx) => {
                  // Calculate positions based on grid layout (3x3)
                  // Grid is 340x340, p-4 (16px), gap-3 (12px). Cell is ~94.66x94.66
                  const cellW = 94.66;
                  const cellH = 94.66;
                  const gap = 12;
                  const padding = 16;
                  const startX = padding + (line.from % 3) * (cellW + gap) + cellW / 2;
                  const startY = padding + Math.floor(line.from / 3) * (cellH + gap) + cellH / 2 + 13; // Offset for avatar's projected Y position
                  const endX = padding + (line.to % 3) * (cellW + gap) + cellW / 2;
                  const endY = padding + Math.floor(line.to / 3) * (cellH + gap) + cellH / 2 + 13; // Offset for avatar's projected Y position
                  
                  // Control points for bezier curve (arching upwards/backwards in grid space)
                  const cp1x = startX;
                  const cp1y = startY - 80;
                  const cp2x = endX;
                  const cp2y = endY - 80;

                  return (
                    <g key={idx}>
                      <path
                        d={`M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`}
                        fill="none"
                        stroke="rgba(59, 130, 246, 0.3)"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                      <path
                        d={`M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`}
                        fill="none"
                        stroke="url(#line-gradient)"
                        strokeWidth="3"
                        filter="url(#glow)"
                        className="animate-[dash_2s_linear_infinite]"
                        strokeDasharray="20 100"
                      />
                    </g>
                  );
                })}
              </svg>

              {currentFormation.map((heroId, i) => {
                const hero = heroId ? heroesData.find(h => h.id === heroId) : null;
                const stratId = currentStrategyFormation[i];
                const strat = stratId ? strategiesData.find(s => s.id === stratId) : null;
                const isActiveSlot = activePositions.includes(i);
                const slotEffect = currentEffects.find(e => e.index === i);
                const isBuffed = heroBuffedSlots.has(i);

                return (
                  <div
                    key={i}
                    onClick={() => handleSlotClick(i)}
                    onDrop={(e) => handleDrop(e, i)}
                    onDragOver={handleDragOver}
                    className={`w-full h-full bg-slate-800/50 border rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.6),0_10px_15px_rgba(0,0,0,0.4)] hover:border-blue-400/80 hover:shadow-[inset_0_0_30px_rgba(59,130,246,0.4),0_15px_25px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer relative group flex items-center justify-center ${selectedGridSlot === i ? 'border-green-400/80' : 'border-slate-500/50'}`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Grid floor pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_48%,rgba(148,163,184,0.1)_49%,rgba(148,163,184,0.1)_51%,transparent_52%),linear-gradient(90deg,transparent_48%,rgba(148,163,184,0.1)_49%,rgba(148,163,184,0.1)_51%,transparent_52%)] bg-[length:16px_16px]"></div>
                    
                    {/* Active Formation Slot Highlight */}
                    {isActiveSlot && (
                      <div className="absolute inset-0 bg-amber-500/30 z-0 pointer-events-none shadow-[inset_0_0_15px_rgba(245,158,11,0.5)]"></div>
                    )}
                    
                    {/* Selected Slot Highlight */}
                    {selectedGridSlot === i && (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(34,197,94,0.4)_100%)] z-0 pointer-events-none animate-pulse"></div>
                    )}

                    {/* Strategy Card */}
                    {strat && (
                      <div 
                        className={`absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none transition-opacity duration-300 ${isDragging ? 'opacity-30' : 'opacity-100'}`}
                        style={{ transform: 'translateZ(40px) rotateX(-55deg) translateY(22px)' }}
                      >
                        <div 
                          className="relative group/strat pointer-events-auto"
                          draggable
                          onDragStart={(e) => handleDragStartStrategy(e, strat.id, i)}
                          onDragEnd={handleDragEnd}
                          onPointerDown={() => handleStrategyPointerDown(strat, i)}
                          onPointerUp={handleStrategyPointerUp}
                          onPointerLeave={handleStrategyPointerUp}
                        >
                          <div 
                            className={`w-[52px] h-[52px] rounded-full border-2 ${strat.等级 === '橙品' ? 'border-orange-400' : strat.等级 === '紫品' ? 'border-purple-400' : 'border-blue-400'} shadow-[0_10px_20px_rgba(0,0,0,0.6)] bg-slate-800 flex items-center justify-center cursor-pointer hover:brightness-110 transition-all relative overflow-hidden ${!activeStrategies.has(i) ? 'grayscale opacity-80' : ''}`}
                          >
                            <span className={`text-[10px] font-bold leading-tight text-center px-1 ${strat.等级 === '橙品' ? 'text-orange-400' : strat.等级 === '紫品' ? 'text-purple-400' : 'text-blue-400'}`}>{strat.名称.substring(0, 4)}</span>
                            
                            {/* Long press progress ring */}
                            {pressingStrategyId === i && (
                              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                                <circle
                                  cx="26"
                                  cy="26"
                                  r="24"
                                  fill="none"
                                  stroke="rgba(255,255,255,0.8)"
                                  strokeWidth="4"
                                  strokeDasharray={`${(pressProgress / 100) * 150} 150`}
                                  className="transition-all duration-75"
                                />
                              </svg>
                            )}
                          </div>

                          {/* No Target Exclamation */}
                          {!activeStrategies.has(i) && (
                            <div 
                              className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-[10px] border border-slate-900 shadow-md z-30 cursor-pointer hover:scale-110"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNoTargetModal({show: true, stratName: strat.名称});
                              }}
                            >
                              !
                            </div>
                          )}

                          {/* Strategy Buff Indicator */}
                          {activeStrategies.has(i) && stratBuffedSlots.has(i) && (
                            <div 
                              className="absolute -top-1 -left-1 w-4 h-4 rounded-full border border-slate-900 flex items-center justify-center shadow-md z-30 cursor-pointer hover:scale-110 transition-transform bg-green-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBuffs({
                                  heroName: strat.名称,
                                  strategyBuffs: stratBuffsPerSlot.get(i)
                                });
                              }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 drop-shadow-md">
                                <path d="M12 19V5M12 5l-7 7M12 5l7 7"/>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {hero && (
                      <div 
                        className={`absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none transition-opacity duration-300 ${isDragging ? 'opacity-30' : 'opacity-100'}`}
                        style={{ transform: 'translateZ(40px) rotateX(-55deg) translateY(22px)' }}
                      >
                        <div 
                          className="relative group/hero pointer-events-auto flex flex-col items-center"
                          draggable
                          onDragStart={(e) => handleDragStartHero(e, hero.id, i)}
                          onDragEnd={handleDragEnd}
                        >
                          <img src={hero.资源路径} alt={hero.name} className="w-[52px] h-[52px] object-cover rounded-full border-2 border-blue-400 shadow-[0_10px_20px_rgba(0,0,0,0.6)] cursor-grab active:cursor-grabbing" />
                          <div className="absolute bottom-[-6px] z-10 flex items-center gap-0.5 drop-shadow-lg bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700/50 whitespace-nowrap">
                            <span className="text-[8px] text-amber-200/90 bg-black/50 px-0.5 rounded-sm">{hero.兵种页签.charAt(0)}</span>
                            <span className="text-[8px] text-amber-200/90 bg-black/50 px-0.5 rounded-sm">{hero.战斗页签.charAt(0)}</span>
                            <span className="text-[10px] font-bold text-white ml-0.5">{hero.name}</span>
                          </div>
                          
                          {(isActiveSlot || isBuffed) && (
                            <div 
                              className={`absolute -top-1 -left-1 w-4 h-4 rounded-full border border-slate-900 flex items-center justify-center shadow-md z-30 cursor-pointer hover:scale-110 transition-transform ${
                                isActiveSlot && isBuffed 
                                  ? 'bg-[linear-gradient(135deg,#fbbf24_50%,#22c55e_50%)]' 
                                  : isActiveSlot 
                                    ? 'bg-amber-400' 
                                    : 'bg-green-500'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBuffs({
                                  heroName: hero.name,
                                  formationBuff: isActiveSlot ? `【${currentFormData.阵法名称}】${slotEffect?.desc}` : undefined,
                                  strategyBuffs: heroBuffsPerSlot.get(i)
                                });
                              }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 drop-shadow-md">
                                <path d="M12 19V5M12 5l-7 7M12 5l7 7"/>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Hover indicator */}
                    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                );
              })}
            </div>

            {/* Formation Button */}
            {!isDraggingFromGrid && (
              <div className="absolute bottom-4 right-4 z-20">
                <button 
                  onClick={() => setShowFormationModal(true)}
                  className="bg-gradient-to-b from-amber-700 to-amber-900 border border-amber-500 hover:from-amber-600 hover:to-amber-800 shadow-[0_0_15px_rgba(245,158,11,0.3)] text-amber-100 px-4 py-2 rounded-sm text-sm tracking-wider flex items-center gap-2 transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  阵法：{currentFormData.阵法名称}
                </button>
              </div>
            )}

            {/* Un-slot Drop Zone */}
            {isDraggingFromGrid && (
              <div 
                className={`absolute top-0 right-0 w-[160px] h-full z-30 flex flex-col items-center justify-center transition-colors duration-200 ${isOverRemoveZone ? 'bg-red-600/60' : 'bg-red-500/30'} backdrop-blur-sm border-l border-red-500/50`}
                onDragOver={(e) => { e.preventDefault(); setIsOverRemoveZone(true); }}
                onDragLeave={() => setIsOverRemoveZone(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsOverRemoveZone(false);
                  handleRemoveDrop(e);
                }}
              >
                <Trash2 className="w-8 h-8 text-red-200 mb-2" />
                <span className="text-red-100 text-sm font-medium tracking-wider">拖到此处卸下</span>
              </div>
            )}
          </div>

          {/* Bottom Area */}
          <div className="flex flex-col shrink-0">
            {/* Tabs */}
            <div className="flex px-4 gap-1">
              {(['兵力', '武将', '军略'] as const).map(tab => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-1.5 text-[14px] cursor-pointer border-t border-x rounded-t-sm tracking-wider transition-colors ${
                    activeTab === tab
                      ? 'bg-gradient-to-t from-slate-800 to-slate-700 text-blue-100 border-slate-600/60 shadow-[0_-2px_10px_rgba(0,0,0,0.2)] font-medium'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/80 hover:text-slate-200 border-slate-700/50'
                  }`}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* Panel Content */}
            <div 
              className="h-[170px] bg-gradient-to-b from-slate-800 to-[#0b1120] border-t border-slate-600/60 pl-4 py-4 pr-0 flex justify-between relative shadow-[0_-5px_20px_rgba(0,0,0,0.4)] backdrop-blur-md"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleRemoveDrop(e);
              }}
            >
              
              {/* Content based on active tab */}
              <div className="flex-1 overflow-hidden flex">
                {activeTab === '兵力' && (
                  <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                    <div className="flex flex-col gap-2.5 w-full max-w-[420px]">
                      {deployedHeroes.length === 0 ? (
                        <div className="text-slate-500 text-sm italic py-4">暂无武将上阵，请在“武将”页签拖拽武将进行布阵</div>
                      ) : (
                        deployedHeroes.map((hero, i) => (
                          <div key={i} className="flex items-center gap-3 group shrink-0">
                            <div className="w-[36px] h-[36px] bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex overflow-hidden items-center justify-center shadow-inner rounded-sm shrink-0">
                              <img src={hero.资源路径} alt={hero.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="w-[56px] h-[26px] bg-slate-900/90 border border-slate-700 flex items-center justify-center text-[14px] text-blue-200 font-mono shadow-inner rounded-sm shrink-0">
                              {hero['兵力(HP)']}
                            </div>
                            <div className="flex-1 h-[4px] bg-slate-900 rounded-full relative overflow-hidden border border-slate-800">
                              <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400 w-full shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === '武将' && (
                  <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-[10px] pb-2 custom-scrollbar items-start pt-2 pr-4">
                    {heroesData.map(hero => {
                      const isDeployed = formations[activeTroop].includes(hero.id);
                      let frameUrl = 'https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/UI/tex_frm_lan.png';
                      if (hero.稀有度 === '名将') frameUrl = 'https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/UI/tex_frm_cheng.png';
                      else if (hero.稀有度 === '良将') frameUrl = 'https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/UI/tex_frm_zi.png';

                      return (
                        <div
                          key={hero.id}
                          draggable={!isDeployed}
                          onDragStart={(e) => handleDragStartHero(e, hero.id)}
                          onDragEnd={handleDragEnd}
                          className={`w-[80px] shrink-0 flex flex-col items-center ${isDeployed ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:-translate-y-2 transition-transform'}`}
                        >
                          <div className="w-[80px] h-[120px] rounded-sm overflow-hidden shadow-lg relative bg-slate-800">
                            <img src={hero.资源路径} alt={hero.name} className="absolute inset-0 w-full h-full object-cover" />
                            <img src={frameUrl} alt="frame" className="absolute inset-0 w-full h-full object-fill z-10 pointer-events-none" />
                            
                            <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-1.5 pt-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                              <div className="flex gap-1 text-[10px] text-amber-100/90 leading-none mb-1">
                                <span className="bg-black/60 px-1 rounded-sm border border-white/20 shadow-sm">{hero.兵种页签.charAt(0)}</span>
                                <span className="bg-black/60 px-1 rounded-sm border border-white/20 shadow-sm">{hero.战斗页签.charAt(0)}</span>
                              </div>
                              <span className="text-xs text-white font-bold truncate w-full text-center leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{hero.name}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === '军略' && (
                  <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-[10px] pb-2 custom-scrollbar items-start pt-2 pr-4">
                    {strategiesData.map(strat => {
                      const isDeployed = strategyFormations[activeTroop].includes(strat.id);
                      
                      let borderColor = 'border-blue-500/50';
                      let bgColor = 'from-blue-900/40 to-slate-900';
                      let textColor = 'text-blue-400';
                      if (strat.等级 === '橙品') {
                        borderColor = 'border-orange-500/50';
                        bgColor = 'from-orange-900/40 to-slate-900';
                        textColor = 'text-orange-400';
                      } else if (strat.等级 === '紫品') {
                        borderColor = 'border-purple-500/50';
                        bgColor = 'from-purple-900/40 to-slate-900';
                        textColor = 'text-purple-400';
                      }

                      return (
                        <div
                          key={strat.id}
                          draggable={!isDeployed}
                          onDragStart={(e) => handleDragStartStrategy(e, strat.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedStrategy(strat)}
                          className={`w-[80px] shrink-0 flex flex-col items-center ${isDeployed ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:-translate-y-2 transition-transform'}`}
                        >
                          <div className={`w-[80px] h-[120px] rounded-sm overflow-hidden shadow-lg relative bg-gradient-to-b ${bgColor} border ${borderColor} flex flex-col items-center p-1.5`}>
                            <div className={`text-[11px] ${textColor} mb-1 w-full text-center border-b border-white/10 pb-1 font-bold truncate`}>{strat.名称}</div>
                            <div className="flex-1 w-full flex items-center justify-center">
                              <div className="grid grid-cols-3 gap-[2px] w-[42px] h-[42px]">
                                {Array.from({length: 9}).map((_, i) => {
                                  const { selfIndex, targetIndices } = getStrategyPreviewGrid(strat.空间条件);
                                  const isSelf = i === selfIndex;
                                  const isTarget = targetIndices.includes(i);
                                  let cellClass = 'bg-slate-700/50';
                                  if (isSelf && isTarget) cellClass = 'bg-gradient-to-br from-green-500/60 to-orange-500/60';
                                  else if (isSelf) cellClass = 'bg-green-500/60';
                                  else if (isTarget) cellClass = 'bg-orange-500/60';
                                  return <div key={i} className={`w-full h-full rounded-[1px] ${cellClass}`} />
                                })}
                              </div>
                            </div>
                            <div className="text-[9px] text-slate-400 mt-1 text-center leading-tight line-clamp-2 w-full">
                              {strat.简要描述}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right: Actions (Only show in 兵力 tab for now, or keep it persistent) */}
              {activeTab === '兵力' && (
                <div className="flex flex-col items-end justify-end gap-3 shrink-0 ml-4 pr-4">
                  <div className="bg-slate-900/90 border border-slate-700/80 px-3 py-1 text-[14px] tracking-wider text-blue-100 font-mono shadow-inner rounded-sm">
                    {totalTroops}<span className="text-slate-600 mx-0.5">/</span>120000
                  </div>
                  <div className="flex gap-3">
                    <button className="bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600 hover:border-slate-500 hover:text-white px-6 py-2 text-[14px] transition-all shadow-lg rounded-sm text-slate-300 tracking-wider">
                      快速分兵
                    </button>
                    <button className="bg-gradient-to-b from-blue-700 to-blue-900 border border-blue-600 hover:from-blue-600 hover:to-blue-800 hover:shadow-[0_0_15px_rgba(30,58,138,0.6)] hover:border-blue-400 px-6 py-2 text-[14px] transition-all shadow-lg rounded-sm text-blue-50 font-medium tracking-wider">
                      确认分兵
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Formation Selection Modal */}
      {showFormationModal && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <div className="w-[840px] h-[400px] bg-slate-900 border border-slate-700 rounded shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-800 shrink-0">
              <h3 className="text-lg text-amber-500 font-serif tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-4 bg-amber-500 rounded-sm"></span>
                选择阵法
              </h3>
              <button 
                onClick={() => setShowFormationModal(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-x-auto flex gap-4 p-6 custom-scrollbar items-stretch">
              {formationsData.map(form => {
                const isSelected = troopFormations[activeTroop] === form.阵法id;
                const activePos = getActivePositions(form);
                const effects = getEffects(form);

                return (
                  <div 
                    key={form.阵法id}
                    onClick={() => {
                      const newTroopForms = [...troopFormations];
                      newTroopForms[activeTroop] = form.阵法id;
                      setTroopFormations(newTroopForms);
                    }}
                    className={`shrink-0 w-[240px] rounded border flex flex-col bg-slate-800/50 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] bg-slate-800' 
                        : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className={`text-center py-3 border-b border-slate-700/50 font-bold tracking-wider transition-colors ${isSelected ? 'text-amber-400 bg-amber-900/20' : 'text-slate-200 bg-slate-800/80'}`}>
                      {form.阵法名称}
                    </div>
                    
                    <div className="p-4 flex flex-col items-center gap-4 flex-1 overflow-y-auto custom-scrollbar">
                      {/* 3x3 Grid Mini Preview */}
                      <div className="grid grid-cols-3 gap-1 w-[100px] h-[100px] shrink-0">
                        {Array.from({length: 9}).map((_, i) => {
                          const isActive = activePos.includes(i);
                          return (
                            <div 
                              key={i} 
                              className={`border rounded-sm transition-colors ${
                                isActive 
                                  ? 'border-amber-500/80 bg-amber-500/40 shadow-[inset_0_0_8px_rgba(245,158,11,0.5)]' 
                                  : 'border-slate-600/50 bg-slate-700/30'
                              }`} 
                            />
                          );
                        })}
                      </div>
                      
                      {/* Effects List */}
                      <div className="w-full flex flex-col gap-2 text-xs">
                        {effects.map((eff, i) => (
                          <div key={i} className={`p-2 rounded border flex flex-col gap-1 ${isSelected ? 'bg-amber-900/10 border-amber-500/30' : 'bg-slate-900/50 border-slate-700/50'}`}>
                            <span className={isSelected ? 'text-amber-400 font-medium' : 'text-slate-400'}>{eff.pos}</span>
                            <span className="text-slate-300 leading-relaxed">{eff.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Strategy Info Modal */}
      {selectedStrategy && (
        <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center backdrop-blur-sm pointer-events-auto" onClick={() => setSelectedStrategy(null)}>
          <div className="w-[400px] bg-slate-900 border border-slate-700 rounded shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-800 shrink-0">
              <h3 className={`text-lg font-serif tracking-widest flex items-center gap-2 ${selectedStrategy.等级 === '橙品' ? 'text-orange-400' : selectedStrategy.等级 === '紫品' ? 'text-purple-400' : 'text-blue-400'}`}>
                <span className={`w-1.5 h-4 rounded-sm ${selectedStrategy.等级 === '橙品' ? 'bg-orange-400' : selectedStrategy.等级 === '紫品' ? 'bg-purple-400' : 'bg-blue-400'}`}></span>
                {selectedStrategy.名称}
              </h3>
              <button 
                onClick={() => setSelectedStrategy(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 text-sm text-slate-300">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-500">等级</span>
                <span className={selectedStrategy.等级 === '橙品' ? 'text-orange-400' : selectedStrategy.等级 === '紫品' ? 'text-purple-400' : 'text-blue-400'}>{selectedStrategy.等级}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-500">空间条件</span>
                <span>{selectedStrategy.空间条件}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-500">目标类型</span>
                <span>{selectedStrategy.目标类型}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-500">目标数量</span>
                <span>{selectedStrategy.目标数量}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-slate-800 pb-2">
                <span className="text-slate-500">效果</span>
                <span className="text-amber-200 leading-relaxed">{selectedStrategy.效果}</span>
              </div>
              <div className="flex flex-col gap-1 pt-2">
                <span className="text-slate-500">故事</span>
                <span className="italic text-slate-400 leading-relaxed">{selectedStrategy.故事}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Buffs Info Modal */}
      {selectedBuffs && (
        <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center backdrop-blur-sm pointer-events-auto" onClick={() => setSelectedBuffs(null)}>
          <div className="w-[360px] bg-slate-900 border border-slate-700 rounded shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-800 shrink-0">
              <h3 className="text-lg font-serif tracking-widest flex items-center gap-2 text-amber-400">
                <span className="w-1.5 h-4 rounded-sm bg-amber-400"></span>
                {selectedBuffs.heroName} - 增益效果
              </h3>
              <button 
                onClick={() => setSelectedBuffs(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 text-sm text-slate-300">
              {selectedBuffs.formationBuff && (
                <div className="flex flex-col gap-2">
                  <div className="text-amber-500 font-bold border-b border-slate-800 pb-1">阵法增益</div>
                  <div className="text-slate-300 leading-relaxed">{selectedBuffs.formationBuff}</div>
                </div>
              )}
              {selectedBuffs.strategyBuffs && selectedBuffs.strategyBuffs.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="text-green-500 font-bold border-b border-slate-800 pb-1">军略增益</div>
                  <ul className="list-disc pl-5 flex flex-col gap-1">
                    {selectedBuffs.strategyBuffs.map((buff, idx) => (
                      <li key={idx} className="text-slate-300 leading-relaxed">{buff}</li>
                    ))}
                  </ul>
                </div>
              )}
              {!selectedBuffs.formationBuff && (!selectedBuffs.strategyBuffs || selectedBuffs.strategyBuffs.length === 0) && (
                <div className="text-slate-500 italic text-center py-4">暂无增益效果</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -120;
          }
        }
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
      {/* No Target Modal */}
      {noTargetModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border-2 border-slate-600 rounded-lg shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="bg-slate-700 px-4 py-3 border-b border-slate-600 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-100">提示</h3>
              <button 
                onClick={() => setNoTargetModal({show: false, stratName: ''})}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-slate-200 text-lg">【{noTargetModal.stratName}】找不到可作用目标</p>
            </div>
            <div className="p-4 border-t border-slate-700 flex justify-center">
              <button 
                onClick={() => setNoTargetModal({show: false, stratName: ''})}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-md font-medium transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
