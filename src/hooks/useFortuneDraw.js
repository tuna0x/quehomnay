import { useState, useCallback } from 'react';
import { drawApi, generateFortune } from '../api';
import { 
  ensureAudioContext, 
  playWoodBlockSound, 
  playStickAscendSound, 
  playBellSound 
} from '../utils/audio';

export function useFortuneDraw({ onDrawSuccess }) {
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('Công việc & Sự nghiệp');
  const [isShaking, setIsShaking] = useState(false);
  
  // Ritual step states: 'IDLE' | 'SHAKING' | 'STICK_REVEALED' | 'CARD_UNROLLED'
  const [ritualState, setRitualState] = useState('IDLE');
  const [fortune, setFortune] = useState(null);

  const startDraw = useCallback(async () => {
    if (isShaking) return;

    ensureAudioContext();
    playWoodBlockSound();

    setIsShaking(true);
    setRitualState('SHAKING');
    setFortune(null);

    try {
      const fortunePromise = generateFortune({ name, birthYear, question, topic });
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 2300));

      const [result] = await Promise.all([fortunePromise, delayPromise]);

      // Attach client-submitted info if missing
      if (birthYear && !result.birthYear) result.birthYear = birthYear;
      if (topic && !result.topic) result.topic = topic;

      // Save to PostgreSQL via drawApi
      await drawApi.recordDraw({ fortune: result, name, birthYear, question, topic });

      setFortune(result);
      setIsShaking(false);
      setRitualState('STICK_REVEALED');

      playStickAscendSound();
      setTimeout(() => {
        playBellSound();
      }, 350);

      if (onDrawSuccess) {
        onDrawSuccess(result);
      }
    } catch (err) {
      console.error('[useFortuneDraw] Error drawing fortune:', err);
      setIsShaking(false);
      setRitualState('IDLE');
    }
  }, [isShaking, name, birthYear, question, topic, onDrawSuccess]);

  const openScroll = useCallback(() => {
    ensureAudioContext();
    setRitualState('CARD_UNROLLED');
  }, []);

  const resetRitual = useCallback(() => {
    setIsShaking(false);
    setRitualState('IDLE');
    setFortune(null);
  }, []);

  return {
    name,
    setName,
    birthYear,
    setBirthYear,
    question,
    setQuestion,
    topic,
    setTopic,
    isShaking,
    ritualState,
    setRitualState,
    fortune,
    setFortune,
    startDraw,
    openScroll,
    resetRitual
  };
}
