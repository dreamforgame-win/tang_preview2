'use client';

import React, { useState } from 'react';
import { Undo2 } from 'lucide-react';
import SLGCreateAlliance from './slg-create-alliance';
import SLGAllianceInvites from './slg-alliance-invites';

interface SLGAllianceListProps {
  onClose: () => void;
  onJoin: () => void;
}

export default function SLGAllianceList({ onClose, onJoin }: SLGAllianceListProps) {
  const [activeTab, setActiveTab] = useState('本州');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateAlliance, setShowCreateAlliance] = useState(false);
  const [showInvites, setShowInvites] = useState(false);

  const alliances = [
    {
      id: 1,
      name: '同盟名称1',
      leader: '盟主名称七个字',
      level: 20,
      members: 200,
      maxMembers: 220,
      state: '东吴',
      power: '繁荣昌盛',
      status: 'none'
    },
    {
      id: 2,
      name: '同盟名称1',
      leader: '盟主名称七个字',
      level: 20,
      members: 200,
      maxMembers: 220,
      state: '东吴',
      power: '繁荣昌盛',
      status: 'applied'
    }
  ];

  return (
    <div className="absolute inset-0 z-[100] bg-[#8795a2] flex flex-col font-sans animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center px-6 py-4">
        <button 
          onClick={onClose} 
          className="text-white hover:text-gray-200 transition-colors drop-shadow-md"
        >
          <Undo2 size={28} className="scale-x-[-1]" />
        </button>
        <span className="text-white font-bold text-xl ml-4 tracking-wide drop-shadow-md">
          同盟列表
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col px-10 pb-8 relative">
        
        {/* Controls Row - Positioned above the table */}
        <div className="flex justify-between items-end mb-2 relative z-10 w-full left-0">
          {/* Tabs */}
          <div className="flex gap-1 h-10 w-[300px]">
            <button
              onClick={() => setActiveTab('本州')}
              className={`flex-1 flex items-center justify-center font-medium
                ${activeTab === '本州' 
                  ? 'bg-[#ef8133] text-white' 
                  : 'bg-[#a3b1bc] text-white hover:bg-[#b0bdc8]'
                } transition-colors`}
            >
              本州
            </button>
            <button
              onClick={() => setActiveTab('跨州')}
              className={`flex-1 flex items-center justify-center font-medium
                ${activeTab === '跨州' 
                  ? 'bg-[#ef8133] text-white' 
                  : 'bg-[#a3b1bc] text-white hover:bg-[#b0bdc8]'
                } transition-colors`}
            >
              跨州
            </button>
          </div>

          {/* Search */}
          <div className="flex gap-2 h-10 w-[450px]">
            <input
              type="text"
              placeholder="请输入同盟名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-[#4b5563] text-white px-3 focus:outline-none placeholder:text-gray-300"
            />
            <button className="bg-[#2a2d36] text-white px-8 font-medium hover:bg-[#373b45] transition-colors">
              搜索
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 bg-[#5c687a] overflow-hidden flex flex-col shadow-lg">
          {/* Table Header */}
          <div className="grid grid-cols-7 bg-[#2a2d36] text-[#bf9f73] font-medium py-3 px-6 text-sm text-center">
            <div>同盟名称</div>
            <div>盟主</div>
            <div>等级</div>
            <div>人数</div>
            <div>出生州</div>
            <div>实力指标</div>
            <div>操作</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {alliances.map((alliance) => (
              <div 
                key={alliance.id} 
                className="grid grid-cols-7 items-center text-white py-4 px-6 text-sm text-center border-b border-[#2a2d36]/20 hover:bg-[#6c7a8e] transition-colors"
              >
                <div>{alliance.name}</div>
                <div>{alliance.leader}</div>
                <div>{alliance.level}</div>
                <div>{alliance.members}/{alliance.maxMembers}</div>
                <div>{alliance.state}</div>
                <div className="text-[#4ade80]">{alliance.power}</div>
                <div className="flex justify-center">
                  {alliance.status === 'none' ? (
                    <button 
                      onClick={onJoin}
                      className="bg-[#ef8133] hover:bg-[#f69147] text-white px-6 py-1.5 rounded-sm transition-colors text-sm"
                    >
                      申请加入
                    </button>
                  ) : (
                    <button className="bg-[#ef4444] hover:bg-[#f87171] text-white px-6 py-1.5 rounded-sm transition-colors text-sm">
                      取消申请
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <div className="relative">
            <button 
              onClick={() => setShowInvites(true)}
              className="bg-[#2a2d36] hover:bg-[#373b45] text-white px-8 py-3 rounded-sm transition-colors font-medium"
            >
              同盟邀请
            </button>
            <div className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold ring-2 ring-[#768493]">
              2
            </div>
          </div>
          <button 
            onClick={() => setShowCreateAlliance(true)}
            className="bg-[#2a2d36] hover:bg-[#373b45] text-white px-8 py-3 rounded-sm transition-colors font-medium"
          >
            创建同盟
          </button>
        </div>
      </div>
      
      {/* Create Alliance Modal */}
      {showCreateAlliance && (
        <SLGCreateAlliance 
          onClose={() => setShowCreateAlliance(false)} 
          onJoin={onJoin}
        />
      )}

      {/* Alliance Invites Modal */}
      {showInvites && (
        <SLGAllianceInvites 
          onClose={() => setShowInvites(false)} 
          onJoin={onJoin}
        />
      )}
    </div>
  );
}
