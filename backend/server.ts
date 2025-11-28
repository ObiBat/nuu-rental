import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { searchProperties } from './api/search';
import { AIConversationEngine, preferencesToSearchQuery, generateMatchExplanation, type ExtractedPreferences } from './lib/ai-engine';
import { calculateAccurateMatch } from './lib/accurate-matching';
import { supabase } from './lib/supabase';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Store conversation sessions (in production, use Redis or similar)
const sessions: Map<string, AIConversationEngine> = new Map();

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[API] ${new Date().toISOString()}`);
    console.log(`[API] ${req.method} ${req.path}`);
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[API] ✓ Completed in ${duration}ms (status: ${res.statusCode})`);
    });
    
    next();
});

/**
 * POST /api/chat
 * AI-powered conversation endpoint
 */
app.post('/api/chat', async (req, res) => {
    try {
        const { session_id, message } = req.body;
        
        console.log(`[Chat] Session: ${session_id}`);
        console.log(`[Chat] User: "${message}"`);

        // Get or create session
        let engine = sessions.get(session_id);
        if (!engine) {
            console.log('[Chat] Creating new conversation session');
            engine = new AIConversationEngine();
            sessions.set(session_id, engine);
        }

        // Process message with AI
        console.log('[Chat] Sending to GPT-4o...');
        const aiResponse = await engine.chat(message);
        
        console.log(`[Chat] AI: "${aiResponse.message.substring(0, 100)}..."`);
        console.log(`[Chat] Ready to search: ${aiResponse.ready_to_search}`);

        // If ready to search, perform the search with ACCURATE matching
        if (aiResponse.ready_to_search) {
            console.log('[Search] Initiating property search...');
            console.log('[Search] User preferences:', JSON.stringify(aiResponse.preferences, null, 2));

            // Build query based on preferences
            let query = supabase.from('properties').select('*');
            
            // Apply budget filters if specified
            if (aiResponse.preferences.budget_weekly) {
                // Maximum budget - allow 20% over for "close matches"
                const maxBudget = Math.round(aiResponse.preferences.budget_weekly * 1.2);
                query = query.lte('rent_weekly', maxBudget);
                console.log(`[Search] Max budget filter: <= $${maxBudget}/wk`);
            }
            
            if (aiResponse.preferences.budget_min_weekly) {
                // Minimum budget - show properties at or above this price
                const minBudget = Math.round(aiResponse.preferences.budget_min_weekly * 0.9); // Allow 10% under
                query = query.gte('rent_weekly', minBudget);
                console.log(`[Search] Min budget filter: >= $${minBudget}/wk`);
            }

            const { data: properties, error } = await query.limit(50);

            if (error) {
                console.error('[Search] Database error:', error);
                throw error;
            }

            console.log(`[Search] Found ${properties?.length || 0} properties in database`);

            if (!properties || properties.length === 0) {
                res.json({
                    ...aiResponse,
                    search_results: [],
                    message: 'No properties found matching your criteria'
                });
                return;
            }

            // Calculate ACCURATE match scores for each property
            const scoredProperties = properties.map(property => {
                const matchResult = calculateAccurateMatch(property, aiResponse.preferences);
                return {
                    ...property,
                    matchScore: matchResult.score,
                    matchBreakdown: matchResult.breakdown
                };
            });

            // Sort by match score (highest first)
            scoredProperties.sort((a, b) => b.matchScore - a.matchScore);

            // Take top 5
            const topResults = scoredProperties.slice(0, 5);

            console.log('[Search] Top matches:');
            topResults.forEach((p, i) => {
                console.log(`  ${i+1}. ${p.suburb}: ${p.matchScore}% - ${p.matchBreakdown.overall}`);
            });

            // Generate personalized explanations for top 3
            const resultsWithExplanations = await Promise.all(
                topResults.slice(0, 3).map(async (property) => {
                    // Use the breakdown to create explanation
                    const breakdown = property.matchBreakdown;
                    let explanationParts = [];
                    
                    // Always show location info if relevant
                    if (breakdown.location.score >= 70) {
                        explanationParts.push(breakdown.location.reason);
                    }
                    
                    // Always show budget info (it's important context)
                    if (breakdown.budget.reason && breakdown.budget.reason !== 'No budget specified') {
                        explanationParts.push(breakdown.budget.reason);
                    }
                    
                    // Show matched features
                    if (breakdown.features.matched.length > 0) {
                        explanationParts.push(`Has ${breakdown.features.matched.join(', ')}`);
                    }
                    
                    // Show missing features as a note
                    if (breakdown.features.missing.length > 0) {
                        explanationParts.push(`Missing: ${breakdown.features.missing.join(', ')}`);
                    }

                    const explanation = explanationParts.join('. ');

                    return {
                        ...property,
                        ai_explanation: explanation || breakdown.overall
                    };
                })
            );

            res.json({
                ...aiResponse,
                search_results: resultsWithExplanations
            });
        } else {
            res.json(aiResponse);
        }

    } catch (error) {
        console.error('[Chat] Error:', error);
        res.status(500).json({ 
            error: 'AI processing failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * POST /api/chat/reset
 * Reset conversation session
 */
app.post('/api/chat/reset', (req, res) => {
    const { session_id } = req.body;
    
    if (sessions.has(session_id)) {
        sessions.get(session_id)?.reset();
        console.log(`[Chat] Session ${session_id} reset`);
    }
    
    res.json({ success: true });
});

/**
 * POST /api/search (legacy endpoint)
 */
app.post('/api/search', async (req, res) => {
    try {
        console.log('[Search] Received query:', JSON.stringify(req.body.preferences, null, 2));
        if (req.body.semantic_query) {
            console.log('[Search] Semantic query:', req.body.semantic_query);
        }

        const result = await searchProperties(req.body);
        
        console.log(`[Search] Found ${result.results.length} matches`);
        if (result.results.length > 0) {
            console.log('[Search] Top match:', result.results[0].suburb, `- Score: ${result.results[0].matchScore}%`);
        }

        res.json(result);
    } catch (error) {
        console.error('[Search] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🏠 NUU AI Property Concierge - Backend Server              ║
║                                                              ║
║   Server:     http://localhost:${port}                          ║
║   AI Model:   GPT-4o                                         ║
║   Embeddings: text-embedding-3-small                         ║
║   Vector DB:  Supabase pgvector                              ║
║                                                              ║
║   Endpoints:                                                 ║
║   • POST /api/chat       - AI conversation                   ║
║   • POST /api/chat/reset - Reset session                     ║
║   • POST /api/search     - Property search                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
});
