'use client';

import React from 'react';
import { Undo2 } from 'lucide-react';

interface SLGAllianceMainProps {
  onClose: () => void;
  onOpenMembers: () => void;
}

export default function SLGAllianceMain({ onClose, onOpenMembers }: SLGAllianceMainProps) {
  const [showTooltip, setShowTooltip] = React.useState<string | null>(null);

  const handleNotPlanned = () => {
    setShowTooltip('尚未规划');
    setTimeout(() => setShowTooltip(null), 2000);
  };

  const stats = [
    { label: '盟主', value: '1024' },
    { label: '成员', value: '50/200' },
    { label: '精铁', value: '500/1000' },
    { label: '城池数量', value: '30/100' },
    { label: '全资源加成', value: '5000/时' },
    { label: '势力值', value: '5000' },
  ];

  return (
    <div className="absolute inset-0 z-[100] bg-[#8795a2] flex flex-col font-sans animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center px-6 py-2 relative z-10 shrink-0">
        <button 
          onClick={onClose} 
          className="text-white hover:text-gray-200 transition-colors drop-shadow-md"
        >
          <Undo2 size={20} className="scale-x-[-1]" />
        </button>
        <span className="text-white font-bold text-base ml-4 tracking-wide drop-shadow-md">
          同盟
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex px-10 pb-1 relative overflow-hidden">
        
        {/* Left Side Information */}
        <div className="w-[300px] flex flex-col items-center h-full pb-1">
          
          {/* Alliance Flag */}
          <div className="relative w-[80px] h-[95px] shrink-0 group flex flex-col items-center">
            <div className="w-full h-full relative z-10 flex flex-col items-center drop-shadow-2xl">
              {/* Banner pole */}
              <div className="w-[110%] h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded-sm relative z-20 shadow-md">
                {/* Tassels */}
                <div className="absolute -bottom-6 left-0.5 w-1 h-6 bg-purple-700 rounded-b-sm"></div>
                <div className="absolute -bottom-6 right-0.5 w-1 h-6 bg-purple-700 rounded-b-sm"></div>
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
              </div>
              {/* Banner Cloth */}
              <div className="w-full h-[85px] bg-gradient-to-b from-[#3a1d63] to-[#24133c] relative z-10 border-x border-amber-500/50">
                  <div className="absolute bottom-0 left-0 w-full h-[30px] overflow-hidden">
                    {/* CSS chevron shape at bottom */}
                    <div className="absolute w-[120%] h-[120%] bg-gradient-to-b from-[#3a1d63] to-[#24133c] border-b border-amber-500/50 rotate-45 transform origin-top-left -left-[20%] top-[40%]"></div>
                  </div>
                  {/* Gold trim lines */}
                  <div className="absolute inset-1 border border-amber-500/30"></div>
              </div>
            </div>
            
            {/* Optional real image overlay */}
            <img 
              src="/alliance-flag.png" 
              alt="" 
              className="absolute inset-0 w-full h-full object-contain z-30 opacity-0 transition-opacity" 
              onError={(e) => e.currentTarget.style.display = 'none'} 
              onLoad={(e) => e.currentTarget.style.opacity = '1'}
            />
          </div>

          {/* Name & Level */}
          <div className="text-[#f69147] font-bold text-base mt-2 tracking-widest drop-shadow-md shrink-0">
            [六] 六六六
          </div>
          <div className="text-gray-200 text-[10px] tracking-widest shrink-0">
            1级
          </div>

          {/* Announcement */}
          <div className="w-full mt-1.5 text-left shrink-0">
            <div className="text-white text-[10px] font-medium mb-0.5 tracking-widest drop-shadow-sm">同盟公告</div>
            <div className="bg-[#667283] text-gray-200 px-2 py-1 text-[10px] min-h-[80px] shadow-inner tracking-widest rounded-sm flex items-start">
              公告内容
            </div>
          </div>

          {/* Stats List */}
          <div className="w-full mt-1.5 mx-[-2px] shrink-0">
            {stats.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center bg-[#5c687a] mt-[1px] px-3 py-1 text-[10px]"
              >
                <span className="text-white w-20 text-left tracking-widest">{item.label}</span>
                <span className="text-white flex-1 text-right tracking-widest">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="w-full mt-3 text-left shrink-0">
            <div className="text-white text-[10px] font-medium mb-0.5 tracking-widest drop-shadow-sm">我的信息</div>
            <div className="bg-[#5c687a] px-3 py-1.5 text-[10px] tracking-widest rounded-sm border border-[#4a5464]">
              <div className="flex justify-between mb-1"><span className="text-gray-300">职位</span><span className="text-[#f69147]">主公</span></div>
              <div className="flex justify-between mb-1"><span className="text-gray-300">武勋</span><span className="text-white">1234</span></div>
              <div className="flex justify-between"><span className="text-gray-300">贡献</span><span className="text-white">123</span></div>
            </div>
          </div>

        </div>

        {/* Right Side Buttons */}
        <div className="absolute bottom-6 right-8 flex gap-3 flex-wrap justify-end max-w-[60%]">
          <button onClick={handleNotPlanned} className="bg-[#6b7280] text-gray-300 px-6 py-3.5 rounded-sm text-base font-medium shadow-lg tracking-widest cursor-not-allowed">
            军械
          </button>
          <button onClick={handleNotPlanned} className="bg-[#6b7280] text-gray-300 px-6 py-3.5 rounded-sm text-base font-medium shadow-lg tracking-widest cursor-not-allowed">
            领地
          </button>
          <button onClick={onOpenMembers} className="bg-[#4a6bdf] hover:bg-[#5a7bef] text-white px-6 py-3.5 rounded-sm text-base font-medium transition-colors shadow-lg tracking-widest">
            成员
          </button>
          <button onClick={handleNotPlanned} className="bg-[#6b7280] text-gray-300 px-6 py-3.5 rounded-sm text-base font-medium shadow-lg tracking-widest cursor-not-allowed">
            科技
          </button>
        </div>

        {showTooltip && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div className="bg-black/70 text-white px-6 py-3 rounded-full text-lg animate-in fade-in zoom-in duration-300">
              {showTooltip}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
