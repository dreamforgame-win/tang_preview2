'use client';

import React, { useState } from 'react';
import SLGFormation from '@/components/slg-formation';
import SLGMap from '@/components/slg-map';
import { strategiesData } from '@/data/strategies';
import { 
  Palette, Users, Settings, Landmark, Flag, Swords, Crown, BarChart, Package, 
  User, Shield, Book, ChevronUp, ChevronDown, Search, Map as MapIcon, Eye,
  Mail, Hammer, ScrollText, ArrowLeft, Undo2
} from 'lucide-react';

export default function Home() {
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [showFormation, setShowFormation] = useState(false);
  const [showStrategies, setShowStrategies] = useState(false);

  // Sort strategies: Orange > Purple > Blue
  const sortedStrategies = [...strategiesData].sort((a, b) => {
    const order = { '橙品': 3, '紫品': 2, '蓝品': 1 };
    return order[b.等级 as keyof typeof order] - order[a.等级 as keyof typeof order];
  });

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-[956px] h-[460px] overflow-hidden relative bg-slate-900 text-slate-200 font-sans select-none shadow-2xl border border-slate-800 rounded-sm">
        {/* Background Map */}
        <SLGMap />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/90 to-transparent flex items-start justify-between px-4 pt-2 pointer-events-none z-10">
        {/* Player Info */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-14 h-14 rounded-full border-2 border-[#8b6b4a] overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.8)] relative">
            <img src="https://picsum.photos/seed/avatar/100/100" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-red-800/80 text-[10px] text-center text-white">Lv.35</div>
          </div>
          <div className="flex flex-col text-xs text-[#d4b484] drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white">繁荣 86854</span>
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
           <TopIconButton icon={<ScrollText size={20}/>} text="重铸霸业" />
           <TopIconButton icon={<Crown size={20}/>} text="月卡" />
           <TopIconButton icon={<Flag size={20}/>} text="活动" />
        </div>
        <div className="flex flex-col gap-3 mt-10">
           <SideIconButton icon={<Hammer size={20}/>} />
           <SideIconButton icon={<Mail size={20}/>} />
        </div>
      </div>

      {/* Right Icons */}
      <div className="absolute top-20 right-4 flex flex-col items-end gap-4 pointer-events-auto z-10">
        <div className="flex gap-3">
           <SideIconButton icon={<Eye size={20}/>} />
           <SideIconButton icon={<Search size={20}/>} />
           <SideIconButton icon={<MapIcon size={20}/>} />
        </div>
        {/* Troop List */}
        <div className="flex flex-col gap-2 mt-4">
          <TroopAvatar img="https://picsum.photos/seed/t1/100/100" hp={80} type="青" />
          <TroopAvatar img="https://picsum.photos/seed/t2/100/100" hp={100} type="徐" />
          <TroopAvatar img="https://picsum.photos/seed/t3/100/100" hp={40} type="扬" />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-between px-4 pb-4 pointer-events-none z-20">
        
        {/* Left: Big Button & Chat */}
        <div className="flex items-end gap-4 pointer-events-auto">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2a2c33] to-[#1a1c23] border-2 border-[#8b6b4a] flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.8)] cursor-pointer hover:scale-105 transition-transform relative shrink-0">
             <div className="w-16 h-16 rounded-full border border-[#8b6b4a]/50 flex items-center justify-center">
               <span className="text-[#d4b484] font-bold text-xl">主城</span>
             </div>
             <div className="absolute -bottom-2 bg-black/80 px-2 py-0.5 rounded-sm text-[10px] text-amber-500 border border-amber-800/50">9</div>
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
                   <MenuButton icon={<Palette size={20}/>} text="外观" />
                 </div>
                 {/* Row 2 */}
                 <div className="flex">
                   <MenuButton icon={<Users size={20}/>} text="结义" />
                   <MenuButton icon={<Settings size={20}/>} text="设置" />
                   <MenuButton icon={<Landmark size={20}/>} text="城务" />
                   <MenuButton icon={<Flag size={20}/>} text="编队" onClick={() => setShowFormation(true)} />
                 </div>
                 {/* Row 3 */}
                 <div className="flex">
                   <MenuButton icon={<Swords size={20}/>} text="军略" onClick={() => setShowStrategies(true)} />
                   <MenuButton icon={<Crown size={20}/>} text="霸业" />
                   <MenuButton icon={<BarChart size={20}/>} text="排行" />
                   <MenuButton icon={<Package size={20}/>} text="背包" />
                 </div>
              </div>
            )}

            {/* Bottom Row */}
            <div className="flex">
              <MenuButton icon={<User size={20}/>} text="武将" />
              <MenuButton icon={<Shield size={20}/>} text="同盟" />
              <MenuButton icon={<Book size={20}/>} text="职业" />
              <MenuButton icon={<Swords size={20}/>} text="征战" />
            </div>
            
            {/* Expand Toggle */}
            <button 
              className="w-6 h-[46px] bg-gradient-to-b from-[#2a2c33] to-[#1a1c23] border border-[#8b6b4a]/50 flex items-center justify-center text-[#d4b484] hover:brightness-125 transition-all shadow-[0_0_10px_rgba(0,0,0,0.8)]"
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

      {/* Formation Modal Overlay */}
      {showFormation && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <SLGFormation onClose={() => setShowFormation(false)} />
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
    </div>
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

const TopIconButton = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform group">
    <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#2a2c33] to-[#1a1c23] border border-[#8b6b4a]/60 flex items-center justify-center text-[#d4b484] shadow-lg group-hover:border-[#d4b484]">
      {icon}
    </div>
    <span className="text-[10px] text-amber-100/80 drop-shadow-md">{text}</span>
  </div>
);

const SideIconButton = ({ icon }: { icon: React.ReactNode }) => (
  <div className="w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80 hover:bg-black/80 hover:text-white cursor-pointer transition-colors backdrop-blur-sm shadow-lg">
    {icon}
  </div>
);

const TroopAvatar = ({ img, hp, type }: { img: string, hp: number, type: string }) => (
  <div className="w-12 h-12 rounded-full border-2 border-slate-400 overflow-hidden relative cursor-pointer hover:border-white transition-colors shadow-lg">
    <img src={img} className="w-full h-full object-cover" />
    <div className="absolute top-0 left-0 bg-blue-900/80 text-white text-[10px] px-1 rounded-br-sm border-b border-r border-blue-400/50">
      {type}
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
      <div className="h-full bg-green-500" style={{ width: `${hp}%` }}></div>
    </div>
  </div>
);

const MenuButton = ({ icon, text, onClick }: { icon: React.ReactNode, text: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="w-[104px] h-[46px] bg-gradient-to-b from-[#22242b] to-[#111216] border border-black/80 border-l-[#8b6b4a] border-r-[#8b6b4a] flex items-center justify-center gap-2 text-[#d4b484] hover:brightness-125 hover:from-[#2a2c33] transition-all shadow-[0_4px_10px_rgba(0,0,0,0.8)] relative group overflow-hidden"
  >
    {/* Decorative inner glow */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8b6b4a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    
    <div className="opacity-90 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{icon}</div>
    <span className="font-serif tracking-widest text-[15px] font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{text}</span>
  </button>
);
