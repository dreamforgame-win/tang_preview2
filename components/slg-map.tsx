'use client';

import React, { useState, useRef, useEffect } from 'react';

const GRID_SIZE = 15;
const TILE_WIDTH = 120;
const TILE_HEIGHT = 60;

export default function SLGMap() {
  const [tiles] = useState(() => {
    const initialTiles = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        initialTiles.push({ row, col });
      }
    }
    return initialTiles;
  });

  // Pan state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const mouseStartRef = useRef({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // Selection state
  const [selectedTile, setSelectedTile] = useState<{row: number, col: number} | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setHasDragged(false);
    mouseStartRef.current = { x: e.clientX, y: e.clientY };
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
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

  // Center the map initially
  useEffect(() => {
    if (mapRef.current) {
      const parentWidth = mapRef.current.parentElement?.clientWidth || 956;
      const parentHeight = mapRef.current.parentElement?.clientHeight || 460;
      
      const gridCenterY = (GRID_SIZE * TILE_HEIGHT) / 2;
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition({
        x: parentWidth / 2,
        y: parentHeight / 2 - gridCenterY,
      });
    }
  }, []);

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

        {tiles.map(({ row, col }) => {
          // Isometric math
          let x = (col - row) * (TILE_WIDTH / 2);
          let y = (col + row) * (TILE_HEIGHT / 2);

          // Staggered offset for even columns (odd index 1, 3, 5...)
          if (col % 2 !== 0) {
            x += TILE_WIDTH / 4;
            y -= TILE_HEIGHT / 4;
          }

          const isSelected = selectedTile?.row === row && selectedTile?.col === col;

          return (
            <div
              key={`${row}-${col}`}
              className="absolute group"
              style={{
                left: x,
                top: y,
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
                  className="fill-[#799653] stroke-[#6f793f] stroke-[1.5] transition-colors cursor-pointer hover:brightness-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!hasDragged) {
                      setSelectedTile({ row, col });
                    }
                  }}
                />
                {isSelected && (
                  <polygon
                    points={`${TILE_WIDTH/2},0 ${TILE_WIDTH},${TILE_HEIGHT/2} ${TILE_WIDTH/2},${TILE_HEIGHT} 0,${TILE_HEIGHT/2}`}
                    fill="url(#selectedGlow)"
                    className="animate-pulse pointer-events-none"
                  />
                )}
              </svg>

              {/* Tile Info Popup */}
              {isSelected && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  {/* Top: Name Module */}
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded border border-[#8b6b4a]/50 whitespace-nowrap">
                    平地
                  </div>
                  
                  {/* Right: Action Module */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-full ml-2 flex flex-col gap-2 pointer-events-auto">
                    <button className="bg-blue-600/90 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded border border-blue-400/50 shadow-lg transition-colors">
                      行军
                    </button>
                    <button className="bg-red-600/90 hover:bg-red-500 text-white text-xs px-4 py-1.5 rounded border border-red-400/50 shadow-lg transition-colors">
                      攻占
                    </button>
                  </div>

                  {/* Bottom: Coordinate Module */}
                  <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded border border-[#8b6b4a]/50 whitespace-nowrap flex items-center gap-2">
                    <span className="text-[#d4b484]">长安</span>
                    <span className="font-mono">{row},{col}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
