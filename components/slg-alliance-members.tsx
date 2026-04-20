'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Undo2, Settings, LogOut, Plus, ChevronLeft, ChevronRight, X, Check, Filter } from 'lucide-react';

interface SLGAllianceMembersProps {
  onClose: () => void;
  onLeaveAlliance?: () => void;
}

const PERMISSION_TYPES = [
  { id: 'personnel', label: '人员管理' },
  { id: 'diplomacy', label: '外交' },
  { id: 'city', label: '城池管理' },
  { id: 'construction', label: '同盟建设' },
  { id: 'decree', label: '法令' },
  { id: 'command', label: '指挥' },
];

const ALL_POSITIONS = [
  { id: 'master', title: '主公' },
  { id: 'zhongshu_ling', title: '中书令' },
  { id: 'shizhong', title: '侍中' },
  { id: 'shangshu_pushi', title: '尚书仆射' },
  { id: 'zhongshu_shilang', title: '中书侍郎' },
  { id: 'menxia_shilang', title: '门下侍郎' },
  { id: 'shibu_shilang', title: '吏部侍郎' },
  { id: 'hubu_shilang', title: '户部侍郎' },
  { id: 'libu_shilang', title: '礼部侍郎' },
  { id: 'bingbu_shilang', title: '兵部侍郎' },
  { id: 'xingbu_shilang', title: '刑部侍郎' },
  { id: 'gongbu_shilang', title: '工部侍郎' },
];

const CIVIL_JOBS = ['功曹参军', '仓曹参军', '户曹参军', '兵曹参军', '法曹参军', '士曹参军'];
const MILIT_JOBS = ['统军', '别将', '骠骑', '牙将', '司马', '镇将'];

