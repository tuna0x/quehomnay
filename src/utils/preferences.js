// User local device preferences (sound, ambient, Gemini key)
const STORAGE_KEYS = {
  GEMINI_API_KEY: 'qhn_gemini_api_key',
  SOUND_ENABLED: 'qhn_sound_enabled',
  AMBIENT_ENABLED: 'qhn_ambient_enabled',
};

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
