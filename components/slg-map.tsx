'use client';

import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import Image from 'next/image';
import { TroopData } from '@/data/troops';
import { calculatePath } from '@/utils/pathfinding';
import { initialMapTiles, TileData as MapTileData } from '@/data/map-layout';

const GRID_SIZE = 15;
const TILE_WIDTH = 120;
const TILE_HEIGHT = 60;

const RESOURCE_IMAGES: Record<string, string> = {
  '木材': 'wood',
  '铁矿': 'iron',
  '石头': 'stone',
  '粮食': 'food',
  '主城': 'https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/UI/city.png',
  '空地': 'https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/map/ground.png',
};

const BASE_URL = 'https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/map/';

const getResourceUrl = (type: string, level: number = 1) => {
  const img = RESOURCE_IMAGES[type];
  if (!img) return null;
  if (img.startsWith('http')) return img;
  
  // For resources with levels (wood, iron, stone, food)
  const safeLevel = Math.min(Math.max(1, level), 9);
  return `${BASE_URL}${img}_${safeLevel}.png`;
};

export interface TileData extends MapTileData {}

const getTilePixelCenter = (row: number, col: number) => {
  let x = (col - row) * (TILE_WIDTH / 2);
  let y = (col + row) * (TILE_HEIGHT / 2);
  if (col % 2 !== 0) {
    x += TILE_WIDTH / 4;
    y -= TILE_HEIGHT / 4;
  }
  // Return the true center of the diamond
  return { x, y: y + TILE_HEIGHT / 2 };
};

const MarchingTroop = ({ troop, isSelected, onSelect }: { troop: TroopData, isSelected: boolean, onSelect: (id: string) => void }) => {
  const troopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (troop.status !== '行军' || !troop.targetTile || !troop.startTime || !troop.endTime) return;
    
    const routePoints = (troop.route || [{row: 6, col: 6}, {row: troop.targetTile.row, col: troop.targetTile.col}])
      .map(p => getTilePixelCenter(p.row, p.col));

    let totalLength = 0;
    const segmentLengths: number[] = [];
    for (let i = 0; i < routePoints.length - 1; i++) {
      const dx = routePoints[i+1].x - routePoints[i].x;
      const dy = routePoints[i+1].y - routePoints[i].y;
      const len = Math.sqrt(dx*dx + dy*dy);
      segmentLengths.push(len);
      totalLength += len;
    }
    
    let frame: number;
    const updatePosition = () => {
      if (!troopRef.current) return;
      
      const now = Date.now();
      let progress = 0;
      if (troop.endTime! > troop.startTime!) {
        progress = (now - troop.startTime!) / (troop.endTime! - troop.startTime!);
      } else {
        progress = 1;
      }
      if (progress > 1) progress = 1;
      if (progress < 0) progress = 0;

      let currentX = routePoints[0].x;
      let currentY = routePoints[0].y;

      if (progress >= 1) {
        currentX = routePoints[routePoints.length - 1].x;
        currentY = routePoints[routePoints.length - 1].y;
      } else if (totalLength > 0) {
        const targetLength = totalLength * progress;
        let currentLength = 0;
        for (let i = 0; i < segmentLengths.length; i++) {
          if (currentLength + segmentLengths[i] >= targetLength) {
            const segmentProgress = (targetLength - currentLength) / segmentLengths[i];
            currentX = routePoints[i].x + (routePoints[i+1].x - routePoints[i].x) * segmentProgress;
            currentY = routePoints[i].y + (routePoints[i+1].y - routePoints[i].y) * segmentProgress;
            break;
          }
          currentLength += segmentLengths[i];
        }
      }

      troopRef.current.style.left = `${currentX}px`;
      troopRef.current.style.top = `${currentY}px`;

      if (progress < 1) {
        frame = requestAnimationFrame(updatePosition);
      }
    };
    
    frame = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(frame);
  }, [troop.status, troop.targetTile, troop.startTime, troop.endTime, troop.route]);

  if (troop.status !== '行军' || !troop.targetTile || !troop.startTime || !troop.endTime) return null;

  const startPixel = getTilePixelCenter(6, 6);
  
  const routePoints = (troop.route || [{row: 6, col: 6}, {row: troop.targetTile.row, col: troop.targetTile.col}])
    .map(p => getTilePixelCenter(p.row, p.col));

  return (
    <div 
      ref={troopRef}
      className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
      style={{ left: startPixel.x, top: startPixel.y }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(troop.id);
      }}
    >
      <div className={`relative w-10 h-10 rounded-full border-2 overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.8)] ${isSelected ? 'border-amber-400' : 'border-blue-400'}`}>
        <Image src={troop.heroAvatar || `https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/hero-avatar/${troop.heroName}.png`} alt={troop.heroName} fill className="object-cover" unoptimized />
      </div>
      {/* Route line if selected */}
      {isSelected && routePoints.length > 1 && (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ width: 0, height: 0 }}>
          <polyline 
            points={routePoints.map(p => `${p.x - startPixel.x},${p.y - startPixel.y}`).join(' ')}
            fill="none"
            stroke="#60a5fa" 
            strokeWidth="3" 
            strokeDasharray="6,6"
            className="animate-[dash_1s_linear_infinite] opacity-80"
          />
        </svg>
      )}
    </div>
  );
};

