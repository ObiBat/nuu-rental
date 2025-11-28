import { supabase, type Property } from '../lib/supabase';

export interface PropertyResponse {
    property: Property | null;
    error?: string;
}

/**
 * GET /api/properties/:id
 * Get a single property by ID
 */
export async function getProperty(id: string): Promise<PropertyResponse> {
    try {
        const { data: property, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return {
                    property: null,
                    error: 'Property not found'
                };
            }
            throw new Error(`Database error: ${error.message}`);
        }

        return { property };

    } catch (error) {
        console.error('Get property error:', error);
        throw error;
    }
}

/**
 * GET /api/properties
 * List all properties (paginated)
 */
export async function listProperties(page: number = 1, pageSize: number = 20): Promise<{
    properties: Property[];
    total: number;
    page: number;
    pageSize: number;
}> {
    try {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data: properties, error, count } = await supabase
            .from('properties')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        return {
            properties: properties || [],
            total: count || 0,
            page,
            pageSize
        };

    } catch (error) {
        console.error('List properties error:', error);
        throw error;
    }
}
