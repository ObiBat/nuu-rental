import type { VercelRequest, VercelResponse } from '@vercel/node';

// Contact form handler
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
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format the email content
    const subjectLabels: Record<string, string> = {
      general: 'General Inquiry',
      property: 'Property Search',
      partnership: 'Partnership',
      support: 'Support',
      feedback: 'Feedback'
    };

    const emailContent = `
New Contact Form Submission from NUU

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Subject: ${subjectLabels[subject] || subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Message:

${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sent from: nuu.agency
Time: ${new Date().toISOString()}
    `.trim();

    // Option 1: Send via Resend (if RESEND_API_KEY is set)
    if (process.env.RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'NUU Contact <onboarding@resend.dev>',
          to: process.env.CONTACT_EMAIL || 'hello@nuu.agency',
          reply_to: email,
          subject: `[NUU] ${subjectLabels[subject] || 'New Message'} from ${name}`,
          text: emailContent,
        }),
      });

      if (!resendResponse.ok) {
        const error = await resendResponse.text();
        console.error('Resend error:', error);
        throw new Error('Failed to send email via Resend');
      }

      console.log(`✅ Contact form sent via Resend from ${email}`);
    }
    // Option 2: Log to console (for development/when no email service)
    else {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 NEW CONTACT FORM SUBMISSION');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(emailContent);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    // Store in Supabase if configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      try {
        const supabaseResponse = await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/contact_submissions`,
          {
            method: 'POST',
            headers: {
              'apikey': process.env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              name,
              email,
              phone: phone || null,
              subject,
              message,
              created_at: new Date().toISOString()
            }),
          }
        );

        if (supabaseResponse.ok) {
          console.log('✅ Contact saved to Supabase');
        }
      } catch (dbError) {
        // Don't fail the request if DB save fails
        console.error('Supabase save error:', dbError);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Thank you for your message. We\'ll be in touch soon!' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      error: 'Failed to send message. Please try again or email us directly.' 
    });
  }
}

