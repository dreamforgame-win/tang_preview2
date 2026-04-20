'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface SLGCreateAllianceProps {
  onClose: () => void;
  onJoin: () => void;
}

export default function SLGCreateAlliance({ onClose, onJoin }: SLGCreateAllianceProps) {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/60 font-sans animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="bg-[#596475] w-[560px] shadow-2xl flex flex-col relative rounded-sm border border-slate-400/20">
        {/* Header */}
        <div className="h-12 flex items-center justify-center px-4 border-b border-slate-400/20 relative shrink-0">
          <div className="text-white font-medium tracking-widest">创建同盟</div>
          <button 
            onClick={onClose} 
            className="absolute right-4 text-slate-300 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex p-6 gap-8">
          {/* Left: Flag */}
          <div className="flex flex-col items-center gap-6 w-[160px] shrink-0 pt-2">
            <div className="relative w-[140px] h-[180px] group flex flex-col items-center">
              {/* Attempt to use the image 2 if uploaded, fallback to CSS banner */}
              <div className="w-full h-full relative z-10 flex flex-col items-center drop-shadow-2xl">
                {/* Banner pole */}
                <div className="w-[110%] h-3 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded-sm relative z-20 shadow-md">
                  {/* Tassels */}
                  <div className="absolute -bottom-10 left-1 w-2 h-10 bg-purple-700 rounded-b-sm"></div>
                  <div className="absolute -bottom-10 right-1 w-2 h-10 bg-purple-700 rounded-b-sm"></div>
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-500 rounded-full"></div>
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-500 rounded-full"></div>
                </div>
                {/* Banner Cloth */}
                <div className="w-full h-[150px] bg-gradient-to-b from-[#3a1d63] to-[#24133c] relative z-10 border-x border-amber-500/50">
                   <div className="absolute bottom-0 left-0 w-full h-[50px] overflow-hidden">
                      {/* CSS chevron shape at bottom */}
                      <div className="absolute w-[120%] h-[120%] bg-gradient-to-b from-[#3a1d63] to-[#24133c] border-b border-amber-500/50 rotate-45 transform origin-top-left -left-[20%] top-[40%]"></div>
                   </div>
                   {/* Gold trim lines */}
                   <div className="absolute inset-1 border border-amber-500/30"></div>
                </div>
              </div>
              
              {/* Optional: Actual image overlay if user adds /alliance-flag.png to public */}
              <img 
                src="/alliance-flag.png" 
                alt="" 
                className="absolute inset-0 w-full h-full object-contain z-30 opacity-0 transition-opacity" 
                onError={(e) => e.currentTarget.style.display = 'none'} 
                onLoad={(e) => e.currentTarget.style.opacity = '1'}
              />
            </div>
            <button className="text-white text-sm hover:text-amber-200 transition-colors drop-shadow-md">
              变更旗帜
            </button>
          </div>

          {/* Right: Form */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-white text-[13px] tracking-wider">同盟名称</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入同盟名称，不超过6个字..."
                maxLength={6}
                className="bg-[#373b45] text-white px-3 py-2 text-sm focus:outline-none focus:bg-[#3f4450] transition-colors placeholder:text-gray-400 border border-transparent shadow-inner"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-white text-[13px] tracking-wider">同盟简称</label>
              <input 
                type="text" 
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="请输入同盟简称，1个字..."
                maxLength={1}
                className="bg-[#373b45] text-white px-3 py-2 text-sm focus:outline-none focus:bg-[#3f4450] transition-colors placeholder:text-gray-400 border border-transparent shadow-inner"
              />
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <label className="text-white text-[13px] tracking-wider">创建条件</label>
              <div className="bg-[#373b45] border border-slate-600/50 p-2.5 flex flex-col gap-2.5 text-sm shadow-inner">
                <div className="flex justify-between items-center px-1">
                  <span className="text-gray-200 text-xs tracking-wider">个人繁荣度≥2000</span>
                  <span className="text-red-400 text-xs tracking-wider">未满足</span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-gray-200 text-xs tracking-wider">通宝消耗200</span>
                  <span className="text-red-400 text-xs tracking-wider">未满足</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2">
              <div className="text-white text-[13px] flex items-center gap-2 tracking-wider">
                <span className="text-[#a4aab4]">所属州</span>
                <span>中原</span>
              </div>
              <button 
                onClick={onJoin}
                className="bg-[#373b45] hover:bg-[#3f4450] border border-slate-600/50 text-white px-5 py-2 transition-colors flex items-center gap-1.5 rounded-sm shadow-md"
              >
                <div className="w-2.5 h-2.5 bg-[#4ade80] rotate-45 border border-[#16a34a] shadow-[0_0_5px_rgba(74,222,128,0.6)]"></div>
                <span className="text-[#f87171] font-medium mr-1 text-sm">200</span>
                <span className="text-sm tracking-widest">创建</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
