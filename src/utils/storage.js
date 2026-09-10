// Storage utility for Que Hom Nay
const STORAGE_KEYS = {
  LAST_DRAW_DATE: 'qhn_last_draw_date',
  TODAY_FORTUNE: 'qhn_today_fortune',
  HISTORY: 'qhn_draw_history',
  GEMINI_API_KEY: 'qhn_gemini_api_key',
  SOUND_ENABLED: 'qhn_sound_enabled',
  AMBIENT_ENABLED: 'qhn_ambient_enabled',
  EXTRA_DRAWS: 'qhn_extra_draws',
  EXTRA_DRAWS_DATE: 'qhn_extra_draws_date',
  INVITE_COUNT: 'qhn_invite_count'
};

// Format date string YYYY-MM-DD
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate remaining time until midnight (00:00)
export function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight - now;
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds, diffMs };
}

// Get extra bonus draws for today
export function getExtraDraws() {
  try {
    const today = getTodayDateString();
    const date = localStorage.getItem(STORAGE_KEYS.EXTRA_DRAWS_DATE);
    if (date !== today) {
      // Reset on new day
      localStorage.setItem(STORAGE_KEYS.EXTRA_DRAWS_DATE, today);
      localStorage.setItem(STORAGE_KEYS.EXTRA_DRAWS, '0');
      return 0;
    }
    const val = localStorage.getItem(STORAGE_KEYS.EXTRA_DRAWS);
    return val ? parseInt(val, 10) : 0;
  } catch (e) {
    return 0;
  }
}

// Check comprehensive draw status (free draw + extra draws from invite)
export function checkCanDrawToday() {
  try {
    const today = getTodayDateString();
    const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_DRAW_DATE);
    const todayFortuneRaw = localStorage.getItem(STORAGE_KEYS.TODAY_FORTUNE);
    const extraDraws = getExtraDraws();

    const freeDrawUsed = lastDate === today;
    const canDraw = !freeDrawUsed || extraDraws > 0;
    const remainingDraws = (freeDrawUsed ? 0 : 1) + extraDraws;

    return {
      canDraw,
      freeDrawUsed,
      extraDraws,
      remainingDraws,
      fortune: todayFortuneRaw ? JSON.parse(todayFortuneRaw) : null,
      remainingTime: getTimeUntilMidnight()
    };
  } catch (e) {
    console.error("Storage read error:", e);
    return { 
      canDraw: true, 
      freeDrawUsed: false, 
      extraDraws: 0, 
      remainingDraws: 1, 
      fortune: null, 
      remainingTime: getTimeUntilMidnight() 
    };
  }
}

// Save fortune drawn today & consume 1 draw
export function recordDrawToday(fortune) {
  try {
    const today = getTodayDateString();
    const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_DRAW_DATE);
    const extraDraws = getExtraDraws();

    if (lastDate !== today) {
      // Used today's free draw
      localStorage.setItem(STORAGE_KEYS.LAST_DRAW_DATE, today);
    } else if (extraDraws > 0) {
      // Consumed 1 extra draw from invite bonus
      localStorage.setItem(STORAGE_KEYS.EXTRA_DRAWS, String(extraDraws - 1));
    }

    localStorage.setItem(STORAGE_KEYS.TODAY_FORTUNE, JSON.stringify(fortune));

    // Add to history
    const history = getDrawHistory();
    const updatedHistory = [{ ...fortune, drawDate: today, timestamp: Date.now() }, ...history.filter(h => h.timestamp !== fortune.timestamp)].slice(0, 20);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error("Error saving fortune:", e);
  }
}

// Grant +1 extra draw when user shares/invites a friend
export function grantInviteBonus() {
  try {
    const today = getTodayDateString();
    const currentExtra = getExtraDraws();
    const newExtra = currentExtra + 1;
    localStorage.setItem(STORAGE_KEYS.EXTRA_DRAWS_DATE, today);
    localStorage.setItem(STORAGE_KEYS.EXTRA_DRAWS, String(newExtra));

    // Increment total invite counter
    const currentInvites = parseInt(localStorage.getItem(STORAGE_KEYS.INVITE_COUNT) || '0', 10);
    localStorage.setItem(STORAGE_KEYS.INVITE_COUNT, String(currentInvites + 1));

    return newExtra;
  } catch (e) {
    console.error("Error granting invite bonus:", e);
    return 0;
  }
}

// Get past fortunes
export function getDrawHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Dev / test mode reset
export function resetDailyLimit() {
  try {
    localStorage.removeItem(STORAGE_KEYS.LAST_DRAW_DATE);
    localStorage.removeItem(STORAGE_KEYS.TODAY_FORTUNE);
    localStorage.removeItem(STORAGE_KEYS.EXTRA_DRAWS);
    localStorage.removeItem(STORAGE_KEYS.EXTRA_DRAWS_DATE);
  } catch (e) {
    console.error("Reset error:", e);
  }
}

// API Key management
export function getSavedApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '';
  } catch (e) {
    return import.meta.env.VITE_GEMINI_API_KEY || '';
  }
}

export function saveApiKey(key) {
  try {
    if (!key) {
      localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
    } else {
      localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key.trim());
    }
  } catch (e) {
    console.error("Error saving API key:", e);
  }
}

// Sound effects preference
export function getSoundSetting() {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return val !== null ? val === 'true' : true;
  } catch (e) {
    return true;
  }
}

export function saveSoundSetting(enabled) {
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
  } catch (e) {
    console.error("Error saving sound setting:", e);
  }
}

// Ambient meditation music preference
export function getAmbientSetting() {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.AMBIENT_ENABLED);
    return val === 'true';
  } catch (e) {
    return false;
  }
}

export function saveAmbientSetting(enabled) {
  try {
    localStorage.setItem(STORAGE_KEYS.AMBIENT_ENABLED, String(enabled));
  } catch (e) {
    console.error("Error saving ambient setting:", e);
  }
}
