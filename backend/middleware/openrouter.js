const https = require('https');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function callOpenRouter(messages, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

  if (!apiKey || apiKey === 'your-openrouter-key-here') {
    return {
      success: false,
      error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env file.',
      mock: true,
      data: generateMockResponse(messages, options)
    };
  }

  const payload = JSON.stringify({
    model: model,
    messages: messages,
    max_tokens: options.maxTokens || 1024,
    temperature: options.temperature || 0.7
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'BroadcastAI'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            resolve({ success: false, error: parsed.error.message || 'API error', data: null });
          } else {
            const content = parsed.choices?.[0]?.message?.content || '';
            resolve({
              success: true,
              data: content,
              model: parsed.model,
              usage: parsed.usage
            });
          }
        } catch (e) {
          resolve({ success: false, error: 'Failed to parse response', data: null });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ success: false, error: e.message, data: null });
    });

    req.write(payload);
    req.end();
  });
}

function generateMockResponse(messages, options) {
  const lastMessage = messages[messages.length - 1]?.content || '';

  if (lastMessage.includes('recommend')) {
    return {
      title: 'AI Recommendations',
      sections: [
        {
          heading: 'Personalized Picks',
          items: [
            { name: 'The Crown Season 6', confidence: 95, reason: 'Based on your interest in British drama and historical content' },
            { name: 'Premier League Live', confidence: 90, reason: 'You frequently watch live sports on weekends' },
            { name: 'Planet Earth III', confidence: 87, reason: 'Documentary lovers who enjoy nature content rated this highly' }
          ]
        },
        {
          heading: 'Because You Watched Drama',
          items: [
            { name: 'Succession', confidence: 88, reason: 'Similar themes of power and family dynamics' },
            { name: 'EastEnders Special', confidence: 82, reason: 'Top soap opera matching your viewing pattern' }
          ]
        }
      ],
      summary: 'Based on your viewing history and preferences, we recommend a mix of premium drama, live sports, and documentary content to maximize engagement.'
    };
  }

  if (lastMessage.includes('insight') || lastMessage.includes('analy')) {
    return {
      title: 'Content Performance Insights',
      sections: [
        {
          heading: 'Key Findings',
          items: [
            { metric: 'Peak Viewing', value: '8PM-10PM weekdays', trend: 'up', detail: 'Primetime viewership increased 12% this quarter' },
            { metric: 'Top Genre', value: 'Live Sports', trend: 'up', detail: 'Sports content drives 34% of total engagement' },
            { metric: 'Churn Risk', value: '15% of premium users', trend: 'down', detail: 'Content diversification reduced churn from 22%' }
          ]
        },
        {
          heading: 'Recommendations',
          items: [
            { action: 'Increase soap opera scheduling during 6-8PM slot', impact: 'high', reason: 'Underserved demographic with high loyalty potential' },
            { action: 'Add more sports commentary content', impact: 'medium', reason: 'Post-match analysis retains viewers 23 min longer' }
          ]
        }
      ],
      summary: 'Your content portfolio shows strong performance in sports and drama. Consider increasing documentary offerings during off-peak hours to capture the growing nature/science audience segment.'
    };
  }

  if (lastMessage.includes('search') || lastMessage.includes('find')) {
    return {
      title: 'AI Search Results',
      sections: [
        {
          heading: 'Best Matches',
          items: [
            { name: 'Result 1', relevance: 95, description: 'Highly relevant match based on semantic understanding' },
            { name: 'Result 2', relevance: 87, description: 'Related content with similar themes' },
            { name: 'Result 3', relevance: 78, description: 'Tangentially related but popular content' }
          ]
        }
      ],
      summary: 'Found relevant content matching your search criteria with AI-enhanced semantic understanding.'
    };
  }

  if (lastMessage.includes('trend')) {
    return {
      title: 'Trend Analysis',
      sections: [
        {
          heading: 'Rising Trends',
          items: [
            { name: 'True Crime Documentaries', growth: '+45%', prediction: 'Will peak in 2-3 months' },
            { name: 'Korean Drama', growth: '+32%', prediction: 'Sustained growth expected' },
            { name: 'Live Cooking Shows', growth: '+28%', prediction: 'Seasonal peak approaching' }
          ]
        },
        {
          heading: 'Declining Trends',
          items: [
            { name: 'Reality Competition', growth: '-12%', prediction: 'Market saturation detected' },
            { name: 'Late Night Talk Shows', growth: '-8%', prediction: 'Shifting to clip-based consumption' }
          ]
        }
      ],
      summary: 'The content landscape is shifting toward authentic storytelling and international content. Consider acquiring more true crime and international drama titles.'
    };
  }

  if (lastMessage.includes('schedule') || lastMessage.includes('optimize')) {
    return {
      title: 'Schedule Optimization',
      sections: [
        {
          heading: 'Suggested Changes',
          items: [
            { slot: 'Monday 8PM', current: 'Reality Show', suggested: 'Crime Drama', lift: '+18% predicted viewership' },
            { slot: 'Saturday 3PM', current: 'Repeat Movie', suggested: 'Live Sports Pre-Show', lift: '+25% predicted viewership' },
            { slot: 'Wednesday 9PM', current: 'Documentary', suggested: 'Soap Opera Special', lift: '+15% predicted viewership' }
          ]
        }
      ],
      summary: 'Optimizing your schedule based on historical viewing patterns and audience preferences could increase overall engagement by approximately 15-20%.'
    };
  }

  return {
    title: 'AI Analysis',
    sections: [
      {
        heading: 'Analysis Results',
        items: [
          { point: 'Your content catalog is well-diversified across genres', confidence: 85 },
          { point: 'Viewer engagement peaks during evening primetime slots', confidence: 92 },
          { point: 'Personalization can improve content discovery by up to 40%', confidence: 78 }
        ]
      }
    ],
    summary: 'AI analysis complete. The broadcaster platform shows healthy content diversity with opportunities for improved personalization and scheduling optimization.'
  };
}

module.exports = { callOpenRouter };
