// High-fidelity Web Audio API Sound Synthesizer for Vietnamese Temple Ritual
// Realistic acoustic synthesis: Bamboo sticks clattering, Temple bronze bell, Wooden fish (Mõ), Seal stamp impact
// PLUS: Zen Ambient Meditation Soundscape (Wind Chimes, Bamboo Water Drops, Meditative Drone)
// 100% Native Web Audio, zero external assets, zero lag, bypasses autoplay restrictions

import { getSoundSetting } from './preferences';

let audioCtx = null;

// Ambient meditation state
let ambientState = {
  isPlaying: false,
  masterGain: null,
  droneOsc: null,
  droneGain: null,
  lfoOsc: null,
  chimeTimer: null,
  waterTimer: null
};

// Initialize or resume audio context on direct user interaction
export function ensureAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// ====================================================================
// 1. ZEN AMBIENT SOUND ENGINE (Chuông gió phong linh & Nhạc thiền tĩnh tâm)
// ====================================================================

// Pentatonic Zen Chime frequencies (Hz)
const ZEN_CHIME_FREQS = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];

function triggerWindChime(ctx, destination) {
  if (!ambientState.isPlaying) return;
  try {
    const now = ctx.currentTime;
    // Pick 1 or 2 random chimes
    const chimeCount = Math.random() > 0.6 ? 2 : 1;
    
    for (let c = 0; c < chimeCount; c++) {
      const delay = c * (0.15 + Math.random() * 0.2);
      const strikeTime = now + delay;
      const freq = ZEN_CHIME_FREQS[Math.floor(Math.random() * ZEN_CHIME_FREQS.length)];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Crystalline bell/wind chime overtone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, strikeTime);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, strikeTime);
      filter.Q.setValueAtTime(10, strikeTime);

      // Sweet long decay
      gain.gain.setValueAtTime(0.001, strikeTime);
      gain.gain.linearRampToValueAtTime(0.12 + Math.random() * 0.08, strikeTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 3.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(strikeTime);
      osc.stop(strikeTime + 3.3);
    }
  } catch (e) {
    console.debug("Chime error:", e);
  }
}

function triggerWaterDrop(ctx, destination) {
  if (!ambientState.isPlaying) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = 800 + Math.random() * 600;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq + 500, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    console.debug("Water drop error:", e);
  }
}

export function startAmbientSound() {
  try {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    if (ambientState.isPlaying) return;

    // Master Ambient Gain Node
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    // Gentle 2.5s fade-in
    masterGain.gain.linearRampToValueAtTime(0.65, ctx.currentTime + 2.5);
    masterGain.connect(ctx.destination);

    // Warm Meditative Drone (216Hz OM fundamental)
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    const droneFilter = ctx.createBiquadFilter();

    droneOsc.type = 'triangle';
    droneOsc.frequency.setValueAtTime(216, ctx.currentTime);

    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(320, ctx.currentTime);

    droneGain.gain.setValueAtTime(0.05, ctx.currentTime);

    droneOsc.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(masterGain);
    droneOsc.start();

    // Slow Breathing LFO on Drone filter (every 8 seconds)
    const lfoOsc = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfoOsc.frequency.setValueAtTime(0.12, ctx.currentTime);
    lfoGain.gain.setValueAtTime(80, ctx.currentTime);
    lfoOsc.connect(droneFilter.frequency);
    lfoOsc.start();

    ambientState = {
      isPlaying: true,
      masterGain,
      droneOsc,
      droneGain,
      lfoOsc,
      chimeTimer: null,
      waterTimer: null
    };

    // Schedule Wind Chimes every 2.8 - 4.5 seconds
    const scheduleNextChime = () => {
      if (!ambientState.isPlaying) return;
      triggerWindChime(ctx, masterGain);
      const nextDelay = 2600 + Math.random() * 2200;
      ambientState.chimeTimer = setTimeout(scheduleNextChime, nextDelay);
    };
    scheduleNextChime();

    // Schedule Soft Water Droplets every 4 - 7 seconds
    const scheduleNextWater = () => {
      if (!ambientState.isPlaying) return;
      triggerWaterDrop(ctx, masterGain);
      const nextDelay = 3800 + Math.random() * 3200;
      ambientState.waterTimer = setTimeout(scheduleNextWater, nextDelay);
    };
    scheduleNextWater();

  } catch (e) {
    console.debug("Start ambient failed:", e);
  }
}

export function stopAmbientSound() {
  if (!ambientState.isPlaying) return;
  try {
    const ctx = ensureAudioContext();
    if (ambientState.masterGain && ctx) {
      // Gentle 1.5s fade-out
      ambientState.masterGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      setTimeout(() => {
        try {
          ambientState.droneOsc?.stop();
          ambientState.lfoOsc?.stop();
        } catch (err) {
          // ignore
        }
      }, 1600);
    }
    clearTimeout(ambientState.chimeTimer);
    clearTimeout(ambientState.waterTimer);
  } catch (e) {
    console.debug("Stop ambient failed:", e);
  } finally {
    ambientState.isPlaying = false;
  }
}

export function isAmbientPlaying() {
  return ambientState.isPlaying;
}

// ====================================================================
// 2. RITUAL SOUND EFFECTS (Mõ, Lắc xăm tre, Thẻ tre lướt, Chuông đồng trầm ấm, Đóng triện)
// ====================================================================

