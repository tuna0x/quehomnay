import { enqueueAiFortune, enqueueAiChat } from '../services/aiQueueService.js';
import { logActivity } from '../services/activityService.js';

export async function generateFortuneHandler(req, res, next) {
  try {
    const { name = '', birthYear = '', question = '', topic = '', preferredLevel = 'Trung', customApiKey = '' } = req.body;
    const userId = req.user?.id || req.headers['x-user-id'] || req.body.userId || null;

    const fortune = await enqueueAiFortune({
      name,
      birthYear,
      question,
      topic,
      preferredLevel,
      customApiKey,
      userId
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
    const userId = req.user?.id || req.headers['x-user-id'] || req.body.userId || null;

    const result = await enqueueAiChat({
      messages,
      fortune,
      name,
      question,
      customApiKey,
      userId
    });

    // Record activity in background
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || req.ip;
    logActivity({
      userId,
      userName: name || null,
      actionType: 'AI_CHAT',
      details: {
        fortune: fortune?.ten_que || null,
        userQuestion: question || null,
        messagesCount: messages.length
      },
      ip
    }).catch(() => {});

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
