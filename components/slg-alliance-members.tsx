'use client';

import React, { useState, useRef } from 'react';
import { Undo2, Settings, LogOut, Plus, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

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

export default function SLGAllianceMembers({ onClose, onLeaveAlliance }: SLGAllianceMembersProps) {
  const [view, setView] = useState<'list' | 'assign'>('list');
  const [members, setMembers] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      name: i === 0 ? '1024' : `玩家名字${i + 1}`,
      job: i === 0 ? '镇君' : '职业名',
      position: i === 0 ? '主公' : '成员',
      pro: i === 0 ? '86854' : '12345',
      weekW: '1234',
      weekC: '123',
      group: '分组',
      pos: '长安(123,123)',
    }))
  );

  // Position definition based on visual layout
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

  const [assignments, setAssignments] = useState<Record<string, number | null>>({
    master: members[0].id
  });

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
      setAssignments(prev => ({ ...prev, [selectingPos]: memberId }));
      setSelectingPos(null);
    }
  };

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
            <button className="bg-[#f69147] text-white px-8 py-2 text-sm tracking-widest">全部成员</button>
            <button className="bg-[#363f4a] text-gray-300 px-8 py-2 text-sm tracking-widest">分组</button>
            <div className="flex-1" />
            <input type="text" placeholder="输入成员名字…" className="bg-[#363f4a] text-white px-4 py-2 text-sm w-64 border border-gray-500" />
            <button className="bg-[#363f4a] text-white px-8 py-2 text-sm border border-gray-500">搜索</button>
          </div>

          {/* Table */}
          <div className="flex-1 bg-[#4a5563] border border-gray-500 overflow-hidden flex flex-col">
            <div className="grid grid-cols-9 bg-[#363f4a] text-gray-300 text-sm py-2 px-4 border-b border-gray-500 shrink-0 tracking-widest">
              <div className="col-span-1">成员</div>
              <div className="col-span-1">职业</div>
              <div className="col-span-1">职位</div>
              <div className="col-span-1">繁荣</div>
              <div className="col-span-1">武勋</div>
              <div className="col-span-1">贡献</div>
              <div className="col-span-1">分组</div>
              <div className="col-span-1">位置</div>
              <div className="col-span-1">操作</div>
            </div>
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex-1 overflow-y-auto custom-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              {members.map((m) => (
                <div key={m.id} className="grid grid-cols-9 text-white text-sm py-3 px-4 border-b border-gray-600/50 items-center">
                  <div className="col-span-1">{m.name}</div>
                  <div className="col-span-1">{m.job}</div>
                  <div className="col-span-1">{m.position}</div>
                  <div className="col-span-1">{m.pro}</div>
                  <div className="col-span-1">{m.weekW}</div>
                  <div className="col-span-1">{m.weekC}</div>
                  <div className="col-span-1 text-green-400">{m.group}</div>
                  <div className="col-span-1 text-green-400">{m.pos}</div>
                  <div className="col-span-1 cursor-pointer">
                    {m.name === '1024' ? (
                      <LogOut size={18} className="text-[#ef4444] hover:text-[#f87171] transition-colors" onClick={() => setShowExitConfirm(true)} />
                    ) : (
                      <Settings size={18} className="text-gray-400 hover:text-white transition-colors" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-4 justify-end mt-4 shrink-0">
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
                    {assignments[selectingPos] !== undefined && assignments[selectingPos] !== null && (
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
                        <div key={m.id} className="p-3 cursor-pointer hover:bg-gray-600 text-white border-b border-gray-600/50 last:border-0" onClick={() => handleAssign(m.id)}>
                            {m.name} - <span className="text-gray-400 text-xs">{m.position}</span>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          )}
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
