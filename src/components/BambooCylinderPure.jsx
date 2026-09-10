import React, { useState, useEffect, useRef, useCallback } from 'react';
import LotusCandle from './LotusCandle';
import { playShakeSound, playWoodBlockSound, ensureAudioContext } from '../utils/audio';
import { Smartphone, MousePointer, Sparkles } from 'lucide-react';

// 9 Sticks with natural fan layout
const STICKS = [
  { id: 1, cx: 132, topY: 110, height: 125, rot: -16, char: '安', delay: '-0.10s' },
  { id: 2, cx: 146, topY: 98,  height: 138, rot: -11, char: '吉', delay: '-0.22s' },
  { id: 3, cx: 161, topY: 88,  height: 148, rot: -6,  char: '福', delay: '-0.05s' },
  { id: 4, cx: 176, topY: 80,  height: 156, rot: -2,  char: '祿', delay: '-0.16s' },
  // Center chosen stick
  { id: 5, cx: 190, topY: 72,  height: 165, rot: 0,   char: '籤', delay: '-0.02s', isChosen: true },
  { id: 6, cx: 204, topY: 80,  height: 156, rot: 3,   char: '壽', delay: '-0.28s' },
  { id: 7, cx: 219, topY: 88,  height: 148, rot: 7,   char: '貴', delay: '-0.13s' },
  { id: 8, cx: 234, topY: 98,  height: 138, rot: 12,  char: '春', delay: '-0.07s' },
  { id: 9, cx: 248, topY: 110, height: 125, rot: 17,  char: '通', delay: '-0.19s' },
];

