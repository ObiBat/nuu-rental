import dotenv from 'dotenv';
import { supabase } from './supabase';
import { generateEmbedding } from './embeddings';

// Load env from project root
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Debug: Log if key is present (not the actual key)
if (!OPENAI_API_KEY) {
    console.error('[AI Engine] ⚠️  OPENAI_API_KEY is not set in .env file!');
    console.error('[AI Engine] Please add: OPENAI_API_KEY=sk-your-key-here');
} else {
    console.log('[AI Engine] ✓ OpenAI API key loaded (length:', OPENAI_API_KEY.length, ')');
}

export interface ConversationMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ExtractedPreferences {
    location_type?: string;       // 'beach', 'city', 'suburbs', 'quiet'
    specific_suburbs?: string[];  // ['Bondi', 'Manly']
    property_type?: string;       // 'apartment', 'house', 'studio'
    bedrooms?: number;
    budget_weekly?: number;       // Maximum budget (e.g., "under $1000" = 1000)
    budget_min_weekly?: number;   // Minimum budget (e.g., "over $1000" = 1000)
    features?: string[];          // ['pool', 'gym', 'parking']
    amenities?: string[];         // ['concierge', 'rooftop', 'bbq area']
    lifestyle?: string[];         // ['family', 'professional', 'student']
    commute_needs?: string;       // 'close to CBD', 'near train'
    transport_preference?: string; // 'train', 'bus', 'ferry', 'light rail'
    near_locations?: string[];    // ['Sydney CBD', 'Bondi Junction', 'University']
    pet_friendly?: boolean;
    move_in_date?: string;
    style_preference?: string;    // 'modern', 'vintage', 'any'
    priorities?: string[];        // What matters most
    deal_breakers?: string[];     // What they absolutely don't want
}

export interface AIResponse {
    message: string;
    preferences: ExtractedPreferences;
    ready_to_search: boolean;
    follow_up_questions?: string[];
    area_insights?: string;
}

const SYSTEM_PROMPT = `You are NUU, an expert AI property concierge for the Australian rental market. Your goal is to deeply understand what the user truly desires in their next home - not just the basics, but the lifestyle they want to live.

PERSONALITY:
- Warm, professional, and genuinely curious about their needs
- Ask thoughtful follow-up questions to uncover hidden preferences
- Provide helpful insights about suburbs and areas when relevant
- Be conversational, not robotic

CONVERSATION STRATEGY:
1. Start by understanding their LIFESTYLE and VIBE (not just location)
2. Dig deeper with specific questions based on their responses
3. Understand their priorities and deal-breakers
4. Only move to search when you have a clear picture

INFORMATION TO GATHER (ask naturally, not as a checklist):
- Location preference: city/beach/suburbs, specific areas
- Budget: weekly rent range  
- Property type or bedrooms (optional - can search without)
- Key features if mentioned

IMPORTANT RULES:
1. Be CONCISE - ask maximum 2-3 questions total before searching
2. If user gives location + budget, that's ENOUGH to search - set ready_to_search: true
3. Don't ask about every detail - infer from context
4. If user says "I'm open" or "flexible" - stop asking and search
5. Provide quick reply suggestions in your response

RESPONSE FORMAT:
Always respond with valid JSON in this exact format:
{
    "message": "Your conversational response to the user",
    "preferences": {
        // Only include fields you've learned about
        "location_type": "beach|city|suburbs|quiet",
        "specific_suburbs": ["Suburb1", "Suburb2"],
        "property_type": "apartment|house|studio|townhouse",
        "bedrooms": 2,
        "budget_weekly": 800,
        "budget_min_weekly": 500,
        "features": ["pool", "gym", "parking", "balcony", "air conditioning"],
        "amenities": ["concierge", "rooftop terrace", "bbq area", "sauna"],
        "lifestyle": ["professional", "active"],
        "commute_needs": "close to CBD",
        "transport_preference": "train|bus|ferry|light rail",
        "near_locations": ["Sydney CBD", "University of Sydney"],
        "pet_friendly": true,
        "style_preference": "modern|vintage|any",
        "priorities": ["location", "price", "transport"],
        "deal_breakers": ["no parking"]
    },
    "ready_to_search": false,
    "quick_replies": ["Option 1", "Option 2", "Option 3"],
    "area_insights": "Optional: Brief insights about mentioned area"
}

BUDGET INTERPRETATION:
- "under $X" or "less than $X" or "up to $X" or "max $X" → budget_weekly: X
- "over $X" or "more than $X" or "above $X" or "at least $X" or "minimum $X" → budget_min_weekly: X
- "$X-$Y" or "between $X and $Y" → budget_min_weekly: X, budget_weekly: Y
- If they just say "$X" without context, assume it's a maximum (budget_weekly)

TRANSPORT & LOCATION EXTRACTION:
- "near train station" or "close to trains" → transport_preference: "train"
- "near ferry" or "ferry access" → transport_preference: "ferry"
- "close to CBD" or "near city" → near_locations: ["Sydney CBD"]
- "near university" or "close to UNSW" → near_locations: ["UNSW"] or similar
- "walking distance to shops" → near_locations: ["shops"]

FEATURES vs AMENITIES:
- features: Inside the unit (pool, gym, parking, balcony, laundry, dishwasher, air con)
- amenities: Building/complex level (concierge, rooftop, bbq area, sauna, security)

IMPORTANT:
- Set "ready_to_search": true when you have: location + budget (minimum required)
- Maximum 2-3 exchanges before searching - be efficient!
- If user says "flexible", "open", "anything" - STOP asking and search immediately
- Always include "quick_replies" array with 2-4 clickable options for faster responses
- Reference Australian suburbs and areas accurately

QUICK REPLIES EXAMPLES:
- For location: ["Near the beach", "Inner city", "Quiet suburbs", "Close to CBD"]
- For budget: ["Under $500/wk", "$500-700/wk", "$700-1000/wk", "Over $1000/wk"]
- For features: ["Pet friendly", "Parking included", "Pool/Gym", "Balcony"]`;

