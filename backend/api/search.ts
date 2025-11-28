import { supabase, type Property, type UserPreference } from '../lib/supabase';
import { filterProperties, calculateMatchScore } from '../lib/matching';
import { generateEmbedding } from '../lib/embeddings';

export interface SearchRequest {
    preferences: Omit<UserPreference, 'id' | 'created_at' | 'updated_at'>;
    limit?: number;
    semantic_query?: string; // Free text query for vector search
}

export interface SearchResponse {
    results: Array<Property & { matchScore: number; scoreBreakdown: any; similarity?: number }>;
    total: number;
    message?: string;
}

/**
 * POST /api/search
 * Search for properties based on user preferences and optional semantic query
 */
export async function searchProperties(req: SearchRequest): Promise<SearchResponse> {
    try {
        const { preferences, limit = 50, semantic_query } = req;
        let vectorMatches: Map<string, number> | null = null;

        // Step 0: Vector Search (if semantic query provided and function exists)
        if (semantic_query) {
            try {
                const embedding = await generateEmbedding(semantic_query);
                
                const { data: matches, error } = await supabase.rpc('match_properties', {
                    query_embedding: embedding,
                    match_threshold: 0.3, // Lower threshold for more results
                    match_count: 100
                });

                if (!error && matches) {
                    vectorMatches = new Map(matches.map((m: any) => [m.id, m.similarity]));
                    console.log(`[Vector Search] Found ${matches.length} semantic matches`);
                } else if (error) {
                    // Function doesn't exist yet - fall back to regular search
                    console.log('[Vector Search] Function not available, using standard search');
                }
            } catch (err) {
                console.log('[Vector Search] Skipping - error:', (err as Error).message);
            }
        }

        // Step 1: Build base query with hard filters
        let query = supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply Vector Search candidates filter (only if we have matches)
        if (vectorMatches && vectorMatches.size > 0) {
            query = query.in('id', Array.from(vectorMatches.keys()));
        }

        // If no vector matches but we have a query, don't filter by vector IDs
        // This allows fallback to regular filtering

        // Apply price filters
        if (preferences.price_min) {
            query = query.gte('rent_weekly', preferences.price_min);
        }
        if (preferences.price_max) {
            query = query.lte('rent_weekly', preferences.price_max);
        }

        // Apply property type filter
        if (preferences.property_types && preferences.property_types.length > 0) {
            query = query.in('property_type', preferences.property_types);
        }

        // Fetch properties
        const { data: properties, error } = await query;

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        if (!properties || properties.length === 0) {
            return {
                results: [],
                total: 0,
                message: 'No properties found matching your criteria'
            };
        }

        // Step 2: Apply location filter (if specified)
        let filteredProperties = properties;
        if (preferences.location_center) {
            filteredProperties = filterProperties(properties, preferences as UserPreference);
        }

        // Step 3: Calculate match scores for each property
        const scoredProperties = filteredProperties.map(property => {
            const score = calculateMatchScore(property, preferences as UserPreference);
            
            // If we have a vector similarity score, blend it in
            // We'll give it a 30% weight if present, or just store it
            const similarity = vectorMatches?.get(property.id) || 0;
            
            // Enhanced scoring logic:
            // If semantic match exists, boost the score
            let finalScore = score.totalScore;
            if (similarity > 0) {
                // Boost score by similarity (similarity is 0-1, so * 20 gives up to +20 points)
                finalScore = Math.min(100, finalScore + (similarity * 20));
            }

            return {
                ...property,
                matchScore: Math.round(finalScore * 10) / 10,
                scoreBreakdown: {
                    ...score.breakdown,
                    vector_similarity: Math.round(similarity * 100)
                },
                similarity
            };
        });

        // Step 4: Sort by match score (highest first)
        scoredProperties.sort((a, b) => b.matchScore - a.matchScore);

        // Step 5: Return top results
        const results = scoredProperties.slice(0, limit);

        return {
            results,
            total: scoredProperties.length,
            message: results.length > 0 ? undefined : 'No properties found matching your criteria'
        };

    } catch (error) {
        console.error('Search error:', error);
        throw error;
    }
}