export default function BambooCylinderPure({
  isShaking,
  isStickRevealed,
  chosenFortune,
  onClick,
  disabled,
  onTriggerDraw
}) {
  const [chantPhase, setChantPhase] = useState(0);
  
  // Interactive Drag / Shake physics state
  const [isDragging, setIsDragging] = useState(false);
  const [dragAngle, setDragAngle] = useState(0);
  const [shakeEnergy, setShakeEnergy] = useState(0); // 0 to 100%
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  const lastXRef = useRef(0);
  const lastDirRef = useRef(0);
  const lastSoundTimeRef = useRef(0);
  const energyRef = useRef(0);
  const dragContainerRef = useRef(null);

  // Check if device supports motion or touch
  useEffect(() => {
    setIsMobileDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Trigger sound when shaking
  useEffect(() => {
    let soundInterval;
    let chantTimeout1, chantTimeout2;

    if (isShaking) {
      setChantPhase(1);
      playShakeSound();
      soundInterval = setInterval(() => {
        playShakeSound();
      }, 230);

      chantTimeout1 = setTimeout(() => setChantPhase(2), 750);
      chantTimeout2 = setTimeout(() => setChantPhase(3), 1500);
    } else {
      setChantPhase(0);
    }

    return () => {
      if (soundInterval) clearInterval(soundInterval);
      if (chantTimeout1) clearTimeout(chantTimeout1);
      if (chantTimeout2) clearTimeout(chantTimeout2);
    };
  }, [isShaking]);

  // Haptic feedback helper
  const triggerHaptic = (ms = 25) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch (e) {
        // ignore
      }
    }
  };

  // Add shake energy & check threshold
  const addShakeEnergy = useCallback((amount = 18) => {
    if (disabled || isShaking || isStickRevealed) return;
    
    ensureAudioContext();
    const now = Date.now();
    if (now - lastSoundTimeRef.current > 160) {
      playShakeSound();
      triggerHaptic(25);
      lastSoundTimeRef.current = now;
    }

    energyRef.current = Math.min(100, energyRef.current + amount);
    setShakeEnergy(energyRef.current);

    // If accumulated enough manual shake energy (100%), trigger draw!
    if (energyRef.current >= 100) {
      energyRef.current = 0;
      setShakeEnergy(0);
      setIsDragging(false);
      setDragAngle(0);
      onTriggerDraw?.();
    }
  }, [disabled, isShaking, isStickRevealed, onTriggerDraw]);

  // Natural decay of shake energy if user pauses
  useEffect(() => {
    const decayInterval = setInterval(() => {
      if (!isDragging && energyRef.current > 0) {
        energyRef.current = Math.max(0, energyRef.current - 12);
        setShakeEnergy(energyRef.current);
      }
    }, 200);
    return () => clearInterval(decayInterval);
  }, [isDragging]);

  // ==================================================================
  // 1. MOBILE DEVICE MOTION SHAKE DETECTION (Lắc điện thoại thật)
  // ==================================================================
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastMotionTime = 0;

    const handleDeviceMotion = (e) => {
      if (disabled || isShaking || isStickRevealed) return;

      const current = e.accelerationIncludingGravity || e.acceleration;
      if (!current) return;

      const now = Date.now();
      if (now - lastMotionTime < 90) return; // limit sampling rate

      const deltaX = Math.abs(current.x - lastX);
      const deltaY = Math.abs(current.y - lastY);
      const deltaZ = Math.abs(current.z - lastZ);

      // Shake magnitude threshold
      if ((deltaX > 15 && deltaY > 10) || deltaX > 22 || deltaY > 22) {
        lastMotionTime = now;
        addShakeEnergy(24);
      }

      lastX = current.x;
      lastY = current.y;
      lastZ = current.z;
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
    }

    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      }
    };
  }, [disabled, isShaking, isStickRevealed, addShakeEnergy]);

  // Request iOS 13+ Motion Permission on first tap
  const requestMotionPermission = async () => {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        console.debug("Device motion permission:", response);
      } catch (e) {
        // ignore
      }
    }
  };

  // ==================================================================
  // 2. MOUSE / TOUCH DRAG-TO-SHAKE (Kéo thả lắc trên máy tính & mobile)
  // ==================================================================
  const handlePointerDown = (e) => {
    if (disabled || isShaking || isStickRevealed) return;
    ensureAudioContext();
    playWoodBlockSound();
    requestMotionPermission();

    setIsDragging(true);
    lastXRef.current = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    lastDirRef.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDragging || disabled || isShaking || isStickRevealed) return;

    const currentX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const deltaX = currentX - lastXRef.current;
    
    // Tilt angle follows drag (capped at ±16deg)
    const angle = Math.max(-16, Math.min(16, deltaX * 0.4));
    setDragAngle(angle);

    const currentDir = deltaX > 0 ? 1 : deltaX < 0 ? -1 : 0;

    // If drag reverses direction rapidly -> It's a genuine shake motion!
    if (currentDir !== 0 && currentDir !== lastDirRef.current && Math.abs(deltaX) > 6) {
      lastDirRef.current = currentDir;
      addShakeEnergy(20);
    }

    lastXRef.current = currentX;
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragAngle(0);
    }
  };

  return (
    <div
      ref={dragContainerRef}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      onClick={!disabled && !isShaking && !isStickRevealed ? onClick : undefined}
      className={`relative select-none flex items-center justify-center my-1 px-2 touch-none ${
        disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {/* Left Lotus Candle */}
      <LotusCandle side="left" />

      {/* Main Altar Stage */}
      <div className="relative flex flex-col items-center justify-center mx-2 sm:mx-6">
        
        {/* Sacred Concentric Geometric Ring (Bát Quái Hào Quang) */}
        <div 
          className={`absolute top-6 w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-gold-bright/20 pointer-events-none transition-all duration-1000 ${
            isShaking 
              ? 'scale-115 border-gold-bright/70 shadow-[0_0_60px_rgba(231,201,120,0.5)] animate-mandala-fast' 
              : isStickRevealed
              ? 'scale-110 border-gold-bright/60 shadow-[0_0_50px_rgba(231,201,120,0.35)]'
              : shakeEnergy > 0
              ? 'border-gold-bright/50 scale-105'
              : 'hover:border-gold-ancient/40'
          }`}
        >
          <div className="absolute inset-3 rounded-full border border-dashed border-gold-ancient/25"></div>
          <div className="absolute inset-8 rounded-full border border-gold-ancient/20"></div>
          <div className="absolute inset-14 rounded-full border border-gold-bright/15"></div>
          
          {/* 4 Cardinal Radiant Beads */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gold-bright shadow-[0_0_10px_#E7C978]"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gold-bright shadow-[0_0_10px_#E7C978]"></div>
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gold-bright shadow-[0_0_10px_#E7C978]"></div>
          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gold-bright shadow-[0_0_10px_#E7C978]"></div>
        </div>

        {/* Ambient Halo behind cylinder */}
        <div 
          className={`absolute top-10 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isShaking || isStickRevealed
              ? 'bg-gradient-to-t from-temple-red/50 via-gold-bright/40 to-gold-ancient/30 opacity-95 scale-125'
              : shakeEnergy > 0
              ? 'bg-gradient-to-t from-temple-red/40 to-gold-ancient/25 opacity-70 scale-110'
              : 'bg-gradient-to-t from-temple-red/25 to-gold-ancient/15 opacity-50'
          }`}
        />

        {/* ============================================================== */}
        {/* UNIFIED 3D SVG CYLINDER (Cylinder, Sticks, Light Beam & Tassel)*/}
        {/* ============================================================== */}
        <div 
          style={{
            transform: isShaking 
              ? undefined 
              : `rotate(${dragAngle}deg) scale(${isDragging ? 1.03 : 1})`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className={`relative ${isShaking ? 'animate-cylinder-shake' : ''}`}
        >
          
          <svg 
            width="330" 
            height="390" 
            viewBox="0 0 380 430" 
            className="drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)] overflow-visible"
          >
            <defs>
              {/* Cylinder Lacquer Gradient */}
              <linearGradient id="lacquerBarrelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#120302" />
                <stop offset="14%" stopColor="#2D0806" />
                <stop offset="42%" stopColor="#731915" />
                <stop offset="55%" stopColor="#A82D26" />
                <stop offset="65%" stopColor="#C93B33" />
                <stop offset="78%" stopColor="#5E1411" />
                <stop offset="100%" stopColor="#140302" />
              </linearGradient>

              {/* Metallic Gold Collar Gradient */}
              <linearGradient id="goldCollarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#574116" />
                <stop offset="30%" stopColor="#C9A24A" />
                <stop offset="50%" stopColor="#FFF2B8" />
                <stop offset="70%" stopColor="#C9A24A" />
                <stop offset="100%" stopColor="#4A3610" />
              </linearGradient>

              {/* Bamboo Wood Gradients */}
              <linearGradient id="bambooGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8F6E35" />
                <stop offset="35%" stopColor="#E3C88E" />
                <stop offset="60%" stopColor="#F5E4BA" />
                <stop offset="100%" stopColor="#A68344" />
              </linearGradient>

              <linearGradient id="bambooChosenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C9A24A" />
                <stop offset="45%" stopColor="#FFF9E0" />
                <stop offset="75%" stopColor="#E7C978" />
                <stop offset="100%" stopColor="#B38D38" />
              </linearGradient>

              {/* Dipped Red Lacquer Cap */}
              <linearGradient id="stickRedCap" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#A31D1D" />
                <stop offset="60%" stopColor="#821313" />
                <stop offset="100%" stopColor="#540808" />
              </linearGradient>

              {/* Divine Celestial Light Beam */}
              <linearGradient id="divineBeamGrad" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#E7C978" stopOpacity="0.8" />
                <stop offset="30%" stopColor="#FFF2B8" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#FFD700" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FFF" stopOpacity="0" />
              </linearGradient>

              {/* Jade Pendant Gradient */}
              <linearGradient id="jadeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#064E3B" />
              </linearGradient>

              {/* Deep Interior Shadow */}
              <radialGradient id="innerHoleGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#050101" />
                <stop offset="80%" stopColor="#120302" />
                <stop offset="100%" stopColor="#3D0C08" />
              </radialGradient>
            </defs>

            {/* 1. BACK RIM & INTERIOR HOLE */}
            <ellipse cx="190" cy="180" rx="76" ry="22" fill="url(#innerHoleGrad)" stroke="#E7C978" strokeWidth="2" />

            {/* CELESTIAL BEAM OF LIGHT WHEN STICK ASCENDS */}
            {isStickRevealed && (
              <path
                d="M 140 180 L 70 -40 L 310 -40 L 240 180 Z"
                fill="url(#divineBeamGrad)"
                className="animate-light-beam pointer-events-none"
              />
            )}

            {/* 2. THE BAMBOO STICKS CLUSTER */}
            <g id="bamboo-sticks-layer">
              {STICKS.map((stick) => {
                const isTarget = stick.isChosen;
                const isRevealedTarget = isStickRevealed && isTarget;
                
                let bounceAnim = '';
                if (isShaking || shakeEnergy > 0) {
                  bounceAnim = stick.id % 3 === 0 ? 'animate-stick-a' : stick.id % 2 === 0 ? 'animate-stick-b' : 'animate-stick-c';
                }

                const chosenAnim = isRevealedTarget ? 'animate-chosen-ascend' : '';

                return (
                  <g
                    key={stick.id}
                    className={`${bounceAnim} ${chosenAnim}`}
                    style={{
                      transformOrigin: `${stick.cx}px 200px`,
                      animationDelay: isShaking ? stick.delay : '0s',
                    }}
                  >
                    <g transform={`rotate(${stick.rot} ${stick.cx} 200)`}>
                      {/* Stick Drop Shadow */}
                      <rect
                        x={stick.cx - 7.5}
                        y={stick.topY}
                        width="15"
                        height={stick.height}
                        rx="3"
                        fill="rgba(0,0,0,0.45)"
                        transform="translate(2, 2)"
                      />

                      {/* Main Bamboo Stalk */}
                      <rect
                        x={stick.cx - 7.5}
                        y={stick.topY}
                        width="15"
                        height={stick.height}
                        rx="3"
                        fill={isRevealedTarget ? "url(#bambooChosenGrad)" : "url(#bambooGrad)"}
                        stroke="#6B5226"
                        strokeWidth="0.8"
                      />

                      {/* Dipped Red Lacquer Cap */}
                      <rect
                        x={stick.cx - 7.5}
                        y={stick.topY}
                        width="15"
                        height="22"
                        rx="3"
                        fill="url(#stickRedCap)"
                        stroke="#450A0A"
                        strokeWidth="0.8"
                      />

                      {/* Blessing Character on Stick */}
                      <text
                        x={stick.cx}
                        y={stick.topY + 15}
                        textAnchor="middle"
                        fill="#FEF08A"
                        fontFamily="Noto Serif, serif"
                        fontWeight="900"
                        fontSize="10"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                      >
                        {stick.char}
                      </text>

                      {/* Bamboo Joint Ring 1 */}
                      <line
                        x1={stick.cx - 7}
                        y1={stick.topY + 46}
                        x2={stick.cx + 7}
                        y2={stick.topY + 46}
                        stroke="#5A411B"
                        strokeWidth="1.2"
                      />
                      <line
                        x1={stick.cx - 7}
                        y1={stick.topY + 47}
                        x2={stick.cx + 7}
                        y2={stick.topY + 47}
                        stroke="#FFF2B8"
                        strokeWidth="0.6"
                        opacity="0.8"
                      />

                      {/* Bamboo Joint Ring 2 */}
                      <line
                        x1={stick.cx - 7}
                        y1={stick.topY + 84}
                        x2={stick.cx + 7}
                        y2={stick.topY + 84}
                        stroke="#5A411B"
                        strokeWidth="1.2"
                      />

                      {/* Stick ID Number */}
                      <text
                        x={stick.cx}
                        y={stick.topY + 70}
                        textAnchor="middle"
                        fill="#543D15"
                        fontFamily="Noto Serif, serif"
                        fontWeight="700"
                        fontSize="7"
                      >
                        {stick.id}
                      </text>

                      {/* Special Divine Gleam on Chosen Stick */}
                      {isRevealedTarget && (
                        <rect
                          x={stick.cx - 7.5}
                          y={stick.topY}
                          width="15"
                          height={stick.height}
                          rx="3"
                          fill="url(#goldCollarGrad)"
                          opacity="0.3"
                        />
                      )}
                    </g>
                  </g>
                );
              })}
            </g>

            {/* 3. FRONT CYLINDER BARREL (Strictly covers stick bottoms) */}
            <g id="cylinder-front-body">
              {/* Main Lacquer Body */}
              <path
                d="M 114 180 
                   C 114 195, 148 202, 190 202 
                   C 232 202, 266 195, 266 180 
                   L 266 350 
                   C 266 366, 232 374, 190 374 
                   C 148 374, 114 366, 114 350 
                   Z"
                fill="url(#lacquerBarrelGrad)"
                stroke="#6B5226"
                strokeWidth="1.5"
              />

              {/* Specular Curved Highlight on Lacquer */}
              <path
                d="M 155 198 L 155 368 L 175 372 L 175 201 Z"
                fill="white"
                opacity="0.09"
              />

              {/* Front Lip Gold Rim Accent */}
              <path
                d="M 114 180 C 114 194, 148 202, 190 202 C 232 202, 266 194, 266 180"
                fill="none"
                stroke="#FFF2B8"
                strokeWidth="2.5"
              />

              {/* Upper Gold Collar with Rivet Studs */}
              <path
                d="M 114 196 
                   C 114 209, 148 217, 190 217 
                   C 232 217, 266 209, 266 196 
                   L 266 209 
                   C 266 222, 232 230, 190 230 
                   C 148 230, 114 222, 114 209 
                   Z"
                fill="url(#goldCollarGrad)"
                stroke="#3E2E0A"
                strokeWidth="1"
              />
              <circle cx="140" cy="211" r="2" fill="#200504" stroke="#FFEBA8" strokeWidth="0.8" />
              <circle cx="170" cy="217" r="2" fill="#200504" stroke="#FFEBA8" strokeWidth="0.8" />
              <circle cx="210" cy="217" r="2" fill="#200504" stroke="#FFEBA8" strokeWidth="0.8" />
              <circle cx="240" cy="211" r="2" fill="#200504" stroke="#FFEBA8" strokeWidth="0.8" />

              {/* Lotus Floral Motif SVG above plaque */}
              <g transform="translate(160, 236) scale(0.6)">
                <path d="M50 8 C42 22, 30 28, 15 35 C32 36, 44 26, 50 8 Z" fill="#E7C978" />
                <path d="M50 8 C58 22, 70 28, 85 35 C68 36, 56 26, 50 8 Z" fill="#E7C978" />
                <path d="M50 2 C44 18, 40 32, 50 42 C60 32, 56 18, 50 2 Z" fill="#FFF1C5" />
                <circle cx="50" cy="22" r="3.5" fill="#C9A24A" />
              </g>

              {/* Central Diamond Calligraphy Plaque */}
              <g transform="translate(190, 280)">
                <rect
                  x="-25"
                  y="-25"
                  width="50"
                  height="50"
                  transform="rotate(45)"
                  fill="#2A0705"
                  stroke="#E7C978"
                  strokeWidth="2"
                />
                <rect
                  x="-20"
                  y="-20"
                  width="40"
                  height="40"
                  transform="rotate(45)"
                  fill="none"
                  stroke="#C9A24A"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x="0"
                  y="-3"
                  textAnchor="middle"
                  fill="#FFF2B8"
                  fontFamily="Noto Serif, serif"
                  fontWeight="900"
                  fontSize="13"
                >
                  靈
                </text>
                <text
                  x="0"
                  y="12"
                  textAnchor="middle"
                  fill="#E7C978"
                  fontFamily="Noto Serif, serif"
                  fontWeight="900"
                  fontSize="13"
                >
                  籤
                </text>
              </g>

              {/* Plaque Title Slogan */}
              <text
                x="190"
                y="325"
                textAnchor="middle"
                fill="#E7C978"
                fontFamily="Noto Serif, serif"
                fontWeight="900"
                fontSize="9"
                letterSpacing="3"
              >
                LINH THIÊM
              </text>

              {/* Lower Gold Collar */}
              <path
                d="M 114 340 
                   C 114 353, 148 361, 190 361 
                   C 232 361, 266 353, 266 340 
                   L 266 350 
                   C 266 363, 232 371, 190 371 
                   C 148 371, 114 363, 114 350 
                   Z"
                fill="url(#goldCollarGrad)"
                stroke="#3E2E0A"
                strokeWidth="1"
              />

              {/* 4. BASE LOTUS PEDESTAL */}
              <path
                d="M 106 352 
                   C 106 368, 144 378, 190 378 
                   C 236 378, 274 368, 274 352 
                   L 278 372 
                   C 278 388, 238 398, 190 398 
                   C 142 398, 102 388, 102 372 
                   Z"
                fill="#2E0806"
                stroke="#C9A24A"
                strokeWidth="1.5"
              />
              <path
                d="M 102 372 C 102 388, 142 398, 190 398 C 238 398, 278 388, 278 372"
                fill="none"
                stroke="#FFF2B8"
                strokeWidth="1"
              />
            </g>

            {/* 5. SWINGING SILK TASSEL WITH BELL & JADE */}
            <g 
              id="silk-tassel-assembly"
              className={isShaking || isDragging ? 'animate-tassel-swing' : ''}
              style={{ transformOrigin: '266px 190px' }}
            >
              <circle cx="266" cy="190" r="4" fill="#6E1B1B" stroke="#E7C978" strokeWidth="2" />
              <path d="M 266 194 Q 268 208, 266 222" stroke="#DC2626" strokeWidth="2.5" fill="none" />
              <circle cx="266" cy="226" r="6" fill="url(#jadeGrad)" stroke="#6EE7B7" strokeWidth="1" />
              <circle cx="266" cy="226" r="2" fill="#1A0503" />
              <path d="M 262 234 L 270 234 L 271 242 L 261 242 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="0.8" />
              <circle cx="266" cy="243" r="1.5" fill="#78350F" />
              <path d="M 261 244 L 261 285 M 263.5 244 L 263.5 287 M 266 244 L 266 290 M 268.5 244 L 268.5 287 M 271 244 L 271 285" stroke="#B91C1C" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          </svg>

          {/* Floating Sacred Title Badge over Chosen Stick */}
          {isStickRevealed && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#8B1E1E] via-[#C9A24A] to-[#8B1E1E] border-2 border-gold-bright text-xs font-serif font-black text-paper-light whitespace-nowrap shadow-gold-glow flex items-center gap-2 animate-bounce z-50">
              <span className="text-gold-bright">✦</span>
              <span>{chosenFortune?.ten_que} [{chosenFortune?.muc}]</span>
              <span className="text-gold-bright">✦</span>
            </div>
          )}

        </div>

        {/* Dynamic Ritual Hint / Real-Time Chanting Status & Manual Shake Gauge */}
        <div className="mt-3 text-center relative z-10 min-h-[36px] flex flex-col items-center justify-center">
          {isShaking ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-temple-red/90 border border-gold-bright shadow-gold-glow animate-pulse">
              <span className="w-2 h-2 rounded-full bg-gold-bright animate-ping"></span>
              <span className="text-xs font-serif font-bold text-gold-bright tracking-wider">
                {chantPhase === 1 && "✦ Khởi tâm thành kính... Lắc xăm ✦"}
                {chantPhase === 2 && "✦ Khí vận giao hòa... Thẻ chuyển ✦"}
                {chantPhase === 3 && "✦ Thánh quẻ xuất linh! ✦"}
              </span>
            </div>
          ) : isStickRevealed ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-ancient/30 border border-gold-bright shadow-gold-glow animate-pulse">
              <span className="text-xs font-serif font-bold text-gold-bright">
                ✦ Thẻ xăm đã giáng thế! Chạm bên dưới để mở quẻ ✦
              </span>
            </div>
          ) : shakeEnergy > 0 ? (
            /* Interactive Shake Energy Bar during drag/phone shake */
            <div className="flex flex-col items-center gap-1 animate-pulse">
              <div className="flex items-center gap-2 text-xs font-serif text-gold-bright font-bold">
                <Sparkles size={14} className="text-gold-bright animate-spin" />
                <span>Khí vận tích tụ: {shakeEnergy}% (Lắc tiếp để xuất quẻ!)</span>
              </div>
              <div className="w-48 h-2 rounded-full bg-[#200504] border border-gold-bright/40 overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-temple-red via-gold-ancient to-gold-bright transition-all duration-150"
                  style={{ width: `${shakeEnergy}%` }}
                />
              </div>
            </div>
          ) : (
            /* Default Interactive Guide Pill */
            <div className="flex flex-col items-center gap-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#200504]/95 border border-gold-ancient/50 hover:border-gold-bright transition shadow-md">
                {isMobileDevice ? (
                  <Smartphone size={13} className="text-gold-bright animate-bounce" />
                ) : (
                  <MousePointer size={13} className="text-gold-bright animate-bounce" />
                )}
                <span className="text-xs text-gold-bright font-serif font-bold tracking-wider">
                  {isMobileDevice 
                    ? "Lắc điện thoại hoặc vuốt ống xăm để gieo quẻ" 
                    : "Kéo chuột lắc ống xăm hoặc bấm nút để gieo quẻ"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gold-muted/70 font-serif mt-0.5">
                <span>Cảm ứng cử động vật lý & Rung phản hồi</span>
                <span>•</span>
                <span className="text-gold-bright/80 font-medium">128.450+ lượt đã gieo</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Right Lotus Candle */}
      <LotusCandle side="right" />

    </div>
  );
}
