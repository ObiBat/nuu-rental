import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Store sessions in memory (for serverless, consider using Redis or Supabase)
const sessions: Map<string, any> = new Map();

// AI Engine implementation
class AIConversationEngine {
  private conversationHistory: Array<{ role: string; content: string }> = [];

  async chat(userMessage: string) {
    this.conversationHistory.push({ role: 'user', content: userMessage });

    const systemPrompt = `You are NUU, an expert AI property concierge for the Australian rental market. Your goal is to deeply understand what the user truly desires in their next home.

PERSONALITY:
- Warm, professional, and genuinely curious about their needs
- Be conversational, not robotic

CONVERSATION STRATEGY:
1. Understand their LIFESTYLE and VIBE
2. Only move to search when you have location + budget

IMPORTANT RULES:
1. Be CONCISE - ask maximum 2-3 questions total before searching
2. If user gives location + budget, that's ENOUGH to search - set ready_to_search: true
3. Provide quick reply suggestions

RESPONSE FORMAT:
Always respond with valid JSON:
{
    "message": "Your conversational response",
    "preferences": {
        "location_type": "beach|city|suburbs",
        "specific_suburbs": ["Suburb1"],
        "property_type": "apartment|house|studio",
        "bedrooms": 2,
        "budget_weekly": 800,
        "budget_min_weekly": 500,
        "features": ["pool", "gym"],
        "amenities": ["concierge"],
        "transport_preference": "train|bus|ferry",
        "near_locations": ["Sydney CBD"]
    },
    "ready_to_search": true,
    "quick_replies": ["Option 1", "Option 2"]
}

Set "ready_to_search": true when you have: location + budget (minimum required)`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            ...this.conversationHistory
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        this.conversationHistory.push({ role: 'assistant', content: parsed.message });
        return parsed;
      }

      return {
        message: content,
        preferences: {},
        ready_to_search: false,
        quick_replies: []
      };
    } catch (error) {
      console.error('AI Error:', error);
      return {
        message: "I'm having trouble connecting. Please try again.",
        preferences: {},
        ready_to_search: false,
        quick_replies: []
      };
    }
  }
}

// Matching algorithm
function calculateMatch(property: any, preferences: any) {
  let score = 50;
  const breakdown: any = { location: '', budget: '', features: [] };

  // Location matching
  if (preferences.specific_suburbs?.length) {
    const propertySuburb = property.suburb?.toLowerCase() || '';
    const requestedSuburbs = preferences.specific_suburbs.map((s: string) => s.toLowerCase());
    
    if (requestedSuburbs.some((rs: string) => propertySuburb.includes(rs) || rs.includes(propertySuburb))) {
      score += 25;
      breakdown.location = `✓ ${property.suburb}`;
    }
  }

  // Budget matching
  const rent = property.rent_weekly;
  if (preferences.budget_weekly) {
    if (rent <= preferences.budget_weekly) {
      const savings = preferences.budget_weekly - rent;
      if (savings > 200) {
        score += 20;
        breakdown.budget = `$${savings}/wk savings!`;
      } else if (savings > 50) {
        score += 15;
        breakdown.budget = `$${savings}/wk under`;
      } else {
        score += 10;
        breakdown.budget = `Within budget`;
      }
    } else {
      const over = rent - preferences.budget_weekly;
      score -= Math.min(20, over / 20);
      breakdown.budget = `$${over}/wk over`;
    }
  }

  // Features matching
  if (preferences.features?.length) {
    const allFeatures = [...(property.features || []), ...(property.amenities || [])].join(' ').toLowerCase();
    
    for (const feature of preferences.features) {
      if (allFeatures.includes(feature.toLowerCase())) {
        score += 5;
        breakdown.features.push(feature);
      }
    }
  }

  return {
    score: Math.max(15, Math.min(98, Math.round(score))),
    breakdown
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { session_id, message } = req.body;

    // Get or create session
    let engine = sessions.get(session_id);
    if (!engine) {
      engine = new AIConversationEngine();
      sessions.set(session_id, engine);
    }

    // Process message with AI
    const aiResponse = await engine.chat(message);

    // If ready to search, perform the search
    if (aiResponse.ready_to_search) {
      let query = supabase.from('properties').select('*');
      
      if (aiResponse.preferences.budget_weekly) {
        const maxBudget = Math.round(aiResponse.preferences.budget_weekly * 1.2);
        query = query.lte('rent_weekly', maxBudget);
      }
      
      if (aiResponse.preferences.budget_min_weekly) {
        const minBudget = Math.round(aiResponse.preferences.budget_min_weekly * 0.9);
        query = query.gte('rent_weekly', minBudget);
      }

      const { data: properties } = await query.limit(50);

      if (properties?.length) {
        const scoredProperties = properties.map(p => {
          const match = calculateMatch(p, aiResponse.preferences);
          return { ...p, matchScore: match.score, matchBreakdown: match.breakdown };
        });

        scoredProperties.sort((a, b) => b.matchScore - a.matchScore);
        const topResults = scoredProperties.slice(0, 5);

        const resultsWithExplanations = topResults.slice(0, 3).map(p => {
          const parts = [];
          if (p.matchBreakdown.location) parts.push(p.matchBreakdown.location);
          if (p.matchBreakdown.budget) parts.push(p.matchBreakdown.budget);
          if (p.matchBreakdown.features?.length) parts.push(`Has ${p.matchBreakdown.features.join(', ')}`);
          
          return {
            ...p,
            ai_explanation: parts.join('. ') || `${p.suburb} • $${p.rent_weekly}/wk`
          };
        });

        return res.json({
          ...aiResponse,
          search_results: resultsWithExplanations
        });
      }
    }

    return res.json(aiResponse);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