// Tiếng gõ mõ gỗ thanh tịnh mộc mạc (Wooden fish click - ấm, không chói)
export function playWoodBlockSound() {
  if (!getSoundSetting()) return;
  try {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Mộc mạc, lọc dải trung trầm để tiếng mõ rỗng và ấm
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(620, now);
    filter.Q.setValueAtTime(3.5, now);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.09);

    // Soft 4ms attack curve để tránh digital click
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.32, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  } catch (e) {
    console.debug("Audio error:", e);
  }
}

// Tiếng lắc thẻ xăm tre va vào ống gỗ (Shaking sticks - êm dịu, mộc mạc, không đanh gắt)
export function playShakeSound() {
  if (!getSoundSetting()) return;
  try {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // A. Độ vang trầm của lòng ống gỗ sơn mài (Hollow wood resonance)
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(125 + Math.random() * 25, now);
    
    bodyGain.gain.setValueAtTime(0.001, now);
    bodyGain.gain.linearRampToValueAtTime(0.2, now + 0.006);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    
    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.1);

    // B. Tiếng các thẻ tre cọ xát lách cách (Bamboo slips friction)
    // Lọc dải tần 450Hz - 900Hz để tiếng tre ấm, tuyệt đối không bị đinh tai
    const numClicks = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numClicks; i++) {
      const clickDelay = i * 0.032 + (Math.random() * 0.018);
      const clickTime = now + clickDelay;

      const bufferSize = Math.floor(ctx.sampleRate * 0.025);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        output[j] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500 + Math.random() * 400, clickTime);
      filter.Q.setValueAtTime(4, clickTime);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.001, clickTime);
      clickGain.gain.linearRampToValueAtTime(0.18, clickTime + 0.003);
      clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.025);

      whiteNoise.connect(filter);
      filter.connect(clickGain);
      clickGain.connect(ctx.destination);

      whiteNoise.start(clickTime);
    }
  } catch (e) {
    console.debug("Audio error:", e);
  }
}

// Tiếng thẻ tre trượt êm ái nhô lên khỏi bó (Thay thế hoàn toàn tiếng còi réo 1180Hz)
export function playStickAscendSound() {
  if (!getSoundSetting()) return;
  try {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Tiếng cọ lụa/tre trượt nhẹ (Soft wooden sliding whoosh)
    const bufferSize = Math.floor(ctx.sampleRate * 0.35);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let j = 0; j < bufferSize; j++) {
      output[j] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(420, now);
    noiseFilter.frequency.linearRampToValueAtTime(680, now + 0.28);
    noiseFilter.Q.setValueAtTime(3.0, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.14, now + 0.08);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // 2. Âm nền trầm ấm nâng đỡ cảm xúc (Mellow wooden tone)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(260, now + 0.3);

    oscGain.gain.setValueAtTime(0.001, now);
    oscGain.gain.linearRampToValueAtTime(0.12, now + 0.06);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);

  } catch (e) {
    console.debug("Audio error:", e);
  }
}

// Tiếng Đại Hồng Chung / Chuông Đồng Trầm Tĩnh (Hoàn toàn KHÔNG có tiếng ting đanh gắt)
// Tần số trầm ấm (144Hz - 288Hz - 432Hz), soft attack 30ms triệt tiêu click transient
export function playBellSound() {
  if (!getSoundSetting()) return;
  try {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Bộ lọc Lowpass tổng quát cắt gọt toàn bộ tần số trên 600Hz để giữ âm sắc ấm áp, tĩnh mịch
    const masterBellFilter = ctx.createBiquadFilter();
    masterBellFilter.type = 'lowpass';
    masterBellFilter.frequency.setValueAtTime(580, now);
    masterBellFilter.Q.setValueAtTime(1.2, now);

    const masterBellGain = ctx.createGain();
    masterBellGain.gain.setValueAtTime(1.0, now);
    masterBellFilter.connect(masterBellGain);
    masterBellGain.connect(ctx.destination);

    // Hài âm chuông đồng trầm tĩnh cổ kính
    const harmonics = [
      { freq: 144, gain: 0.35, decay: 4.5 }, // Âm nền sâu lắng (Fundamental baritone)
      { freq: 288, gain: 0.20, decay: 3.8 }, // Quãng tám êm dịu
      { freq: 432, gain: 0.08, decay: 3.0 }, // Tần số hòa âm thiền an lạc
      { freq: 516, gain: 0.03, decay: 2.2 }, // Âm sắc đồng nhẹ
    ];

    harmonics.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Soft attack ramp (30ms) -> KHÔNG BAO GIỜ bị tiếng "ting" giật mình hay click transient!
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(gain, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gainNode);
      gainNode.connect(masterBellFilter);

      osc.start(now);
      osc.stop(now + decay + 0.1);
    });
  } catch (e) {
    console.debug("Audio error:", e);
  }
}

// Tiếng dập triện son đỏ "Cộp" đầm chắc, tôn nghiêm
export function playSealStampSound() {
  if (!getSoundSetting()) return;
  try {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.08);

    // Soft attack tránh transient click
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.38, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  } catch (e) {
    console.debug("Audio error:", e);
  }
}

// Tiếng mở cuộn giấy lụa êm ái (Parchment unfurl)
export function playScrollUnrollSound() {
  if (!getSoundSetting()) return;
  try {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = Math.floor(ctx.sampleRate * 0.25);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let j = 0; j < bufferSize; j++) {
      output[j] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(550, now);
    filter.frequency.linearRampToValueAtTime(750, now + 0.22);
    filter.Q.setValueAtTime(2.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  } catch (e) {
    console.debug("Audio error:", e);
  }
}
