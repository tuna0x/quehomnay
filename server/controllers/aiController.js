import { generateFortuneWithLuna, chatWithLuna } from '../services/aiService.js';

export async function generateFortuneHandler(req, res, next) {
  try {
    const { name = '', birthYear = '', question = '', topic = '', preferredLevel = 'Trung', customApiKey = '' } = req.body;
    const fortune = await generateFortuneWithLuna({
      name,
      birthYear,
      question,
      topic,
      preferredLevel,
      customApiKey
    });

    res.json({
      success: true,
      fortune
    });
  } catch (error) {
    next(error);
  }
}

export async function chatLunaHandler(req, res, next) {
  try {
    const { messages = [], fortune = null, name = '', question = '', customApiKey = '' } = req.body;
    const result = await chatWithLuna({
      messages,
      fortune,
      name,
      question,
      customApiKey
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getStatusHandler(req, res, next) {
  try {
    const hasKey = Boolean(process.env.EXPERIENTIAL_API_KEY);
    const model = process.env.EXPERIENTIAL_MODEL || 'gpt-5.6-luna';
    const base = process.env.EXPERIENTIAL_API_BASE || 'https://api.experientiallabs.ai/v1';

    res.json({
      configured: hasKey,
      model,
      provider: 'Experiential Labs AI',
      endpoint: `${base}/chat/completions`,
      requiresVerification: 'A one-time $1 charge verifies you and unlocks free/promo models'
    });
  } catch (error) {
    next(error);
  }
}
