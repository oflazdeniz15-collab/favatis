import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// System prompts for different generation types
const SYSTEM_PROMPTS: Record<string, string> = {
    bio: `You are a professional music industry copywriter. Generate compelling, authentic artist biographies that:
- Capture the artist's unique voice and style
- Highlight their musical journey and influences
- Are engaging and connect with fans emotionally
- Are between 150-300 words
- Use a professional yet personable tone
- Include relevant achievements if provided
Format: Return only the biography text, no headers or labels.`,

    portfolio: `You are a creative director specializing in artist branding. Generate portfolio descriptions that:
- Showcase the artist's body of work
- Highlight key projects, collaborations, and releases
- Emphasize unique artistic elements
- Create a narrative that appeals to labels, venues, and fans
- Are between 100-200 words
Format: Return only the portfolio description, no headers or labels.`,

    social: `You are a social media strategist for musicians. Generate engaging social media content that:
- Is optimized for the target platform
- Captures attention in the first line
- Includes relevant hashtag suggestions
- Maintains the artist's brand voice
- Encourages engagement
Format: Return the post text followed by suggested hashtags.`
};

interface GenerateRequest {
    type: 'bio' | 'portfolio' | 'social';
    prompt: string;
    artistName?: string;
    genre?: string;
    influences?: string[];
    achievements?: string[];
    platform?: 'twitter' | 'instagram' | 'tiktok';
}

export async function POST(request: NextRequest) {
    try {
        // Verify authentication using Supabase
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Check if API key is configured
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY not configured');
            return NextResponse.json(
                { error: 'AI service not configured' },
                { status: 503 }
            );
        }

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(apiKey);

        const body: GenerateRequest = await request.json();
        const { type, prompt, artistName, genre, influences, achievements, platform } = body;

        // Validate request
        if (!type || !prompt) {
            return NextResponse.json(
                { error: 'Type and prompt are required' },
                { status: 400 }
            );
        }

        if (!['bio', 'portfolio', 'social'].includes(type)) {
            return NextResponse.json(
                { error: 'Invalid generation type' },
                { status: 400 }
            );
        }

        // Build context-rich prompt
        let contextPrompt = prompt;

        if (artistName) {
            contextPrompt = `Artist Name: ${artistName}\n${contextPrompt}`;
        }

        if (genre) {
            contextPrompt += `\nGenre: ${genre}`;
        }

        if (influences && influences.length > 0) {
            contextPrompt += `\nMusical Influences: ${influences.join(', ')}`;
        }

        if (achievements && achievements.length > 0) {
            contextPrompt += `\nNotable Achievements: ${achievements.join(', ')}`;
        }

        if (type === 'social' && platform) {
            contextPrompt += `\nTarget Platform: ${platform}`;
        }

        // Initialize the model
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.8,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
            ],
        });

        // Generate content
        const systemPrompt = SYSTEM_PROMPTS[type];
        const fullPrompt = `${systemPrompt}\n\n---\n\nUser Request:\n${contextPrompt}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const generatedText = response.text();

        if (!generatedText) {
            return NextResponse.json(
                { error: 'Failed to generate content' },
                { status: 500 }
            );
        }

        // Log usage for analytics
        console.log(`AI Generation: type=${type}, user=${session.user.email}, chars=${generatedText.length}`);

        return NextResponse.json({
            success: true,
            type,
            content: generatedText.trim(),
            metadata: {
                generatedAt: new Date().toISOString(),
                model: 'gemini-1.5-flash',
                promptContext: {
                    artistName,
                    genre,
                    platform
                }
            }
        });

    } catch (error) {
        console.error('Gemini AI error:', error);

        // Handle specific Gemini errors
        if (error instanceof Error) {
            if (error.message.includes('SAFETY')) {
                return NextResponse.json(
                    { error: 'Content was blocked by safety filters. Please modify your prompt.' },
                    { status: 400 }
                );
            }

            if (error.message.includes('quota') || error.message.includes('rate')) {
                return NextResponse.json(
                    { error: 'AI service rate limit reached. Please try again later.' },
                    { status: 429 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Failed to generate content' },
            { status: 500 }
        );
    }
}

// GET: Retrieve available generation types
export async function GET() {
    return NextResponse.json({
        availableTypes: [
            {
                type: 'bio',
                name: 'Artist Biography',
                description: 'Generate a compelling artist biography',
                requiredFields: ['prompt'],
                optionalFields: ['artistName', 'genre', 'influences', 'achievements']
            },
            {
                type: 'portfolio',
                name: 'Portfolio Description',
                description: 'Create a professional portfolio description',
                requiredFields: ['prompt'],
                optionalFields: ['artistName', 'genre', 'achievements']
            },
            {
                type: 'social',
                name: 'Social Media Post',
                description: 'Generate engaging social media content',
                requiredFields: ['prompt', 'platform'],
                optionalFields: ['artistName', 'genre']
            }
        ],
        platforms: ['twitter', 'instagram', 'tiktok']
    });
}
