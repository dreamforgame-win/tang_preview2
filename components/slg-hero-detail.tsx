import React, { useState } from 'react';
import Image from 'next/image';
import { Undo2, Sword, Shield, Zap, Info, Settings, Users, BookOpen, UserCircle2 } from 'lucide-react';
import { Hero } from '@/data/heroes';
import { getRequiredExpForLevel, getHeroStats, updateHeroExp } from '@/data/experience';

interface SLGHeroDetailProps {
  hero: Hero;
  onClose: () => void;
}

export default function SLGHeroDetail({ hero, onClose }: SLGHeroDetailProps) {
  const [activeMainTab, setActiveMainTab] = useState('征战');
  const [activeSubTab, setActiveSubTab] = useState('详情');

  const initialStats = getHeroStats(hero.id);
  const [level, setLevel] = useState(initialStats.level);
  const [exp, setExp] = useState(initialStats.exp);

  const maxLevel = 50;
  const isMaxLevel = level >= maxLevel;

  const mainTabs = ['征战', '内政', '传记', '外观'];
  const subTabs = ['详情', '配点', '兵种'];

  // Calculate stats based on level
  const levelBonus = {
    武力: (level - 1) * hero.武力成长,
    智力: (level - 1) * hero.谋略成长,
    防御: (level - 1) * hero.防御成长,
  };

  const currentStats = {
    武力: Math.floor(hero.武力 + levelBonus.武力),
    智力: Math.floor(hero.谋略 + levelBonus.智力),
    防御: Math.floor(hero.防御 + levelBonus.防御),
  };

  const parseSkill = (raw: string, defaultName: string) => {
    if (!raw) return { name: defaultName, desc: '' };
    const match = raw.match(/^【(.*?)】\s*(.*)$/);
    if (match) {
      return { name: match[1], desc: match[2] };
    }
    return { name: defaultName, desc: raw };
  };

  const parsedBasic = parseSkill(hero.普通攻击, '普通攻击');
  const basicAttack = {
    type: '普攻',
    name: parsedBasic.name,
    cooldown: `冷却：${hero['普攻冷却时间/秒']}秒`,
    desc: parsedBasic.desc,
  };

  const parsedActive = parseSkill(hero['主动技能 (Active, 100能量释放)'], '绝技');
  const activeSkill = {
    type: '主动',
    name: parsedActive.name,
    cooldown: '充能100%时释放',
    desc: parsedActive.desc,
  };

  const parsedPassive = parseSkill(hero['被动技能 (Passive)'], '被动');
  const passiveSkill = {
    type: '被动',
    name: parsedPassive.name,
    cooldown: '',
    desc: parsedPassive.desc,
  };

  const skills = [basicAttack, activeSkill, passiveSkill];

  const requiredExp = getRequiredExpForLevel(level);
  const expPercentage = isMaxLevel ? 100 : Math.min(100, (exp / requiredExp) * 100);

  // Level up button for testing
  const handleAddExp = () => {
    if (isMaxLevel) return;
    const newStats = updateHeroExp(hero.id, 500);
    setLevel(newStats.level);
    setExp(newStats.exp);
  };

  return (
    <div className="absolute inset-0 z-[60] bg-slate-900 flex text-slate-200 font-sans overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/hero-texture2/${hero.name2}.jpg`}
          alt={hero.name}
          className="absolute right-0 top-0 h-full w-auto max-w-none opacity-100"
        />
      </div>

      {/* Left Area: Back Button & Hero Name */}
      <div className="absolute left-0 top-0 bottom-0 w-[200px] z-10 flex flex-col p-4 pointer-events-none">
        {/* Back Button */}
        <button onClick={onClose} className="flex items-center text-slate-300 hover:text-white transition-colors pointer-events-auto mb-8 w-fit">
          <Undo2 size={28} className="drop-shadow-md" />
        </button>

        {/* Hero Name Module */}
        <div className="flex items-start gap-2 pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-2 py-4 flex justify-center shadow-lg">
            <div className="text-white font-serif text-[20px] drop-shadow-md" style={{ writingMode: 'vertical-rl', letterSpacing: '0.15em' }}>
              <span className="text-amber-400">{hero.战斗页签.charAt(0)}</span>
              <span className="inline-block h-2"></span>
              <span className="text-blue-300">{hero.兵种页签.charAt(0)}</span>
              <span className="inline-block h-2"></span>
              <span>{hero.name}</span>
            </div>
          </div>
          {/* Stars */}
          <div className="flex flex-col gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-3.5 h-3.5 bg-slate-400/80 clip-star rotate-180 drop-shadow-md" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Area: Tabs and Content */}
      <div className="absolute right-0 top-0 bottom-0 flex z-10">
        
        {/* Content Panel */}
        <div className="w-[360px] h-full bg-slate-900/80 backdrop-blur-md border-l border-slate-700/60 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
          
          {/* Sub Tabs - Only show for 征战 */}
          {activeMainTab === '征战' && (
            <div className="flex h-9 shrink-0 bg-slate-800/60 border-b border-slate-700/60">
              {subTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`flex-1 flex items-center justify-center text-[13px] transition-colors border-r border-slate-700/50 last:border-r-0 ${
                    activeSubTab === tab 
                      ? 'bg-gradient-to-t from-slate-800 to-slate-700 text-blue-100 font-medium border-b-2 border-blue-400 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            {activeMainTab === '征战' && activeSubTab === '详情' && (
              <div className="flex flex-col gap-2">
                
                {/* Level & Exp */}
                <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
                  <div 
                    className="w-10 h-10 rounded-full border-2 border-blue-600/50 bg-slate-800 flex items-center justify-center shadow-inner relative shrink-0 cursor-pointer" 
                    onClick={handleAddExp} 
                    title="点击增加经验"
                  >
                    <span className="text-lg font-serif text-blue-400">{level}</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center h-10">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>经验</span>
                      <span>{isMaxLevel ? '已满级' : `${exp}/${requiredExp}`}</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                      <div className="h-full bg-blue-500/80 transition-all duration-300" style={{ width: `${expPercentage}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Stamina & Troops */}
                <div className="flex bg-slate-800/40 border border-slate-700/50 rounded-sm divide-x divide-slate-700/50">
                  <div className="flex-1 flex justify-between items-center px-2 py-1">
                    <span className="text-[11px] text-slate-400">体力</span>
                    <span className="text-[11px] font-mono text-slate-200">100/100</span>
                  </div>
                  <div className="flex-1 flex justify-between items-center px-2 py-1">
                    <span className="text-[11px] text-slate-400">兵力</span>
                    <span className="text-[11px] font-mono text-slate-200">{level * 100}</span>
                  </div>
                </div>

                {/* Basic Attributes */}
                <div className="flex flex-col gap-1.5 mt-0.5">
                  <h3 className="text-[11px] text-slate-300 font-bold">基础属性</h3>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 bg-slate-800/40 p-1.5 rounded-sm border border-slate-700/30">
                    <div className="flex items-center gap-1">
                      <Sword size={10} className="text-slate-400" />
                      <span className="text-[11px] text-slate-300 w-7">武力</span>
                      <span className="text-[11px] font-mono text-white w-7">{currentStats.武力}</span>
                      <span className="text-[9px] font-mono text-green-400">(+{hero.武力成长.toFixed(1)})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Info size={10} className="text-slate-400" />
                      <span className="text-[11px] text-slate-300 w-7">智力</span>
                      <span className="text-[11px] font-mono text-white w-7">{currentStats.智力}</span>
                      <span className="text-[9px] font-mono text-green-400">(+{hero.谋略成长.toFixed(1)})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield size={10} className="text-slate-400" />
                      <span className="text-[11px] text-slate-300 w-7">防御</span>
                      <span className="text-[11px] font-mono text-white w-7">{currentStats.防御}</span>
                      <span className="text-[9px] font-mono text-green-400">(+{hero.防御成长.toFixed(1)})</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-col gap-1.5 mt-0.5">
                  <h3 className="text-[11px] text-slate-300 font-bold">技能</h3>
                  <div className="flex flex-col gap-1.5">
                    {skills.map((skill, idx) => (
                      <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-sm p-1.5 relative overflow-hidden">
                        {/* Skill Type Tag */}
                        <div className={`absolute top-0 left-0 text-[8px] px-1 py-0.5 rounded-br-sm font-bold ${
                          skill.type === '普攻' ? 'bg-green-600/80 text-white' :
                          skill.type === '主动' ? 'bg-amber-600/80 text-white' :
                          'bg-blue-600/80 text-white'
                        }`}>
                          {skill.type}
                        </div>
                        
                        <div className="flex gap-2 mt-1.5">
                          {/* Icon Placeholder */}
                          <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0 shadow-inner">
                            <span className="text-[8px] text-slate-400">图标</span>
                          </div>
                          
                          {/* Skill Info */}
                          <div className="flex-1 flex flex-col gap-0.5">
                            <div className="flex justify-between items-start">
                              <span className="text-[11px] font-bold text-slate-200 leading-none">{skill.name}</span>
                              {skill.cooldown && (
                                <span className="text-[8px] text-slate-400 bg-slate-900/50 px-1 py-0.5 rounded-sm border border-slate-700/50 leading-none">
                                  {skill.cooldown}
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-400 leading-tight mt-0.5">
                              {skill.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
            
            {/* Placeholders for other sub-tabs */}
            {activeMainTab === '征战' && activeSubTab !== '详情' && (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                {activeSubTab}内容开发中...
              </div>
            )}
            {activeMainTab !== '征战' && (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                {activeMainTab}内容开发中...
              </div>
            )}
          </div>
        </div>

        {/* Main Vertical Tabs */}
        <div className="w-10 bg-slate-900/80 backdrop-blur-md border-l border-slate-700/60 flex flex-col items-center shrink-0 z-20 shadow-[-5px_0_15px_rgba(0,0,0,0.5)]">
          {mainTabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveMainTab(tab)}
              className={`w-full py-5 flex items-center justify-center transition-colors border-b border-slate-700/50 last:border-b-0 relative ${
                activeMainTab === tab 
                  ? 'bg-gradient-to-l from-transparent via-blue-900/40 to-blue-800/60 text-blue-100 font-medium shadow-[inset_15px_0_30px_rgba(30,58,138,0.3)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="text-[13px] tracking-widest" style={{ writingMode: 'vertical-rl' }}>{tab}</span>
              {activeMainTab === tab && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-400"></div>
              )}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
