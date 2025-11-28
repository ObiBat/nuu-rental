import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Generate vector embedding for text using OpenAI (or similar)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    // If no API key, return a mock embedding (1536 dimensions for ada-002 compatibility)
    if (!OPENAI_API_KEY) {
        console.warn('[Embeddings] No OPENAI_API_KEY found, returning random mock embedding.');
        return Array.from({ length: 1536 }, () => Math.random() - 0.5);
    }

    try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: text
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data[0].embedding;

    } catch (error) {
        console.error('Error generating embedding:', error);
        // Fallback to mock for development resilience
        return Array.from({ length: 1536 }, () => Math.random() - 0.5);
    }
}

/**
 * Create a text representation of a property for embedding
 */
export function createPropertyTextString(property: any): string {
    const parts = [
        `${property.bedrooms} bedroom ${property.property_type} in ${property.suburb}, ${property.state}`,
        `Rent: $${property.rent_weekly} per week`,
        `Features: ${(property.features || []).join(', ')}`,
        `Amenities: ${(property.amenities || []).join(', ')}`,
        property.description || ''
    ];

    return parts.join('. ').replace(/\s+/g, ' ').trim();
}

