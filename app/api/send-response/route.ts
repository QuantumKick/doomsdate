// app/api/send-response/route.ts
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,  // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
})

// Helper function to lock the exact date string without server timezone shifts
function formatExactDate(dateStr: string): string {
  if (!dateStr) return 'Not selected';
  
  // Clean off ISO timestamp strings if present (e.g. 2026-02-14T00:00:00)
  const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = cleanStr.match(/\d+/g);
  
  if (!parts || parts.length < 3) return dateStr;
  
  const [year, month, day] = parts.map(Number);
  
  // Create a UTC-neutral date output (Month/Day/Year)
  return `${month}/${day}/${year}`;
}

// She can type her own hero / activity, so escape anything going into the HTML
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function POST(request: Request) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.error('Missing email credentials');
    return NextResponse.json({ success: false, error: 'Missing email configuration' }, { status: 500 });
  }

  try {
    const data = await request.json()
    
    // Format date string safely
    const formattedDate = formatExactDate(data.date);
    const food = Array.isArray(data.food) ? data.food.join(', ') : ''

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'YOU HAVE MAIL!',
      html: `
        <h1>She responded!</h1>

        <h2>The date</h2>
        <p>Date: ${esc(formattedDate)}</p>
        <p>Time: ${esc(data.time)}</p>
        <p>Food: ${esc(food)}</p>
        <p>Activity: ${data.activity === 'Uwi na q' ? "Uuwi na s'ya" : esc(data.activity)}</p>
        <p>Excitement: ${esc(data.excitement)}/100</p>

        <h2>Her Doomsday survey answers</h2>
        <p>Favorite hero: ${esc(data.favoriteHero) || 'Not selected'}</p>
        <p>Surviving team: ${esc(data.favoriteTeam) || 'Not selected'}</p>
        <p>Doomsday hype: ${esc(data.doomsdayHype)}/100</p>
      `,
      attachments: [{
        filename: `date-response-${new Date().toISOString()}.json`,
        content: JSON.stringify(data, null, 2),
        contentType: 'application/json'
      }]
    })
    
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Failed to send email:', error)
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: false, error: 'An unknown error occurred' }, { status: 500 })
  }
}