'use client';

import React from 'react';
import { X } from 'lucide-react';

interface SLGAllianceInvitesProps {
  onClose: () => void;
  onJoin: () => void;
}

export default function SLGAllianceInvites({ onClose, onJoin }: SLGAllianceInvitesProps) {
  const invitations = [
    {
      id: 1,
      name: '同盟名称六字',
      leader: '盟主名称七个字',
      level: 20,
      members: 200,
      maxMembers: 220,
      state: '东吴',
      power: '繁荣昌盛',
    }
  ];

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/60 font-sans animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="bg-[#5c6978] w-[800px] h-[450px] shadow-2xl flex flex-col relative rounded-[2px] border border-slate-400/20 overflow-hidden">
        {/* Header */}
        <div className="h-12 flex items-center justify-center border-b border-slate-400/20 relative shrink-0">
          <div className="text-white font-medium tracking-widest text-lg">同盟邀请</div>
          <button 
            onClick={onClose} 
            className="absolute right-4 text-slate-300 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Table */}
        <div className="flex-1 overflow-hidden flex flex-col px-4 pt-4 pb-6">
          {/* Table Header */}
          <div className="grid grid-cols-7 bg-[#2a2d36] text-[#bf9f73] font-medium py-3 px-2 text-[13px] text-center rounded-t-sm border border-slate-400/20 border-b-0">
            <div className="text-left pl-4">同盟名称</div>
            <div>盟主</div>
            <div>等级</div>
            <div>人数</div>
            <div>出生州</div>
            <div>实力指标</div>
            <div>操作</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto bg-transparent border border-slate-400/20 border-t-0 rounded-b-sm">
            {invitations.map((invite) => (
              <div 
                key={invite.id} 
                className="grid grid-cols-7 items-center text-white py-3.5 px-2 text-[13px] text-center border-b border-slate-400/10 hover:bg-white/5 transition-colors"
              >
                <div className="text-left pl-4">{invite.name}</div>
                <div>{invite.leader}</div>
                <div>{invite.level}</div>
                <div>{invite.members}/{invite.maxMembers}</div>
                <div>{invite.state}</div>
                <div className="text-[#4ade80]">{invite.power}</div>
                <div className="flex justify-center gap-2">
                  <button className="bg-[#ef4444] hover:bg-[#f87171] text-white px-4 py-1.5 rounded-sm transition-colors text-xs font-medium tracking-wider">
                    拒绝
                  </button>
                  <button 
                    onClick={onJoin}
                    className="bg-[#ef8133] hover:bg-[#f69147] text-white px-4 py-1.5 rounded-sm transition-colors text-xs font-medium tracking-wider"
                  >
                    同意
                  </button>
                </div>
              </div>
            ))}
            
            {invitations.length === 0 && (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm tracking-widest">
                暂无同盟邀请
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
