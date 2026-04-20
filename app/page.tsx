'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import SLGFormation from '@/components/slg-formation';
import SLGMap from '@/components/slg-map';
import SLGHeroGallery from '@/components/slg-hero-gallery';
import SLGAllianceList from '@/components/slg-alliance-list';
import SLGAllianceMain from '@/components/slg-alliance-main';
import SLGAllianceMembers from '@/components/slg-alliance-members';
import SLGLogin from '@/components/slg-login';
import SLGCombat from '@/components/slg-combat';
import SLGMarchSelection from '@/components/slg-march-selection';
import { strategiesData } from '@/data/strategies';
import { TileData, SLGMapRef } from '@/components/slg-map';
import { initialTroops, TroopData } from '@/data/troops';
import { heroesData } from '@/data/heroes';
import { getHeroStats } from '@/data/experience';
import { 
  Palette, Users, Settings, Landmark, Flag, Swords, Crown, BarChart, Package, 
  User, Shield, Book, ChevronUp, ChevronDown, Search, Map as MapIcon, Eye,
  Mail, Hammer, ScrollText, ArrowLeft, Undo2, Castle
} from 'lucide-react';

import { calculatePath } from '@/utils/pathfinding';
import SLGBattleReports from '@/components/slg-battle-reports';
import { BattleReport } from '@/data/reports';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [showFormation, setShowFormation] = useState(false);
  const [showStrategies, setShowStrategies] = useState(false);
  const [showHeroGallery, setShowHeroGallery] = useState(false);
  const [showAllianceList, setShowAllianceList] = useState(false);
  const [showAllianceMain, setShowAllianceMain] = useState(false);
  const [showAllianceMembers, setShowAllianceMembers] = useState(false);
  const [hasAlliance, setHasAlliance] = useState(false);
  const [showCombat, setShowCombat] = useState(false);
  const [isReplay, setIsReplay] = useState(false);
  const [showBattleReports, setShowBattleReports] = useState(false);
  const [combatTileLevel, setCombatTileLevel] = useState(1);
  const [combatTroopId, setCombatTroopId] = useState<string | null>(null);
  const [distanceToCity, setDistanceToCity] = useState(0);
  const [reports, setReports] = useState<BattleReport[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };
  
  const mapRef = React.useRef<SLGMapRef>(null);

  // Marching state
  const [troops, setTroops] = useState<TroopData[]>(initialTroops);
  const [previewRoute, setPreviewRoute] = useState<{start: {row: number, col: number}, end: {row: number, col: number}} | null>(null);
  const [showMarchSelection, setShowMarchSelection] = useState(false);
  const [isTestMarch, setIsTestMarch] = useState(false);
  const [targetTile, setTargetTile] = useState<TileData | null>(null);
  const [selectedMarchingTroopId, setSelectedMarchingTroopId] = useState<string | null>(null);
  const [isViewLocked, setIsViewLocked] = useState(true);

  // Check for arrived troops
  useEffect(() => {
    const marchingTroops = troops.filter(t => t.status === '行军' && t.endTime);
    if (marchingTroops.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const arrivedTroops = marchingTroops.filter(t => t.endTime && now >= t.endTime);
      
      if (arrivedTroops.length > 0) {
        setTroops(prev => prev.map(t => {
          if (t.status === '行军' && t.endTime && now >= t.endTime) {
            return {
              ...t,
              status: '空闲' as const,
              targetTile: undefined,
              startTime: undefined,
              endTime: undefined
            };
          }
          return t;
        }));
        
        // Trigger combat for the first arrived troop
        const firstArrived = arrivedTroops[0];
        setCombatTileLevel(firstArrived.targetTile?.level || 1);
        setCombatTroopId(firstArrived.id);
        setIsReplay(false);
        setShowCombat(true);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [troops]);

  // Close menu on any click outside the menu toggle
  useEffect(() => {
    if (!isMenuExpanded) return;
    
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking the toggle button itself or a menu button
      if (!target.closest('.menu-toggle-btn') && !target.closest('.menu-button')) {
        setIsMenuExpanded(false);
      }
    };
    
    // Use capture phase to ensure it runs before other click handlers
    document.addEventListener('click', handleGlobalClick, true);
    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, [isMenuExpanded]);

  // Load alliance status on mount
  useEffect(() => {
    const savedAlliance = localStorage.getItem('slg_alliance_save');
    if (savedAlliance === 'true') {
      setTimeout(() => setHasAlliance(true), 0);
    }
  }, []);

  const handleBattleComplete = React.useCallback((report: BattleReport) => {
    if (!isReplay) {
      setReports(prev => [report, ...prev]);
    }
  }, [isReplay]);

  const syncTroopsWithFormation = () => {
    let savedData = localStorage.getItem('slg_formation_save');
    
    // Initialize default formation if none exists
    if (!savedData) {
      const defaultFormations = Array.from({ length: 5 }, () => Array(9).fill(null));
      // Add Zhao Yun, Zhou Yu, Zhang Fei to the first formation
      defaultFormations[0][1] = 1001; // 赵云
      defaultFormations[0][4] = 1002; // 周瑜
      defaultFormations[0][7] = 1003; // 张飞
      
      const defaultData = {
        formations: defaultFormations,
        strategyFormations: Array.from({ length: 5 }, () => Array(9).fill(null)),
        troopFormations: Array(5).fill(1001)
      };
      
      localStorage.setItem('slg_formation_save', JSON.stringify(defaultData));
      savedData = JSON.stringify(defaultData);
    }

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const formations: (number | null)[][] = parsed.formations;
        
        if (formations) {
          setTroops(prev => {
            const newTroops: TroopData[] = [];
            formations.forEach((formation, index) => {
              const heroIds = formation.filter(id => id !== null) as number[];
              if (heroIds.length > 0) {
                // Calculate total HP
                let totalHp = 0;
                let maxLevel = 1;
                heroIds.forEach(id => {
                  const h = heroesData.find(hero => hero.id === id);
                  if (h) {
                    const stats = getHeroStats(id);
                    totalHp += stats.level * 100;
                    if (stats.level > maxLevel) maxLevel = stats.level;
                  }
                });

                // Find the backmost hero
                let backmostHeroId = heroIds[0];
                for (let i = 8; i >= 0; i--) {
                  if (formation[i] !== null) {
                    backmostHeroId = formation[i] as number;
                    break;
                  }
                }
                
                const hero = heroesData.find(h => h.id === backmostHeroId);
                if (hero) {
                  const existingTroop = prev.find(t => t.id === `t${index + 1}`);
                  newTroops.push({
                    id: `t${index + 1}`,
                    name: `第${['一','二','三','四','五'][index]}舰队`,
                    heroName: hero.name,
                    heroAvatar: hero.资源路径,
                    level: maxLevel,
                    hp: existingTroop?.hp || totalHp,
                    maxHp: totalHp,
                    status: existingTroop?.status || '空闲',
                    type: hero['兵种页签'],
                    combatTag: hero['战斗页签'] || '武',
                    targetTile: existingTroop?.targetTile,
                    startTime: existingTroop?.startTime,
                    endTime: existingTroop?.endTime
                  });
                }
              }
            });
            return newTroops;
          });
        }
      } catch (e) {
        console.error('Failed to parse formation data', e);
      }
    }
  };

  useEffect(() => {
    if (!showFormation) {
      setTimeout(() => {
        syncTroopsWithFormation();
      }, 0);
    }
  }, [showFormation]);

  const handleAttack = React.useCallback((tile: TileData) => {
    setTargetTile(tile);
    setPreviewRoute({ start: { row: 6, col: 6 }, end: { row: tile.row, col: tile.col } });
    setShowMarchSelection(true);
    setIsTestMarch(false);
  }, []);

  const handleTestAttack = React.useCallback((tile: TileData) => {
    setTargetTile(tile);
    setPreviewRoute(null); // No preview route
    setShowMarchSelection(true);
    setIsTestMarch(true);
  }, []);

  const handleMarch = React.useCallback((troopId: string, isTestMarch: boolean) => {
    if (!targetTile) return;
    
    const distance = Math.abs(targetTile.row - 6) + Math.abs(targetTile.col - 6);
    const timeMs = isTestMarch ? 0 : distance * 5 * 1000;
    const now = Date.now();
    
    const route = isTestMarch ? undefined : calculatePath({row: 6, col: 6}, {row: targetTile.row, col: targetTile.col}, 15);

    setTroops(prev => prev.map(t => {
      if (t.id === troopId) {
        return {
          ...t,
          status: isTestMarch ? '空闲' : '行军', // Reset to idle if test march
          targetTile: isTestMarch ? undefined : targetTile,
          startTime: isTestMarch ? undefined : now,
          endTime: isTestMarch ? undefined : now + timeMs,
          route: route
        };
      }
      return t;
    }));

    setShowMarchSelection(false);
    setSelectedMarchingTroopId(troopId);
    setPreviewRoute(null);

    if (isTestMarch) {
      setCombatTileLevel(targetTile.level);
      setCombatTroopId(troopId);
      setShowCombat(true);
    }
  }, [targetTile]);

  const handleCloseMarchSelection = React.useCallback(() => {
    setShowMarchSelection(false);
    setPreviewRoute(null);
  }, []);

  const handleSelectMarchingTroop = React.useCallback((id: string) => {
    setSelectedMarchingTroopId(id);
    const troop = troops.find(t => t.id === id);
    if (troop && troop.status === '行军' && troop.targetTile) {
      // We could center on the troop's destination
      // mapRef.current?.centerOnTile(troop.targetTile.row, troop.targetTile.col);
    }
  }, [troops]);

  const handleCenterCity = () => {
    mapRef.current?.centerOnCity();
  };

  // Sort strategies: Orange > Purple > Blue
  const sortedStrategies = [...strategiesData].sort((a, b) => {
    const order = { '橙品': 3, '紫品': 2, '蓝品': 1 };
    return order[b.等级 as keyof typeof order] - order[a.等级 as keyof typeof order];
  });

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-[956px] h-[460px] overflow-hidden relative bg-slate-900 text-slate-200 font-sans select-none shadow-2xl border border-slate-800 rounded-sm">
        {!isLoggedIn ? (
          <SLGLogin onLogin={() => setIsLoggedIn(true)} />
        ) : (
          <>
            {/* Background Map */}
            <SLGMap 
              ref={mapRef} 
              onDistanceChange={setDistanceToCity} 
              onAttack={handleAttack} 
              onTestAttack={handleTestAttack}
              previewRoute={previewRoute}
              marchingTroops={troops}
              selectedMarchingTroopId={selectedMarchingTroopId}
              onSelectMarchingTroop={handleSelectMarchingTroop}
              isViewLocked={isViewLocked}
              showMarchSelection={showMarchSelection}
            />

            {!showMarchSelection && (
              <>
                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/90 to-transparent flex items-start justify-between px-4 pt-2 pointer-events-none z-10">
                  {/* Player Info */}
                  <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="w-14 h-14 rounded-full border-2 border-[#8b6b4a] overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.8)] relative">
                      <Image src="https://picsum.photos/seed/avatar/100/100" alt="Avatar" fill className="object-cover" unoptimized />
                      <div className="absolute bottom-0 left-0 right-0 bg-red-800/80 text-[10px] text-center text-white">Lv.35</div>
                    </div>
                    <div className="flex flex-col text-xs text-[#d4b484] drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white">1024</span>
                        <span className="text-[#8b6b4a] bg-amber-900/40 border border-[#8b6b4a]/40 px-1 rounded-sm text-[10px]">镇君</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-bold text-xs text-white">繁荣 86854</span>
                      </div>
                      <div className="flex gap-3 opacity-90 mt-0.5">
                        <span>领地 61/61</span>
                        <span>道路 4/31</span>
                      </div>
                    </div>
                  </div>

                  {/* Resources */}
                  <div className="flex gap-6 text-xs font-mono text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] pt-1">
                    <ResourceItem icon="🪵" amount="+62100" total="177万/600万" />
                    <ResourceItem icon="⛏️" amount="+72500" total="202万/600万" />
                    <ResourceItem icon="🪨" amount="+77000" total="207万/600万" />
                    <ResourceItem icon="🌾" amount="+69300" total="577万/600万" />
                  </div>

                  {/* Right Info */}
                  <div className="flex gap-4 text-xs items-center font-mono text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] pt-1">
                    <div className="flex items-center gap-1"><span className="text-green-400">🟢</span> 0 <span className="text-amber-500">+</span></div>
                    <div className="flex items-center gap-1"><span className="text-yellow-400">🪙</span> 12494 <span className="text-amber-500">+</span></div>
                    <div className="flex flex-col items-end text-[10px] opacity-80">
                      <span>46ms</span>
                      <span>37fps</span>
                    </div>
                    <div className="text-sm">15:39:18</div>
                  </div>
                </div>

                {/* Left Icons */}
                <div className="absolute top-20 left-4 flex flex-col gap-4 pointer-events-auto z-10">
                  <div className="flex gap-4">
                    <TopIconButton icon={<ScrollText size={20}/>} text="重铸霸业" onClick={() => showToast("尚未规划")} />
                    <TopIconButton icon={<Crown size={20}/>} text="月卡" onClick={() => showToast("尚未规划")} />
                    <TopIconButton icon={<Flag size={20}/>} text="活动" onClick={() => showToast("尚未规划")} />
                  </div>
                  <div className="flex flex-col gap-3 mt-10">
                    <div onClick={() => showToast("尚未规划")}><SideIconButton icon={<Hammer size={20}/>} disabled /></div>
                    <div onClick={() => showToast("尚未规划")}><SideIconButton icon={<Mail size={20}/>} disabled /></div>
                    <div onClick={() => setShowBattleReports(true)}><SideIconButton icon={<ScrollText size={20}/>} /></div>
                  </div>
                </div>

                {/* Right Icons */}
                <div className="absolute top-20 right-4 flex flex-col items-end gap-4 pointer-events-auto z-10">
                  <div className="flex gap-3">
                    <div onClick={() => showToast("尚未规划")}><SideIconButton icon={<Eye size={20}/>} disabled /></div>
                    <div onClick={() => showToast("尚未规划")}><SideIconButton icon={<Search size={20}/>} disabled /></div>
                    <div onClick={() => showToast("尚未规划")}><SideIconButton icon={<MapIcon size={20}/>} disabled /></div>
                  </div>
                  {/* Troop List */}
                  <div className="flex flex-col gap-2 mt-4">
                    {troops.filter(t => t.status === '行军').map(troop => (
                      <div 
                        key={troop.id}
                        onClick={() => handleSelectMarchingTroop(troop.id)}
                        className={`relative w-12 h-12 rounded-full border-2 overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.8)] cursor-pointer transition-transform hover:scale-110 ${selectedMarchingTroopId === troop.id ? 'border-amber-400' : 'border-blue-400'}`}
                      >
                        <Image src={troop.heroAvatar || `https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/hero-avatar/${troop.heroName}.png`} alt={troop.heroName} fill className="object-cover" unoptimized />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-between px-4 pb-4 pointer-events-none z-20">
                  
                  {/* Left: Big Button & Chat */}
                  <div className="flex items-end gap-4 pointer-events-auto">
                    <div 
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2a2c33] to-[#1a1c23] border-2 border-[#8b6b4a] flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.8)] cursor-pointer hover:scale-105 transition-transform relative shrink-0"
                      onClick={handleCenterCity}
                    >
                      <div className="w-16 h-16 rounded-full border border-[#8b6b4a]/50 flex items-center justify-center">
                        <span className="text-[#d4b484] font-bold text-xl">主城</span>
                      </div>
                      <div className="absolute -bottom-2 bg-black/80 px-2 py-0.5 rounded-sm text-[10px] text-amber-500 border border-amber-800/50">{distanceToCity}</div>
                    </div>
                    
                    <div className="w-[260px] h-20 bg-black/50 border border-white/10 rounded-sm flex flex-col p-2 text-xs backdrop-blur-sm overflow-hidden">
                      <div className="flex gap-2 items-start">
                        <span className="text-amber-500 border border-amber-500/50 px-1 rounded-sm text-[10px] shrink-0">世界</span>
                        <span className="text-amber-200 truncate">钟祥王: 请问S2武将等级会降级吗</span>
                      </div>
                      <div className="flex gap-2 mt-1 items-start">
                        <span className="text-blue-400 border border-blue-400/50 px-1 rounded-sm text-[10px] shrink-0">同盟</span>
                        <span className="text-slate-300 truncate">烟雨江南: 包的</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Menu Buttons & Recruit */}
                  <div className="flex items-end gap-4 pointer-events-auto">
                    
                    {/* Menu Buttons */}
                    <div className="flex items-end relative">
                      {/* Expanded Menu Grid */}
                      {isMenuExpanded && (
                        <div className="absolute bottom-full right-6 flex flex-col items-end animate-in slide-in-from-bottom-2 fade-in duration-200">
                          {/* Row 1 */}
                          <div className="flex">
                            <MenuButton icon={<Palette size={20}/>} text="外观" setIsMenuExpanded={setIsMenuExpanded} disabled onDisabledClick={() => showToast('尚未规划')} />
                          </div>
                          {/* Row 2 */}
                          <div className="flex">
                            <MenuButton icon={<Users size={20}/>} text="结义" setIsMenuExpanded={setIsMenuExpanded} disabled onDisabledClick={() => showToast('尚未规划')} />
                            <MenuButton icon={<Settings size={20}/>} text="设置" setIsMenuExpanded={setIsMenuExpanded} disabled onDisabledClick={() => showToast('尚未规划')} />
                            <MenuButton icon={<Landmark size={20}/>} text="城务" setIsMenuExpanded={setIsMenuExpanded} disabled onDisabledClick={() => showToast('尚未规划')} />
                            <MenuButton icon={<Flag size={20}/>} text="编队" onClick={() => setShowFormation(true)} setIsMenuExpanded={setIsMenuExpanded} />
                          </div>
                          {/* Row 3 */}
                          <div className="flex">
                            <MenuButton icon={<Swords size={20}/>} text="军略" onClick={() => setShowStrategies(true)} setIsMenuExpanded={setIsMenuExpanded} />
                            <MenuButton icon={<Crown size={20}/>} text="霸业" setIsMenuExpanded={setIsMenuExpanded} disabled onDisabledClick={() => showToast('尚未规划')} />
                            <MenuButton icon={<BarChart size={20}/>} text="排行" setIsMenuExpanded={setIsMenuExpanded} disabled onDisabledClick={() => showToast('尚未规划')} />
                            <MenuButton icon={<Package size={20}/>} text="背包" setIsMenuExpanded={setIsMenuExpanded} disabled onDisabledClick={() => showToast('尚未规划')} />
                          </div>
                        </div>
                      )}

                      {/* Bottom Row */}
                      <div className="flex">
                        <MenuButton icon={<User size={20}/>} text="武将" onClick={() => setShowHeroGallery(true)} setIsMenuExpanded={setIsMenuExpanded} />
                        <MenuButton icon={<Shield size={20}/>} text="同盟" onClick={() => hasAlliance ? setShowAllianceMain(true) : setShowAllianceList(true)} setIsMenuExpanded={setIsMenuExpanded} />
                        <MenuButton icon={<Book size={20}/>} text="职业" setIsMenuExpanded={setIsMenuExpanded} disabled onDisabledClick={() => showToast('尚未规划')} />
                        <MenuButton icon={<Swords size={20}/>} text="征战" setIsMenuExpanded={setIsMenuExpanded} disabled onDisabledClick={() => showToast('尚未规划')} />
                      </div>
                      
                      {/* Expand Toggle */}
                      <button 
                        className="menu-toggle-btn w-6 h-[46px] bg-gradient-to-b from-[#2a2c33] to-[#1a1c23] border border-[#8b6b4a]/50 flex items-center justify-center text-[#d4b484] hover:brightness-125 transition-all shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                        onClick={() => setIsMenuExpanded(!isMenuExpanded)}
                      >
                        {isMenuExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      </button>
                    </div>

                    {/* Recruit Button */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2a2c33] to-[#1a1c23] border-2 border-[#8b6b4a] flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.8)] cursor-pointer hover:scale-105 transition-transform relative shrink-0">
                      <div className="w-16 h-16 rounded-full border border-[#8b6b4a]/50 flex items-center justify-center">
                        <span className="text-[#d4b484] font-bold text-xl">寻访</span>
                      </div>
                      <div className="absolute -bottom-2 bg-black/80 px-2 py-0.5 rounded-sm text-[10px] text-amber-500 border border-amber-800/50">免费</div>
                    </div>
                  </div>
                </div>
              </>
            )}

      {/* Formation Modal Overlay */}
      {showFormation && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <SLGFormation onClose={() => {
          setShowFormation(false);
          syncTroopsWithFormation();
        }} />
        </div>
      )}

      {/* Strategy Gallery Overlay */}
      {showStrategies && (
        <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col text-slate-200 pointer-events-auto">
          <div className="h-14 border-b border-slate-700/50 flex items-center px-6 bg-slate-800/50 shrink-0">
            <button onClick={() => setShowStrategies(false)} className="flex items-center text-slate-400 hover:text-white transition-colors">
              <Undo2 size={24} className="mr-2" />
              <span className="text-lg tracking-widest font-serif">军略</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col p-6 w-full">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-800/80 rounded-t border border-slate-700 font-bold text-slate-300 text-sm shrink-0">
              <div className="col-span-2">名称</div>
              <div className="col-span-1">等级</div>
              <div className="col-span-2">空间条件</div>
              <div className="col-span-2">目标类型</div>
              <div className="col-span-1">目标数量</div>
              <div className="col-span-4">效果</div>
            </div>
            
            {/* List */}
            <div className="flex-1 overflow-y-auto border-x border-b border-slate-700 rounded-b bg-slate-800/30 custom-scrollbar">
              {sortedStrategies.map((strat, idx) => (
                <div key={strat.id} className={`grid grid-cols-12 gap-4 px-4 py-4 border-b border-slate-700/50 text-sm items-center hover:bg-slate-700/30 transition-colors ${idx % 2 === 0 ? 'bg-slate-800/10' : ''}`}>
                  <div className="col-span-2 font-bold text-slate-100">{strat.名称}</div>
                  <div className={`col-span-1 font-medium ${strat.等级 === '橙品' ? 'text-orange-400' : strat.等级 === '紫品' ? 'text-purple-400' : 'text-blue-400'}`}>{strat.等级}</div>
                  <div className="col-span-2 text-slate-300">{strat.空间条件}</div>
                  <div className="col-span-2 text-slate-300">{strat.目标类型}</div>
                  <div className="col-span-1 text-slate-300">{strat.目标数量}</div>
                  <div className="col-span-4 text-slate-300 leading-relaxed">{strat.效果}</div>
                </div>
              ))}
            </div>
          </div>
          
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
      )}

      {/* Hero Gallery Overlay */}
      {showHeroGallery && (
        <SLGHeroGallery onClose={() => setShowHeroGallery(false)} />
      )}

      {/* Alliance List Overlay */}
      {showAllianceList && (
        <SLGAllianceList 
          onClose={() => setShowAllianceList(false)} 
          onJoin={() => {
            setShowAllianceList(false);
            setHasAlliance(true);
            localStorage.setItem('slg_alliance_save', 'true');
            setShowAllianceMain(true);
          }}
        />
      )}

      {/* Alliance Main Overlay */}
      {showAllianceMain && (
        <SLGAllianceMain 
          onClose={() => setShowAllianceMain(false)}
          onOpenMembers={() => setShowAllianceMembers(true)}
        />
      )}

      {/* Alliance Members Overlay */}
      {showAllianceMembers && (
        <SLGAllianceMembers onClose={() => setShowAllianceMembers(false)} />
      )}

      {/* Battle Reports Overlay */}
      {showBattleReports && (
        <SLGBattleReports 
          reports={reports}
          onClose={() => setShowBattleReports(false)} 
          onReplay={(report) => {
            setShowBattleReports(false);
            setCombatTileLevel(report.tileLevel);
            setCombatTroopId(report.troopId);
            setIsReplay(true);
            setShowCombat(true);
          }}
        />
      )}

      {/* Combat Overlay */}
      {showCombat && (
        <SLGCombat 
          tileLevel={combatTileLevel} 
          troopId={combatTroopId}
          isReplay={isReplay}
          onClose={() => {
            setShowCombat(false);
            syncTroopsWithFormation();
          }} 
          onBattleComplete={handleBattleComplete}
        />
      )}

      {/* March Selection Overlay */}
      {showMarchSelection && targetTile && (
        <SLGMarchSelection 
          tile={targetTile} 
          troops={troops} 
          onClose={handleCloseMarchSelection} 
          onMarch={(troopId) => handleMarch(troopId, isTestMarch)}
          isTestMarch={isTestMarch}
          onOpenFormation={() => {
            setShowMarchSelection(false);
            setShowFormation(true);
          }}
          isViewLocked={isViewLocked}
          setIsViewLocked={setIsViewLocked}
        />
      )}
          </>
        )}
      </div>

      {/* Global Toast */}
      {toastMessage && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-[200] max-w-sm pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-black/80 text-white font-bold tracking-widest px-8 py-3 rounded-md border border-gray-600/50 shadow-2xl backdrop-blur-sm shadow-black text-center whitespace-nowrap">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
const ResourceItem = ({ icon, amount, total }: { icon: string, amount: string, total: string }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center gap-1 text-amber-200">
      <span className="text-sm">{icon}</span>
      <span>{amount}</span>
    </div>
    <div className="text-[10px] opacity-80">{total}</div>
  </div>
);

const TopIconButton = ({ icon, text, onClick }: { icon: React.ReactNode, text: string, onClick?: () => void }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform group grayscale opacity-60 hover:opacity-80">
    <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#2a2c33] to-[#1a1c23] border border-[#8b6b4a]/60 flex items-center justify-center text-[#d4b484] shadow-lg group-hover:border-[#d4b484]">
      {icon}
    </div>
    <span className="text-[10px] text-amber-100/80 drop-shadow-md">{text}</span>
  </div>
);

const SideIconButton = ({ icon, disabled }: { icon: React.ReactNode, disabled?: boolean }) => (
  <div className={`w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80 transition-colors backdrop-blur-sm shadow-lg ${disabled ? 'grayscale opacity-60 cursor-pointer hover:opacity-80 hover:bg-black/60' : 'hover:bg-black/80 hover:text-white cursor-pointer'}`}>
    {icon}
  </div>
);

const TroopAvatar = ({ img, hp, type }: { img: string, hp: number, type: string }) => (
  <div className="w-12 h-12 rounded-full border-2 border-slate-400 overflow-hidden relative cursor-pointer hover:border-white transition-colors shadow-lg">
    <div className="w-full h-full relative overflow-hidden rounded-full">
      <Image src={img} alt="Troop" fill className="object-cover" unoptimized />
    </div>
    <div className="absolute top-0 left-0 bg-blue-900/80 text-white text-[10px] px-1 rounded-br-sm border-b border-r border-blue-400/50">
      {type}
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
      <div className="h-full bg-green-500" style={{ width: `${hp}%` }}></div>
    </div>
  </div>
);

const MenuButton = ({ icon, text, onClick, setIsMenuExpanded, disabled, onDisabledClick }: { icon: React.ReactNode, text: string, onClick?: () => void, setIsMenuExpanded: (expanded: boolean) => void, disabled?: boolean, onDisabledClick?: () => void }) => (
  <button 
    onClick={(e) => {
      e.stopPropagation();
      if (disabled) {
        if (onDisabledClick) onDisabledClick();
        return;
      }
      if (onClick) onClick();
      setIsMenuExpanded(false);
    }}
    className={`menu-button w-[104px] h-[46px] bg-gradient-to-b from-[#22242b] to-[#111216] border border-black/80 border-l-[#8b6b4a] border-r-[#8b6b4a] flex items-center justify-center gap-2 text-[#d4b484] shadow-[0_4px_10px_rgba(0,0,0,0.8)] relative group overflow-hidden pointer-events-auto transition-all ${disabled ? 'grayscale opacity-60 hover:brightness-100 cursor-not-allowed' : 'hover:brightness-125 hover:from-[#2a2c33]'}`}
  >
    {/* Decorative inner glow */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8b6b4a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    
    <div className="opacity-90 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{icon}</div>
    <span className="font-serif tracking-widest text-[15px] font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{text}</span>
  </button>
);