export default function SLGAllianceMembers({ onClose, onLeaveAlliance }: SLGAllianceMembersProps) {
  const [view, setView] = useState<'list' | 'assign'>('list');
  const [listTab, setListTab] = useState<'members' | 'groups'>('members');
  const [groups, setGroups] = useState<{id: string, name: string, leaderId: number | null}[]>([
  ]);

  const [members, setMembers] = useState<{
    id: number;
    name: string;
    civilJob: string;
    militaryJob: string;
    pro: number;
    weekW: number;
    weekC: number;
    groupId: string | null;
    pos: string;
  }[]>(() => {
    return Array.from({ length: 15 }, (_, i) => {
      return {
        id: i,
        name: i === 0 ? '1024' : `玩家名字${i + 1}`,
        civilJob: CIVIL_JOBS[Math.floor(Math.random() * CIVIL_JOBS.length)],
        militaryJob: MILIT_JOBS[Math.floor(Math.random() * MILIT_JOBS.length)],
        pro: i === 0 ? 86854 : Math.floor(Math.random() * 50000) + 1000,
        weekW: i === 0 ? 1234 : Math.floor(Math.random() * 10000),
        weekC: i === 0 ? 123 : Math.floor(Math.random() * 500),
        groupId: null,
        pos: `长安(${Math.floor(Math.random() * 100)},${Math.floor(Math.random() * 100)})`,
      };
    });
  });

  const [assignments, setAssignments] = useState<Record<string, number | null>>({
    master: members[0].id
  });

  const getPositionName = (memberId: number) => {
    const entry = Object.entries(assignments).find(([_, id]) => id === memberId);
    if (!entry) return '成员';
    return ALL_POSITIONS.find(p => p.id === entry[0])?.title || '成员';
  };

  type SortKey = 'name' | 'civilJob' | 'militaryJob' | 'position' | 'pro' | 'weekW' | 'weekC' | 'group' | 'pos';
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, dir: 'asc' | 'desc' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [civilFilter, setCivilFilter] = useState<string>('all');
  const [showCivilFilterDropdown, setShowCivilFilterDropdown] = useState(false);
  const [militaryFilter, setMilitaryFilter] = useState<string>('all');
  const [showMilitaryFilterDropdown, setShowMilitaryFilterDropdown] = useState(false);

  const toggleSort = (key: SortKey) => {
    setSortConfig(prev => {
      if (prev?.key === key) return prev.dir === 'asc' ? { key, dir: 'desc' } : null;
      return { key, dir: 'asc' };
    });
  };

  const renderSortIcon = (colKey: SortKey) => {
    if (sortConfig?.key !== colKey) return <span className="opacity-30 inline-block w-2 ml-1 text-[10px]">▼</span>;
    return <span className="inline-block w-2 ml-1 text-[10px] text-amber-400">{sortConfig.dir === 'asc' ? '▲' : '▼'}</span>;
  };
  const positionLayout = [
    { title: '主公', id: 'master', x: 0, y: 1 },
    { title: '中书令', id: 'zhongshu_ling', x: 1, y: 0 },
    { title: '侍中', id: 'shizhong', x: 1, y: 2 },
    { title: '尚书仆射', id: 'shangshu_pushi', x: 2, y: 0 },
    { title: '中书侍郎', id: 'zhongshu_shilang', x: 2, y: 1 },
    { title: '门下侍郎', id: 'menxia_shilang', x: 2, y: 2 },
    { title: '吏部侍郎', id: 'shibu_shilang', x: 3, y: 0 },
    { title: '兵部侍郎', id: 'bingbu_shilang', x: 3, y: 2 },
    { title: '户部侍郎', id: 'hubu_shilang', x: 4, y: 0 },
    { title: '刑部侍郎', id: 'xingbu_shilang', x: 4, y: 2 },
    { title: '礼部侍郎', id: 'libu_shilang', x: 5, y: 0 },
    { title: '工部侍郎', id: 'gongbu_shilang', x: 5, y: 2 },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (scrollRef.current) {
      setStartY(e.pageY - scrollRef.current.offsetTop);
      setScrollTop(scrollRef.current.scrollTop);
    }
  };

  const handleMouseLeave = () => { setIsDragging(false); };
  const handleMouseUp = () => { setIsDragging(false); };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const y = e.pageY - scrollRef.current.offsetTop;
    const walk = (y - startY) * 1.5;
    scrollRef.current.scrollTop = scrollTop - walk;
  };

  const [selectingPos, setSelectingPos] = useState<string | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const [applications, setApplications] = useState([
    { id: 1, name: '玩家名称七个字', pro: '123456789', pos: '长安(123,123)' },
    { id: 2, name: '玩家名称七个字', pro: '123456789', pos: '长安(123,123)' },
  ]);

  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(() => {
    const initial: Record<string, Record<string, boolean>> = {};
    ALL_POSITIONS.forEach(pos => {
      initial[pos.id] = {
        personnel: pos.id === 'master',
        diplomacy: pos.id === 'master',
        city: pos.id === 'master',
        construction: pos.id === 'master',
        decree: pos.id === 'master',
        command: pos.id === 'master',
      };
    });
    return initial;
  });

  const togglePermission = (posId: string, permId: string) => {
    if (posId === 'master') return;
    setPermissions(prev => ({
      ...prev,
      [posId]: {
        ...prev[posId],
        [permId]: !prev[posId][permId]
      }
    }));
  };

  const handleAssign = (memberId: number) => {
    if (selectingPos) {
      setAssignments(prev => {
        const next = { ...prev };
        // Remove this member from any other position
        for (const k in next) {
          if (next[k] === memberId) delete next[k];
        }
        next[selectingPos] = memberId;
        return next;
      });
      setSelectingPos(null);
    }
  };

  const displayMembers = members
    .map(m => ({ ...m, position: getPositionName(m.id), groupName: groups.find(g => g.id === m.groupId)?.name || '--' }))
    .filter(m => {
      if (civilFilter !== 'all' && m.civilJob !== civilFilter) return false;
      if (militaryFilter !== 'all' && m.militaryJob !== militaryFilter) return false;
      if (searchQuery && !m.name.includes(searchQuery)) return false;
      return true;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, dir } = sortConfig;
      const mul = dir === 'asc' ? 1 : -1;
      let valA: any = key === 'group' ? a.groupName : (a as any)[key];
      let valB: any = key === 'group' ? b.groupName : (b as any)[key];

      if (['pro', 'weekW', 'weekC'].includes(key)) {
        return (Number(valA) - Number(valB)) * mul;
      }
      return String(valA).localeCompare(String(valB), 'zh-CN') * mul;
    });

  const currentUserPosId = Object.entries(assignments).find(([_, memberId]) => memberId === members[0].id)?.[0];
  const hasPersonnelPerm = currentUserPosId ? permissions[currentUserPosId]?.personnel : false;

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [viewGroupDetails, setViewGroupDetails] = useState<string | null>(null);
  const [manageGroupSearch, setManageGroupSearch] = useState('');
  const [detailGroupSearch, setDetailGroupSearch] = useState('');

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      setGroups(prev => [...prev, { id: `g${Date.now()}`, name: newGroupName.trim(), leaderId: null }]);
      setNewGroupName('');
      setShowCreateGroup(false);
    }
  };

  const groupStats = groups.map(g => {
    const groupMembers = members.filter(m => m.groupId === g.id);
    const leaderName = members.find(m => m.id === g.leaderId)?.name || '--';
    return {
      ...g,
      leaderName,
      count: groupMembers.length,
      totalPro: groupMembers.reduce((sum, m) => sum + m.pro, 0),
      totalWW: groupMembers.reduce((sum, m) => sum + m.weekW, 0),
      totalWC: groupMembers.reduce((sum, m) => sum + m.weekC, 0),
    };
  });

  return (
    <div className="absolute inset-0 z-[110] bg-[#8795a2] flex flex-col font-sans animate-in fade-in duration-300 p-6">
      {/* Header */}
      <div className="flex items-center mb-6 shrink-0">
        <button onClick={view === 'list' ? onClose : () => setView('list')} className="text-white hover:text-gray-200">
          <Undo2 size={24} className="scale-x-[-1]" />
        </button>
        <span className="text-white font-bold text-xl ml-4 tracking-widest">{view === 'list' ? '成员管理' : '职位委任'}</span>
      </div>

      {view === 'list' ? (
        <>
          {/* Toolbar */}
          <div className="flex gap-2 mb-4 shrink-0">
            <button 
              className={`${listTab === 'members' ? 'bg-[#f69147] text-white' : 'bg-[#363f4a] text-gray-300'} px-8 py-2 text-sm tracking-widest transition-colors hover:bg-[#eb8c39]`}
              onClick={() => setListTab('members')}
            >全部成员</button>
            <button 
              className={`${listTab === 'groups' ? 'bg-[#f69147] text-white' : 'bg-[#363f4a] text-gray-300'} px-8 py-2 text-sm tracking-widest transition-colors hover:bg-[#eb8c39]`}
              onClick={() => setListTab('groups')}
            >分组</button>
            <div className="flex-1" />
            {listTab === 'members' && (
              <>
                <input 
                  type="text" 
                  placeholder="输入成员名字…" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#363f4a] text-white px-4 py-2 text-sm w-64 border border-gray-500 focus:outline-none focus:border-gray-400" 
                />
                <button className="bg-[#363f4a] text-white px-8 py-2 text-sm border border-gray-500 hover:bg-[#4a5563] transition-colors">搜索</button>
              </>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 bg-[#4a5563] border border-gray-500 overflow-hidden flex flex-col">
            {listTab === 'members' ? (
              <>
                <div className="grid grid-cols-10 bg-[#363f4a] text-gray-300 text-sm py-2 px-3 border-b border-gray-500 shrink-0 tracking-widest select-none">
                  <div className="col-span-1 flex items-center justify-center cursor-pointer hover:text-white" onClick={() => toggleSort('name')}>
                    成员 {renderSortIcon('name')}
                  </div>
                  <div className="col-span-1 flex items-center justify-center cursor-pointer hover:text-white group relative">
                    <span 
                      className="flex items-center whitespace-nowrap" 
                      onClick={() => setShowCivilFilterDropdown(!showCivilFilterDropdown)}
                    >
                      {civilFilter === 'all' ? '文职' : civilFilter}
                      <Filter size={12} className="ml-1 opacity-70" />
                    </span>
                    <span onClick={(e) => { e.stopPropagation(); toggleSort('civilJob'); }}>
                      {renderSortIcon('civilJob')}
                    </span>

                    {showCivilFilterDropdown && (
                      <>
                        <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setShowCivilFilterDropdown(false); }} />
                        <div className="absolute top-8 left-0 bg-[#363f4a] border border-[#5c687a] rounded-sm shadow-xl z-50 min-w-[120px] max-h-64 overflow-y-auto custom-scrollbar text-white select-none py-1" onClick={e => e.stopPropagation()}>
                          <div 
                            className={`px-4 py-2 cursor-pointer hover:bg-[#4a5563] text-left transition-colors whitespace-nowrap ${civilFilter === 'all' ? 'text-amber-400' : ''}`}
                            onClick={() => { setCivilFilter('all'); setShowCivilFilterDropdown(false); }}
                          >
                            全部文职
                          </div>
                          {CIVIL_JOBS.map(job => (
                            <div 
                              key={job}
                              className={`px-4 py-2 cursor-pointer hover:bg-[#4a5563] text-left transition-colors whitespace-nowrap ${civilFilter === job ? 'text-amber-400' : ''}`}
                              onClick={() => { setCivilFilter(job); setShowCivilFilterDropdown(false); }}
                            >
                              {job}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="col-span-1 flex items-center justify-center cursor-pointer hover:text-white group relative">
                    <span 
                      className="flex items-center whitespace-nowrap" 
                      onClick={() => setShowMilitaryFilterDropdown(!showMilitaryFilterDropdown)}
                    >
                      {militaryFilter === 'all' ? '武职' : militaryFilter}
                      <Filter size={12} className="ml-1 opacity-70" />
                    </span>
                    <span onClick={(e) => { e.stopPropagation(); toggleSort('militaryJob'); }}>
                      {renderSortIcon('militaryJob')}
                    </span>

                    {showMilitaryFilterDropdown && (
                      <>
                        <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setShowMilitaryFilterDropdown(false); }} />
                        <div className="absolute top-8 left-0 bg-[#363f4a] border border-[#5c687a] rounded-sm shadow-xl z-50 min-w-[120px] max-h-64 overflow-y-auto custom-scrollbar text-white select-none py-1" onClick={e => e.stopPropagation()}>
                          <div 
                            className={`px-4 py-2 cursor-pointer hover:bg-[#4a5563] text-left transition-colors whitespace-nowrap ${militaryFilter === 'all' ? 'text-amber-400' : ''}`}
                            onClick={() => { setMilitaryFilter('all'); setShowMilitaryFilterDropdown(false); }}
                          >
                            全部武职
                          </div>
                          {MILIT_JOBS.map(job => (
                            <div 
                              key={job}
                              className={`px-4 py-2 cursor-pointer hover:bg-[#4a5563] text-left transition-colors whitespace-nowrap ${militaryFilter === job ? 'text-amber-400' : ''}`}
                              onClick={() => { setMilitaryFilter(job); setShowMilitaryFilterDropdown(false); }}
                            >
                              {job}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="col-span-1 flex items-center justify-center cursor-pointer hover:text-white" onClick={() => toggleSort('position')}>
                    职位 {renderSortIcon('position')}
                  </div>
                  <div className="col-span-1 flex items-center justify-center cursor-pointer hover:text-white" onClick={() => toggleSort('pro')}>
                    繁荣 {renderSortIcon('pro')}
                  </div>
                  <div className="col-span-1 flex items-center justify-center cursor-pointer hover:text-white" onClick={() => toggleSort('weekW')}>
                    武勋 {renderSortIcon('weekW')}
                  </div>
                  <div className="col-span-1 flex items-center justify-center cursor-pointer hover:text-white" onClick={() => toggleSort('weekC')}>
                    贡献 {renderSortIcon('weekC')}
                  </div>
                  <div className="col-span-1 flex items-center justify-center cursor-pointer hover:text-white" onClick={() => toggleSort('group')}>
                    分组 {renderSortIcon('group')}
                  </div>
                  <div className="col-span-1 flex items-center justify-center cursor-pointer hover:text-white" onClick={() => toggleSort('pos')}>
                    位置 {renderSortIcon('pos')}
                  </div>
                  <div className="col-span-1 flex items-center justify-center">操作</div>
                </div>
                <div 
                  ref={scrollRef}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  className={`flex-1 overflow-y-auto custom-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                >
                  {displayMembers.map((m) => (
                    <div key={m.id} className="grid grid-cols-10 text-white text-sm py-3 px-3 border-b border-gray-600/50 items-center text-center">
                      <div className="col-span-1 truncate">{m.name}</div>
                      <div className="col-span-1 text-xs truncate">{m.civilJob}</div>
                      <div className="col-span-1 text-xs truncate">{m.militaryJob}</div>
                      <div className="col-span-1 truncate">{m.position}</div>
                      <div className="col-span-1 truncate">{m.pro}</div>
                      <div className="col-span-1 truncate">{m.weekW}</div>
                      <div className="col-span-1 truncate">{m.weekC}</div>
                      <div className="col-span-1 text-green-400 truncate">{m.groupName}</div>
                      <div className="col-span-1 text-green-400 text-xs truncate">{m.pos}</div>
                      <div className="col-span-1 flex justify-center cursor-pointer">
                        {m.name === '1024' ? (
                          <LogOut size={18} className="text-[#ef4444] hover:text-[#f87171] transition-colors" onClick={() => setShowExitConfirm(true)} />
                        ) : (
                          <Settings size={18} className="text-gray-400 hover:text-white transition-colors" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-8 bg-[#363f4a] text-gray-300 text-sm py-2 px-3 border-b border-gray-500 shrink-0 tracking-widest select-none text-center">
                  <div className="col-span-1">分组名称</div>
                  <div className="col-span-1">组长</div>
                  <div className="col-span-1">分组人数</div>
                  <div className="col-span-1">繁荣度</div>
                  <div className="col-span-1">周武勋</div>
                  <div className="col-span-1">周贡献</div>
                  <div className="col-span-2">操作</div>
                </div>
                <div 
                  ref={scrollRef}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  className={`flex-1 overflow-y-auto custom-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                >
                  {groupStats.map((g) => (
                    <div key={g.id} className="grid grid-cols-8 text-white text-sm py-3 px-3 border-b border-gray-600/50 items-center text-center">
                      <div className="col-span-1 text-amber-500 font-bold">{g.name}</div>
                      <div className="col-span-1">{g.leaderName}</div>
                      <div className="col-span-1">{g.count}/50</div>
                      <div className="col-span-1">{g.totalPro}</div>
                      <div className="col-span-1">{g.totalWW}</div>
                      <div className="col-span-1">{g.totalWC}</div>
                      <div className="col-span-2 flex justify-center gap-2">
                        <button 
                          onClick={() => setViewGroupDetails(g.id)}
                          className="text-xs bg-[#363f4a] border border-gray-500 hover:bg-[#4a5563] text-white px-3 py-1 rounded-sm"
                        >
                          详情
                        </button>
                        {hasPersonnelPerm && (
                          <>
                            <button 
                              onClick={() => setEditingGroup(g.id)}
                              className="text-xs bg-[#f69147] hover:bg-[#eb8c39] text-white px-3 py-1 rounded-sm"
                            >
                              管理成员
                            </button>
                            <button 
                              onClick={() => {
                                setGroups(prev => prev.filter(gr => gr.id !== g.id));
                                setMembers(prev => prev.map(m => m.groupId === g.id ? { ...m, groupId: null } : m));
                              }}
                              className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-sm"
                            >
                              删除
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {groupStats.length === 0 && (
                    <div className="text-gray-400 text-center py-10">暂无分组记录</div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-4 justify-end mt-4 shrink-0">
            {listTab === 'members' ? (
              <>
                <button 
                  onClick={() => setShowApplications(true)}
                  className="bg-[#363f4a] text-white px-8 py-2 text-sm border border-gray-500 tracking-widest hover:bg-[#4a5563] transition-colors"
                >
                  入盟申请
                </button>
                <button 
                  onClick={() => setView('assign')}
                  className="bg-[#363f4a] text-white px-8 py-2 text-sm border border-gray-500 tracking-widest hover:bg-[#4a5563] transition-colors"
                >
                  职位委任
                </button>
              </>
            ) : (
              hasPersonnelPerm && (
                <button 
                  onClick={() => setShowCreateGroup(true)}
                  className="bg-[#363f4a] text-white px-8 py-2 text-sm border border-gray-500 tracking-widest hover:bg-[#4a5563] transition-colors"
                >
                  创建分组
                </button>
              )
            )}
          </div>
        </>
      ) : (
        /* Assign Position Layout matching screenshot */
        <div className="flex-1 relative bg-[#8795a2] py-2 px-4 flex flex-col justify-center">
          <div className="grid grid-cols-6 grid-rows-3 gap-y-1 gap-x-2 h-fit max-h-full items-center justify-items-center">
            {positionLayout.map((pos) => {
              const memberId = assignments[pos.id];
              const member = members.find(m => m.id === memberId);
              
              return (
                <div 
                  key={pos.id} 
                  className="flex flex-col items-center justify-center col-start-auto row-start-auto text-center"
                  style={{ gridColumnStart: pos.x + 1, gridRowStart: pos.y + 1 }}
                >
                  <button 
                    onClick={() => setSelectingPos(pos.id)}
                    className={`w-[65px] h-[65px] rounded-full flex items-center justify-center border-2 border-gray-400/50 transition-colors ${member ? 'bg-gray-300' : 'bg-[#bfc6cd]'}`}
                  >
                    {member ? (
                      <div className="text-xs font-bold text-gray-700">icon</div>
                    ) : (
                      <Plus size={28} className="text-[#363f4a]" />
                    )}
                  </button>
                  <div className="text-[#363f4a] text-xs mt-0.5 tracking-widest leading-tight">{pos.title}</div>
                  <div className="text-[#363f4a] text-[10px] leading-none mt-0.5">
                    {member ? member.name : '暂无'}
                  </div>
                </div>
              );
            })}
          </div>
          <button 
            onClick={() => setShowPermissions(true)}
            className="absolute right-4 bg-[#363f4a] text-white px-6 py-1.5 text-sm border border-gray-500 tracking-widest translate-y-[10px] hover:bg-[#4a5563] transition-colors"
            style={{ bottom: '2px' }}
          >
            权限管理
          </button>
          
          {/* Simple Selector Modal */}
          {selectingPos && (
            <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setSelectingPos(null)}>
              <div className="bg-[#4a5563] p-6 w-96 rounded-sm border border-gray-500" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white text-lg font-bold">选择成员</h3>
                    {assignments[selectingPos] !== undefined && assignments[selectingPos] !== null && selectingPos !== 'master' && (
                        <button 
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 text-sm"
                            onClick={() => {
                                setAssignments(prev => {
                                    const next = {...prev};
                                    delete next[selectingPos];
                                    return next;
                                });
                                setSelectingPos(null);
                            }}
                        >
                            卸任
                        </button>
                    )}
                </div>
                <div className="max-h-60 overflow-y-auto w-full custom-scrollbar">
                    {members.map(m => (
                        <div key={m.id} className="p-3 cursor-pointer hover:bg-gray-600 text-white border-b border-gray-600/50 last:border-0 flex justify-between" onClick={() => handleAssign(m.id)}>
                            <span>{m.name}</span> <span className="text-gray-400 text-xs">{getPositionName(m.id)}</span>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-[130] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#4a5464] border border-[#5c687a] p-6 w-96 font-sans">
            <h3 className="text-white text-lg font-bold tracking-widest mb-4">创建分组</h3>
            <input 
              type="text" 
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              placeholder="请输入分组名称"
              maxLength={10}
              className="w-full bg-[#363f4a] border border-[#5c687a] text-white p-2 outline-none focus:border-gray-400 mb-6"
            />
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => setShowCreateGroup(false)}
                className="px-6 py-1.5 bg-[#363f4a] border border-gray-500 text-white hover:bg-[#4a5563] transition-colors"
              >取消</button>
              <button 
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                className="px-6 py-1.5 bg-[#ef8133] text-white hover:bg-[#f69147] transition-colors disabled:opacity-50"
              >确认创建</button>
            </div>
          </div>
        </div>
      )}

      {/* Editing Group Members Full Screen */}
      {editingGroup && (
        <div className="absolute inset-0 z-[120] bg-[#8795a2] flex flex-col font-sans animate-in fade-in duration-300 p-6">
          <div className="flex items-center mb-6 shrink-0">
            <button 
              onClick={() => {
                setEditingGroup(null);
                setManageGroupSearch('');
              }} 
              className="text-white hover:text-gray-200"
            >
              <Undo2 size={24} className="scale-x-[-1]" />
            </button>
            <span className="text-white font-bold text-xl ml-4 tracking-widest">
              管理分组 - {groups.find(g => g.id === editingGroup)?.name}
            </span>
          </div>
          
          <div className="flex gap-2 mb-4 shrink-0">
            <div className="flex-1" />
            <input 
              type="text" 
              placeholder="输入成员名字…" 
              value={manageGroupSearch}
              onChange={(e) => setManageGroupSearch(e.target.value)}
              className="bg-[#363f4a] text-white px-4 py-2 text-sm w-64 border border-gray-500 focus:outline-none focus:border-gray-400" 
            />
            <button className="bg-[#363f4a] text-white px-8 py-2 text-sm border border-gray-500 hover:bg-[#4a5563] transition-colors">搜索</button>
          </div>

          <div className="flex-1 bg-[#4a5563] border border-gray-500 overflow-hidden flex flex-col">
            <div className="grid grid-cols-11 bg-[#363f4a] text-gray-300 text-sm py-2 px-3 border-b border-gray-500 shrink-0 tracking-widest select-none text-center">
              <div className="col-span-1">成员</div>
              <div className="col-span-1">文职</div>
              <div className="col-span-1">武职</div>
              <div className="col-span-1">职位</div>
              <div className="col-span-1">繁荣</div>
              <div className="col-span-1">武勋</div>
              <div className="col-span-1">贡献</div>
              <div className="col-span-1">分组</div>
              <div className="col-span-1">位置</div>
              <div className="col-span-2">操作</div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {displayMembers
                .filter(m => !manageGroupSearch || m.name.includes(manageGroupSearch))
                .map((m) => {
                  const isLeader = groups.find(g => g.id === editingGroup)?.leaderId === m.id;
                  const inGroup = m.groupId === editingGroup;
                  return (
                    <div key={m.id} className="grid grid-cols-11 text-white text-sm py-3 px-3 border-b border-gray-600/50 items-center text-center">
                      <div className="col-span-1 truncate">{m.name}</div>
                      <div className="col-span-1 text-xs truncate">{m.civilJob}</div>
                      <div className="col-span-1 text-xs truncate">{m.militaryJob}</div>
                      <div className="col-span-1 truncate">{m.position}</div>
                      <div className="col-span-1 truncate">{m.pro}</div>
                      <div className="col-span-1 truncate">{m.weekW}</div>
                      <div className="col-span-1 truncate">{m.weekC}</div>
                      <div className="col-span-1 text-green-400 truncate">{m.groupName}</div>
                      <div className="col-span-1 text-green-400 text-xs truncate">{m.pos}</div>
                      <div className="col-span-2 flex items-center justify-center gap-4">
                        <label className="flex items-center gap-1 cursor-pointer hover:text-amber-400 transition-colors">
                          <input 
                            type="checkbox" 
                            className="accent-[#ef8133] w-4 h-4 cursor-pointer"
                            checked={inGroup}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setMembers(prev => prev.map(member => member.id === m.id ? { ...member, groupId: checked ? editingGroup : null } : member));
                              if (!checked && isLeader) {
                                setGroups(prev => prev.map(g => g.id === editingGroup ? { ...g, leaderId: null } : g));
                              }
                            }}
                          />
                          加入
                        </label>
                        {inGroup && (
                          <button
                            onClick={() => {
                              setGroups(prev => prev.map(g => g.id === editingGroup ? { ...g, leaderId: isLeader ? null : m.id } : g));
                            }}
                            className={`text-xs px-2 py-1 rounded-sm border ${isLeader ? 'bg-[#f69147] border-[#f69147] text-white' : 'border-gray-400 text-gray-300 hover:border-white hover:text-white'}`}
                          >
                            {isLeader ? '无组长' : '设为组长'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              {displayMembers.filter(m => !manageGroupSearch || m.name.includes(manageGroupSearch)).length === 0 && (
                 <div className="text-gray-400 text-center py-10">找不到匹配成员</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Group Details Full Screen */}
      {viewGroupDetails && (
        <div className="absolute inset-0 z-[120] bg-[#8795a2] flex flex-col font-sans animate-in fade-in duration-300 p-6">
          <div className="flex items-center mb-6 shrink-0">
            <button 
              onClick={() => {
                setViewGroupDetails(null);
                setDetailGroupSearch('');
              }} 
              className="text-white hover:text-gray-200"
            >
              <Undo2 size={24} className="scale-x-[-1]" />
            </button>
            <span className="text-white font-bold text-xl ml-4 tracking-widest">
              分组成员 - {groups.find(g => g.id === viewGroupDetails)?.name}
            </span>
          </div>

          <div className="flex gap-2 mb-4 shrink-0">
            <div className="flex-1" />
            <input 
              type="text" 
              placeholder="输入成员名字…" 
              value={detailGroupSearch}
              onChange={(e) => setDetailGroupSearch(e.target.value)}
              className="bg-[#363f4a] text-white px-4 py-2 text-sm w-64 border border-gray-500 focus:outline-none focus:border-gray-400" 
            />
            <button className="bg-[#363f4a] text-white px-8 py-2 text-sm border border-gray-500 hover:bg-[#4a5563] transition-colors">搜索</button>
          </div>
            
          <div className="flex-1 bg-[#4a5563] border border-gray-500 overflow-hidden flex flex-col">
            <div className="grid grid-cols-10 bg-[#363f4a] text-gray-300 text-sm py-2 px-3 border-b border-gray-500 shrink-0 tracking-widest select-none">
              <div className="col-span-1 text-center py-1">成员</div>
              <div className="col-span-1 text-center py-1">文职</div>
              <div className="col-span-1 text-center py-1">武职</div>
              <div className="col-span-1 text-center py-1">职位</div>
              <div className="col-span-1 text-center py-1">繁荣</div>
              <div className="col-span-1 text-center py-1">武勋</div>
              <div className="col-span-1 text-center py-1">贡献</div>
              <div className="col-span-1 text-center py-1">分组</div>
              <div className="col-span-1 text-center py-1">位置</div>
              <div className="col-span-1 text-center py-1">操作</div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {displayMembers
                .filter(m => m.groupId === viewGroupDetails)
                .filter(m => !detailGroupSearch || m.name.includes(detailGroupSearch))
                .map((m) => (
                <div key={m.id} className="grid grid-cols-10 text-white text-sm py-3 px-3 border-b border-gray-600/50 items-center text-center">
                  <div className="col-span-1 truncate">{m.name}</div>
                  <div className="col-span-1 text-xs truncate">{m.civilJob}</div>
                  <div className="col-span-1 text-xs truncate">{m.militaryJob}</div>
                  <div className="col-span-1 truncate">{m.position}</div>
                  <div className="col-span-1 truncate">{m.pro}</div>
                  <div className="col-span-1 truncate">{m.weekW}</div>
                  <div className="col-span-1 truncate">{m.weekC}</div>
                  <div className="col-span-1 text-green-400 truncate">{m.groupName}</div>
                  <div className="col-span-1 text-green-400 text-xs truncate">{m.pos}</div>
                  <div className="col-span-1 flex justify-center cursor-pointer">
                    {hasPersonnelPerm && (
                      <button 
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-sm"
                        onClick={() => {
                          setMembers(prev => prev.map(member => member.id === m.id ? { ...member, groupId: null } : member));
                          if (groups.find(g => g.id === viewGroupDetails)?.leaderId === m.id) {
                            setGroups(prev => prev.map(g => g.id === viewGroupDetails ? { ...g, leaderId: null } : g));
                          }
                        }}
                      >
                        移出分组
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {displayMembers.filter(m => m.groupId === viewGroupDetails && (!detailGroupSearch || m.name.includes(detailGroupSearch))).length === 0 && (
                <div className="text-gray-400 text-center py-10">{detailGroupSearch ? '找不到匹配的成员' : '该分组下暂无成员'}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Permissions Management Modal */}
      {showPermissions && (
        <div className="absolute inset-0 z-[120] bg-black/60 flex items-center justify-center p-8">
          <div className="bg-[#4a5464] w-full max-w-5xl max-h-[95%] flex flex-col shadow-2xl relative border border-[#5c687a]">
            {/* Header */}
            <div className="text-center py-4 relative bg-[#4a5464] border-b border-[#363f4a] shrink-0">
              <div className="text-white text-xl tracking-widest">权限管理</div>
              <button onClick={() => setShowPermissions(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-7 bg-[#282f38] text-[#c9ae77] py-3 px-4 shrink-0 text-sm tracking-widest text-center border-b border-[#363f4a]">
              <div className="col-span-1">官职</div>
              {PERMISSION_TYPES.map(p => <div key={p.id}>{p.label}</div>)}
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#3e4856]">
              {ALL_POSITIONS.map(pos => {
                const memberId = assignments[pos.id];
                const member = members.find(m => m.id === memberId);
                const isMaster = pos.id === 'master';

                return (
                  <div key={pos.id} className="grid grid-cols-7 border-b border-[#4a5464] py-3 px-4 items-center text-center hover:bg-white/5 transition-colors">
                    <div className="col-span-1 text-center flex flex-col items-center">
                      <span className="text-white text-[13px] tracking-wide">{pos.title}</span>
                      <span className="text-gray-300 text-[11px] mt-0.5">{member ? member.name : '未委任'}</span>
                    </div>
                    
                    {PERMISSION_TYPES.map(perm => {
                      const hasPerm = permissions[pos.id][perm.id];
                      return (
                        <div key={perm.id} className="flex justify-center items-center">
                          {isMaster ? (
                            <Check size={32} className="text-[#2ecd71]" strokeWidth={2.5} />
                          ) : (
                            <button 
                              onClick={() => togglePermission(pos.id, perm.id)}
                              className="w-[28px] h-[28px] bg-[#2a313a] border border-[#1f242b] rounded-sm flex items-center justify-center transition-colors hover:border-gray-400"
                            >
                              {hasPerm && <Check size={26} className="text-[#2ecd71]" strokeWidth={2.5} />}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplications && (
        <div className="absolute inset-0 z-[120] bg-black/60 flex items-center justify-center p-8">
          <div className="bg-[#4a5464] w-[700px] max-h-[80%] flex flex-col shadow-2xl relative border border-[#5c687a]">
            {/* Header */}
            <div className="text-center py-4 relative bg-[#4a5464] border-b border-[#363f4a] shrink-0">
              <div className="text-white text-xl tracking-widest">入盟申请</div>
              <button onClick={() => setShowApplications(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content List Context */}
            <div className="flex-1 bg-[#536173] p-4 overflow-hidden flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-4 bg-[#363f4a] text-[#c9ae77] py-2 px-6 shrink-0 text-sm tracking-widest text-center border border-[#4a5464]">
                <div>名称</div>
                <div>繁荣度</div>
                <div>位置</div>
                <div>操作</div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto">
                {applications.map(app => (
                  <div key={app.id} className="grid grid-cols-4 text-white text-sm py-3 px-6 items-center text-center hover:bg-white/5 transition-colors">
                    <div>{app.name}</div>
                    <div>{app.pro}</div>
                    <div className="text-green-400">{app.pos}</div>
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => setApplications(prev => prev.filter(a => a.id !== app.id))}
                        className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-4 py-1 rounded-sm tracking-widest transition-colors"
                      >
                        拒绝
                      </button>
                      <button 
                        onClick={() => setApplications(prev => prev.filter(a => a.id !== app.id))}
                        className="bg-[#f69147] hover:bg-[#ea580c] text-white px-4 py-1 rounded-sm tracking-widest transition-colors"
                      >
                        同意
                      </button>
                    </div>
                  </div>
                ))}
                {applications.length === 0 && (
                  <div className="text-center text-gray-400 py-10 tracking-widest">暂无申请</div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-4 p-4 bg-[#4a5464] border-t border-[#363f4a] shrink-0">
              <button 
                onClick={() => setApplications([])}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-6 py-2 tracking-widest transition-colors rounded-sm"
              >
                全部拒绝
              </button>
              <button 
                onClick={() => setApplications([])}
                className="bg-[#f69147] hover:bg-[#ea580c] text-white px-6 py-2 tracking-widest transition-colors rounded-sm"
              >
                全部同意
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirm Modal */}
      {showExitConfirm && (
        <div className="absolute inset-0 z-[130] bg-black/60 flex items-center justify-center p-8">
          <div className="bg-[#4a5464] w-[400px] flex flex-col shadow-2xl relative border border-[#5c687a]">
            {/* Header */}
            <div className="text-center py-4 relative bg-[#4a5464] border-b border-[#363f4a] shrink-0">
              <div className="text-white text-lg tracking-widest font-bold">提示</div>
              <button onClick={() => setShowExitConfirm(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 bg-[#536173] p-8 text-center text-white tracking-widest">
              是否退出同盟？
            </div>

            {/* Footer */}
            <div className="flex justify-center gap-6 p-4 bg-[#4a5464] border-t border-[#363f4a] shrink-0">
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="bg-[#6b7280] hover:bg-[#4b5563] text-white px-8 py-2 tracking-widest transition-colors rounded-sm"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  setShowExitConfirm(false);
                  if (onLeaveAlliance) onLeaveAlliance();
                }}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-8 py-2 tracking-widest transition-colors rounded-sm"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
