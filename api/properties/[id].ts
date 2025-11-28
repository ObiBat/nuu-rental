import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getProperty } from '../../backend/api/properties';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Property ID is required' });
    }

    try {
        const result = await getProperty(id);

        if (result.error) {
            return res.status(404).json({ error: result.error });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
