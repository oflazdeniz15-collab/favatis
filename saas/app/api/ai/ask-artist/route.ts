import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    try {
        const { artistId, question } = await req.json();

        if (!artistId || !question) {
            return NextResponse.json({ error: 'Artist ID and question are required' }, { status: 400 });
        }

        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Fetch artist context
        const { data: artist } = await supabase
            .from('profiles')
            .select('full_name, artist_bio')
            .eq('id', artistId)
            .single();

        if (!artist) {
            return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are representing the artist ${artist.full_name}. 
        Here is their bio: ${artist.artist_bio || 'No bio provided.'}.
        
        A fan is asking you: "${question}"
        
        Answer professionally and in the style of the artist based on their bio. Be concise.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({ answer: text });
    } catch (error: any) {
        console.error('Gemini AI Error:', error);
        return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
    }
}
