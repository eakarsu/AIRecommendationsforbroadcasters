require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

// 3-strategy JSON parser
function parseAIJson(text) {
  if (!text) return null;
  // Strategy 1: direct parse
  try { return JSON.parse(text); } catch (_) {}
  // Strategy 2: extract JSON code block
  const blockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (blockMatch) { try { return JSON.parse(blockMatch[1]); } catch (_) {} }
  // Strategy 3: find first { } pair
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch (_) {}
  }
  return null;
}

async function callOpenRouter(messages, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = options.model || process.env.OPENROUTER_MODEL;
  const baseUrl = String(process.env.OPENROUTER_BASE_URL || '').replace(/\/$/, '');

  if (!apiKey || !model || !baseUrl || apiKey === 'your-openrouter-key-here') throw new Error('OpenRouter runtime configuration is required');

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
      'X-Title': 'BroadcastAI'
    },
    body: JSON.stringify({
    model,
    messages,
    max_tokens: options.maxTokens || 2048,
    temperature: options.temperature || 0.7,
    response_format: options.json ? { type: 'json_object' } : undefined
    })
  });
  if (!response.ok) throw new Error(`OpenRouter request failed with HTTP ${response.status}`);
  const parsed = await response.json();
  if (parsed.error) throw new Error(parsed.error.message || 'OpenRouter API error');
  const content = String(parsed.choices?.[0]?.message?.content || '').trim();
  if (!content) throw new Error('OpenRouter returned empty content');
  const jsonData = parseAIJson(content);
  return { success: true, data: jsonData || content, rawData: content, model: parsed.model || model, usage: parsed.usage };
}

// Rate limiter: 20 req/hour per user/IP
const rateCounts = new Map();
function aiRateLimiter(req, res, next) {
  const key = req.user?.id ? `uid:${req.user.id}` : `ip:${req.ip}`;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const max = 20;
  const record = rateCounts.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) { record.count = 0; record.resetAt = now + windowMs; }
  record.count++;
  rateCounts.set(key, record);
  res.setHeader('X-RateLimit-Limit', max);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
  if (record.count > max) {
    return res.status(429).json({ error: 'Too many AI requests. Limit is 20/hour.', retryAfter: Math.ceil((record.resetAt - now) / 1000) });
  }
  next();
}

function generateMockResponse(messages, options) {
  const lastMessage = messages[messages.length - 1]?.content || '';

  if (lastMessage.includes('recommend')) {
    return {
      title: 'AI Recommendations',
      sections: [
        { heading: 'Personalized Picks', items: [
          { name: 'The Crown Season 6', confidence: 95, reason: 'Based on your interest in British drama and historical content' },
          { name: 'Premier League Live', confidence: 90, reason: 'You frequently watch live sports on weekends' },
          { name: 'Planet Earth III', confidence: 87, reason: 'Documentary lovers who enjoy nature content rated this highly' }
        ]},
        { heading: 'Because You Watched Drama', items: [
          { name: 'Succession', confidence: 88, reason: 'Similar themes of power and family dynamics' },
          { name: 'EastEnders Special', confidence: 82, reason: 'Top soap opera matching your viewing pattern' }
        ]}
      ],
      summary: 'Based on your viewing history and preferences, we recommend a mix of premium drama, live sports, and documentary content to maximize engagement.'
    };
  }

  if (lastMessage.includes('enrich')) {
    return {
      title: 'Content Enrichment',
      genreTags: ['Drama', 'Thriller', 'Crime'],
      targetAudience: 'Adults 25-54',
      contentAdvisory: 'TV-MA',
      summary: 'AI enrichment complete with genre, audience, and advisory data.'
    };
  }

  if (lastMessage.includes('schedule') || lastMessage.includes('optimize')) {
    return {
      title: 'Schedule Optimization',
      sections: [
        { heading: 'Suggested Changes', items: [
          { slot: 'Monday 8PM', current: 'Reality Show', suggested: 'Crime Drama', lift: '+18% predicted viewership' },
          { slot: 'Saturday 3PM', current: 'Repeat Movie', suggested: 'Live Sports Pre-Show', lift: '+25% predicted viewership' },
          { slot: 'Wednesday 9PM', current: 'Documentary', suggested: 'Soap Opera Special', lift: '+15% predicted viewership' }
        ]}
      ],
      summary: 'Optimizing your schedule could increase overall engagement by approximately 15-20%.'
    };
  }

  if (lastMessage.includes('trend')) {
    return {
      title: 'Trend Analysis',
      sections: [
        { heading: 'Rising Trends', items: [
          { name: 'True Crime Documentaries', growth: '+45%', prediction: 'Will peak in 2-3 months' },
          { name: 'Korean Drama', growth: '+32%', prediction: 'Sustained growth expected' }
        ]},
        { heading: 'Declining Trends', items: [
          { name: 'Reality Competition', growth: '-12%', prediction: 'Market saturation detected' }
        ]}
      ],
      summary: 'The content landscape is shifting toward authentic storytelling and international content.'
    };
  }

  if (lastMessage.includes('insight') || lastMessage.includes('analy')) {
    return {
      title: 'Content Performance Insights',
      sections: [
        { heading: 'Key Findings', items: [
          { metric: 'Peak Viewing', value: '8PM-10PM weekdays', trend: 'up', detail: 'Primetime viewership increased 12% this quarter' },
          { metric: 'Top Genre', value: 'Live Sports', trend: 'up', detail: 'Sports content drives 34% of total engagement' },
          { metric: 'Churn Risk', value: '15% of premium users', trend: 'down', detail: 'Content diversification reduced churn from 22%' }
        ]}
      ],
      summary: 'Your content portfolio shows strong performance in sports and drama.'
    };
  }

  return {
    title: 'AI Analysis',
    sections: [{ heading: 'Analysis Results', items: [
      { point: 'Your content catalog is well-diversified across genres', confidence: 85 },
      { point: 'Viewer engagement peaks during evening primetime slots', confidence: 92 }
    ]}],
    summary: 'AI analysis complete. The broadcaster platform shows healthy content diversity.'
  };
}

module.exports = { callOpenRouter, aiRateLimiter, parseAIJson };
