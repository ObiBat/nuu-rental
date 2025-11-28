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

    let emailSent = false;

    // Try to send via Resend if configured
    if (process.env.RESEND_API_KEY) {
      try {
        // Use verified domain if available, otherwise use Resend's test domain
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'NUU Contact <onboarding@resend.dev>';
        const toEmail = process.env.CONTACT_EMAIL || 'hello@nuu.agency';

        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: toEmail,
            reply_to: email,
            subject: `[NUU] ${subjectLabels[subject] || 'New Message'} from ${name}`,
            text: emailContent,
          }),
        });

        if (resendResponse.ok) {
          emailSent = true;
          console.log(`✅ Contact form sent via Resend from ${email} to ${toEmail}`);
        } else {
          const errorText = await resendResponse.text();
          console.error('Resend API error:', errorText);
          // Don't throw - we'll still log the submission
        }
      } catch (resendError) {
        console.error('Resend error:', resendError);
        // Don't throw - we'll still log the submission
      }
    }

    // Always log the submission for backup
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 NEW CONTACT FORM SUBMISSION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email sent: ${emailSent ? 'Yes' : 'No (logged only)'}`);
    console.log(emailContent);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
              email_sent: emailSent,
              created_at: new Date().toISOString()
            }),
          }
        );

        if (supabaseResponse.ok) {
          console.log('✅ Contact saved to Supabase');
        } else {
          const dbError = await supabaseResponse.text();
          console.log('Supabase response:', dbError);
        }
      } catch (dbError) {
        // Don't fail the request if DB save fails
        console.error('Supabase save error:', dbError);
      }
    }

    // Always return success - the submission is logged
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