/**
 * Main AI Conversation Engine
 */
export class AIConversationEngine {
    private conversationHistory: ConversationMessage[] = [];
    private extractedPreferences: ExtractedPreferences = {};

    constructor() {
        this.conversationHistory = [
            { role: 'system', content: SYSTEM_PROMPT }
        ];
    }

    /**
     * Process user message and generate AI response
     */
    async chat(userMessage: string): Promise<AIResponse> {
        console.log('\n[AI] Processing user message:', userMessage);

        // Add user message to history
        this.conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: this.conversationHistory,
                    temperature: 0.7,
                    max_tokens: 1000,
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[AI] OpenAI API error:', errorText);
                throw new Error(`OpenAI API error: ${response.statusText}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices[0].message.content;

            console.log('[AI] Raw response:', assistantMessage);

            // Parse JSON response
            let parsed: AIResponse;
            try {
                parsed = JSON.parse(assistantMessage);
            } catch (e) {
                console.error('[AI] Failed to parse JSON response:', e);
                // Fallback response
                parsed = {
                    message: assistantMessage,
                    preferences: {},
                    ready_to_search: false
                };
            }

            // Merge extracted preferences
            this.extractedPreferences = {
                ...this.extractedPreferences,
                ...parsed.preferences
            };

            // Add assistant response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });

            console.log('[AI] Extracted preferences:', JSON.stringify(this.extractedPreferences, null, 2));
            console.log('[AI] Ready to search:', parsed.ready_to_search);

            return {
                ...parsed,
                preferences: this.extractedPreferences
            };

        } catch (error) {
            console.error('[AI] Chat error:', error);
            throw error;
        }
    }

    /**
     * Get current extracted preferences
     */
    getPreferences(): ExtractedPreferences {
        return this.extractedPreferences;
    }

    /**
     * Reset conversation
     */
    reset() {
        this.conversationHistory = [
            { role: 'system', content: SYSTEM_PROMPT }
        ];
        this.extractedPreferences = {};
    }
}

/**
 * Convert AI-extracted preferences to search query
 */
export function preferencesToSearchQuery(prefs: ExtractedPreferences): {
    semantic_query: string;
    filters: any;
} {
    const parts: string[] = [];

    if (prefs.property_type) parts.push(`${prefs.property_type}`);
    if (prefs.bedrooms) parts.push(`${prefs.bedrooms} bedroom`);
    if (prefs.location_type) parts.push(`in ${prefs.location_type} area`);
    if (prefs.specific_suburbs?.length) parts.push(`near ${prefs.specific_suburbs.join(' or ')}`);
    if (prefs.features?.length) parts.push(`with ${prefs.features.join(', ')}`);
    if (prefs.style_preference && prefs.style_preference !== 'any') parts.push(`${prefs.style_preference} style`);
    if (prefs.lifestyle?.length) parts.push(`suitable for ${prefs.lifestyle.join(', ')} lifestyle`);
    if (prefs.commute_needs) parts.push(prefs.commute_needs);

    const semantic_query = parts.join(', ') || 'rental property';

    return {
        semantic_query,
        filters: {
            price_max: prefs.budget_weekly,
            property_types: prefs.property_type ? [prefs.property_type.toUpperCase()] : [],
            features: prefs.features || [],
            modernity: prefs.style_preference === 'modern' ? 'MODERN (<5Y)' : 
                       prefs.style_preference === 'vintage' ? 'CLASSIC' : 'ANY'
        }
    };
}

/**
 * Generate AI explanation for why a property matches
 */
export async function generateMatchExplanation(
    property: any,
    preferences: ExtractedPreferences
): Promise<string> {
    const prompt = `Given these user preferences:
${JSON.stringify(preferences, null, 2)}

And this property:
- Location: ${property.suburb}, ${property.state}
- Type: ${property.property_type}
- Bedrooms: ${property.bedrooms}
- Rent: $${property.rent_weekly}/week
- Features: ${(property.features || []).join(', ')}
- Description: ${property.description || 'N/A'}

Write a brief, personalized 1-2 sentence explanation of why this property is a good match for them. Be specific and reference their stated preferences.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 150
            })
        });

        if (!response.ok) throw new Error('Failed to generate explanation');

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error('[AI] Explanation generation failed:', error);
        return 'This property matches your search criteria.';
    }
}

