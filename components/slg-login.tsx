import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface SLGLoginProps {
  onLogin: () => void;
}

export default function SLGLogin({ onLogin }: SLGLoginProps) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
    // Simulate loading progress over 4 seconds
    const duration = 4000;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setLoadingProgress(Math.min((currentStep / steps) * 100, 100));

      if (currentStep >= steps) {
        clearInterval(interval);
        setIsLoadingComplete(true);
      }
    }, intervalTime);

    // Preload map resources
    const resources = ['iron.png', 'wood.png', 'stone.png', 'food.png'];
    const mapBaseUrl = 'https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/map/';
    resources.forEach(res => {
      const img = new window.Image();
      img.src = `${mapBaseUrl}${res}`;
    });

    // Preload city asset
    const cityImg = new window.Image();
    cityImg.src = 'https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/UI/city.png';

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-black overflow-hidden flex flex-col items-center justify-center" suppressHydrationWarning>
      {/* Background Video */}
      {isMounted && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/video/login_video.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          // No loop, so it stops at the last frame
        />
      )}

      {/* UI Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 z-10">
        {!isLoadingComplete ? (
          <div className="w-[400px] flex flex-col items-center gap-2 animate-in fade-in duration-500">
            <span className="text-amber-100/90 text-sm font-serif tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              正在读取开唐演义
            </span>
            <div className="w-full h-2 bg-black/60 border border-amber-900/50 rounded-full overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.8)]">
              <div 
                className="h-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-all duration-75 ease-linear"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <button 
            onClick={onLogin}
            className="relative hover:scale-105 hover:brightness-110 active:scale-95 transition-all animate-in fade-in zoom-in duration-500 cursor-pointer"
          >
            <Image 
              src="https://cdn.jsdelivr.net/gh/dreamforgame-win/slg-assets@main/UI/btn_login.png" 
              alt="开始游戏" 
              width={220} 
              height={70}
              className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
              unoptimized
            />
          </button>
        )}
      </div>
    </div>
  );
}
