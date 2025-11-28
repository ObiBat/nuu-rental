import type { VercelRequest, VercelResponse } from '@vercel/node';

// Store sessions (shared with chat.ts in production via external store)
const sessions: Map<string, any> = new Map();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.body;
  sessions.delete(session_id);
  
  return res.json({ success: true, message: 'Session reset' });
}