interface SLGMapProps {
  onDistanceChange?: (distance: number) => void;
  onAttack?: (tile: TileData) => void;
  onTestAttack?: (tile: TileData) => void;
  previewRoute?: { start: { row: number, col: number }, end: { row: number, col: number } } | null;
  marchingTroops?: TroopData[];
  selectedMarchingTroopId?: string | null;
  onSelectMarchingTroop?: (id: string) => void;
  isViewLocked?: boolean;
  showMarchSelection?: boolean;
}

export interface SLGMapRef {
  centerOnCity: () => void;
}

const SLGMap = forwardRef<SLGMapRef, SLGMapProps>(({ 
  onDistanceChange, 
  onAttack, 
  onTestAttack,
  previewRoute, 
  marchingTroops = [], 
  selectedMarchingTroopId,
  onSelectMarchingTroop,
  isViewLocked = false,
  showMarchSelection = false
}, ref) => {
  const [tiles] = useState<TileData[]>(initialMapTiles);

  // Pan state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const mouseStartRef = useRef({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // Selection state
  const [selectedTile, setSelectedTile] = useState<TileData | null>(null);

  const centerOnTile = (row: number, col: number) => {
    if (mapRef.current) {
      const parentWidth = mapRef.current.parentElement?.clientWidth || 956;
      const parentHeight = mapRef.current.parentElement?.clientHeight || 460;
      const target = getTilePixelCenter(row, col);
      setPosition({
        x: parentWidth / 2 - target.x,
        y: parentHeight / 2 - target.y,
      });
    }
  };

  useImperativeHandle(ref, () => ({
    centerOnCity: () => {
      centerOnTile(6, 6);
    }
  }));

  // Calculate distance to city center (6,6)
  useEffect(() => {
    if (!mapRef.current) return;
    const parentWidth = mapRef.current.parentElement?.clientWidth || 956;
    const parentHeight = mapRef.current.parentElement?.clientHeight || 460;
    
    // Current camera center in map pixel coordinates
    const cx = parentWidth / 2 - position.x;
    const cy = parentHeight / 2 - position.y;

    // Find closest tile to (cx, cy)
    let closestTile = tiles[0];
    let minDist = Infinity;
    for (const tile of tiles) {
      const tc = getTilePixelCenter(tile.row, tile.col);
      const dist = Math.pow(tc.x - cx, 2) + Math.pow(tc.y - cy, 2);
      if (dist < minDist) {
        minDist = dist;
        closestTile = tile;
      }
    }

    // Distance in grid units to (6,6)
    const gridDist = Math.floor(Math.sqrt(Math.pow(closestTile.row - 6, 2) + Math.pow(closestTile.col - 6, 2)));
    onDistanceChange?.(gridDist);
  }, [position, tiles, onDistanceChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isViewLocked && showMarchSelection) return;
    setIsDragging(true);
    setHasDragged(false);
    mouseStartRef.current = { x: e.clientX, y: e.clientY };
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isViewLocked && showMarchSelection) return;
    if (!isDragging) return;
    
    if (!hasDragged) {
      const dx = e.clientX - mouseStartRef.current.x;
      const dy = e.clientY - mouseStartRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setHasDragged(true);
        setSelectedTile(null); // Cancel selection when moving map
      }
    }

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Center the map initially on Main City
  useEffect(() => {
    if (mapRef.current) {
      const parentWidth = mapRef.current.parentElement?.clientWidth || 956;
      const parentHeight = mapRef.current.parentElement?.clientHeight || 460;
      const target = getTilePixelCenter(6, 6);
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setPosition({
          x: parentWidth / 2 - target.x,
          y: parentHeight / 2 - target.y,
        });
      }, 0);
    }
  }, []);

  const cachedPath = React.useMemo(() => {
    if (previewRoute) {
      return calculatePath(previewRoute.start, previewRoute.end, GRID_SIZE);
    }
    return null;
  }, [previewRoute]);

  const renderPreviewRoute = () => {
    if (!cachedPath || cachedPath.length === 0) return null;
    
    try {
      const points = cachedPath
        .map(p => {
          if (!p || typeof p.row !== 'number' || typeof p.col !== 'number') return null;
          return getTilePixelCenter(p.row, p.col);
        })
        .filter(p => p !== null);

      if (points.length === 0) return null;
      
      return (
        <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 20 }}>
          <polyline 
            points={points.map(p => `${p!.x},${p!.y}`).join(' ')}
            fill="none"
            stroke="#fbbf24" 
            strokeWidth="4" 
            strokeDasharray="10,10"
            className="animate-[dash_1s_linear_infinite] opacity-80 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]"
          />
          <style>{`
            @keyframes dash {
              to {
                stroke-dashoffset: -20;
              }
            }
          `}</style>
        </svg>
      );
    } catch (e) {
      console.error('Error rendering preview route', e);
      return null;
    }
  };

  const renderMarchingTroops = () => {
    return marchingTroops.map(troop => (
      <MarchingTroop 
        key={troop.id} 
        troop={troop} 
        isSelected={selectedMarchingTroopId === troop.id} 
        onSelect={(id) => onSelectMarchingTroop?.(id)} 
      />
    ));
  };

  return (
    <div 
      className="absolute inset-0 overflow-hidden bg-[#3a4822] cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      ref={mapRef}
    >
      <div 
        className="absolute origin-top-left"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)` 
        }}
      >
        <svg width="0" height="0" className="absolute">
          <defs>
            <radialGradient id="selectedGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
              <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.8" />
            </radialGradient>
          </defs>
        </svg>

        {tiles.map((tile) => {
          const { row, col, type, level } = tile;
          const { x, y } = getTilePixelCenter(row, col);

          const isSelected = selectedTile?.row === row && selectedTile?.col === col;
          const isMainCity = type === '主城';
          
          let fillColor = '#799653';
          if (isMainCity || type === '空地') fillColor = 'transparent';
          else if (type === '木材') fillColor = '#854d0e';
          else if (type === '铁矿') fillColor = '#475569';
          else if (type === '石头') fillColor = '#a8a29e';
          else if (type === '粮食') fillColor = '#ca8a04';

          return (
            <div
              key={`${row}-${col}`}
              className={`absolute group ${isMainCity ? (row === 6 && col === 6 ? 'z-30' : 'z-20') : 'z-0'}`}
              style={{
                left: x,
                top: y - TILE_HEIGHT / 2,
                width: TILE_WIDTH,
                height: TILE_HEIGHT,
                marginLeft: -TILE_WIDTH / 2,
              }}
            >
              {/* SVG Diamond */}
              <svg 
                viewBox={`0 0 ${TILE_WIDTH} ${TILE_HEIGHT}`} 
                className="w-full h-full overflow-visible"
              >
                <polygon
                  points={`${TILE_WIDTH/2},0 ${TILE_WIDTH},${TILE_HEIGHT/2} ${TILE_WIDTH/2},${TILE_HEIGHT} 0,${TILE_HEIGHT/2}`}
                  fill={fillColor}
                  className={`${isMainCity ? 'stroke-transparent' : 'stroke-[#6f793f]'} stroke-[1.5] transition-colors cursor-pointer hover:brightness-110`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (showMarchSelection) return;
                    if (!hasDragged) {
                      setSelectedTile(tile);
                    }
                  }}
                />
              </svg>

              {/* Resource Icon */}
              {getResourceUrl(type, level) && (
                <div className="absolute inset-0 pointer-events-none">
                  {type === '主城' ? (
                    // Only render the city image for the center tile (6,6) to cover the 7 tiles
                    row === 6 && col === 6 && (
                      <div 
                        className="absolute left-1/2 top-1/2"
                        style={{ transform: 'translate(calc(-50% + 1px), calc(-50% - 20px))' }}
                      >
                        <div className="relative w-[360px] h-[180px] shrink-0">
                          <Image 
                            src={getResourceUrl(type, level)!} 
                            alt={type} 
                            fill 
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                    )
                  ) : (
                    <Image 
                      src={getResourceUrl(type, level)!} 
                      alt={type} 
                      fill 
                      className="object-cover"
                      style={type === '空地' ? { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' } : undefined}
                      unoptimized
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Selection Overlay Layer (Always on top) */}
        {selectedTile && !showMarchSelection && (() => {
          const { row, col, type, level } = selectedTile;
          const { x, y } = getTilePixelCenter(row, col);
          return (
            <div 
              className="absolute z-50 pointer-events-none"
              style={{
                left: x,
                top: y - TILE_HEIGHT / 2,
                width: TILE_WIDTH,
                height: TILE_HEIGHT,
                marginLeft: -TILE_WIDTH / 2,
              }}
            >
              <svg viewBox={`0 0 ${TILE_WIDTH} ${TILE_HEIGHT}`} className="w-full h-full overflow-visible">
                <polygon
                  points={`${TILE_WIDTH/2},0 ${TILE_WIDTH},${TILE_HEIGHT/2} ${TILE_WIDTH/2},${TILE_HEIGHT} 0,${TILE_HEIGHT/2}`}
                  fill="url(#selectedGlow)"
                  className="animate-pulse"
                />
              </svg>
              
              <div className="absolute inset-0 pointer-events-none">
                {/* Top: Name Module */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gradient-to-b from-slate-800/90 to-slate-900/90 text-amber-100 text-xs px-4 py-1.5 rounded-sm border border-amber-700/50 whitespace-nowrap shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span className="font-bold tracking-wider">{type}</span>
                  {type !== '主城' && <span className="text-amber-400/80 font-mono">Lv.{level}</span>}
                </div>
                
                {/* Right: Action Module */}
                <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 flex flex-col gap-2 pointer-events-auto">
                  <button 
                    className="bg-gradient-to-b from-blue-700/90 to-blue-900/90 hover:from-blue-600/90 hover:to-blue-800/90 text-blue-100 text-xs px-5 py-2 rounded-sm border border-blue-500/50 shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-all tracking-widest whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAttack?.(selectedTile);
                      setSelectedTile(null);
                    }}
                  >
                    行军
                  </button>
                  {type !== '主城' && (
                    <button 
                      className="bg-gradient-to-b from-red-700/90 to-red-900/90 hover:from-red-600/90 hover:to-red-800/90 text-red-100 text-xs px-5 py-2 rounded-sm border border-red-500/50 shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-all tracking-widest whitespace-nowrap"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAttack?.(selectedTile);
                        setSelectedTile(null);
                      }}
                    >
                      攻占
                    </button>
                  )}
                </div>

                {/* Bottom: Coordinate Module */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-900/80 text-slate-300 text-[10px] px-3 py-1 rounded-sm border border-slate-700/50 whitespace-nowrap flex items-center gap-2 shadow-md">
                  <span className="text-slate-400">长安</span>
                  <span className="font-mono text-amber-200/70">{row},{col}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {renderPreviewRoute()}
        {renderMarchingTroops()}
      </div>
    </div>
  );
});

SLGMap.displayName = 'SLGMap';
export default SLGMap;
