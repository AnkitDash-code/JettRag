/**
 * LLM Engine for Cloud9 Assistant Coach
 * Supports browser-based AI (Transformers.js) and optional API integration
 */

import { pipeline } from '@xenova/transformers';

export class LLMEngine {
  private static instance: LLMEngine | null = null;
  private model: any = null;
  private loading: boolean = false;
  private modelLoaded: boolean = false;

  static async getInstance(): Promise<LLMEngine> {
    if (!LLMEngine.instance) {
      LLMEngine.instance = new LLMEngine();
    }
    return LLMEngine.instance;
  }

  async initialize() {
    if (this.modelLoaded || this.loading) return;

    this.loading = true;
    console.log('🤖 Loading LLM model (first time may take 30s)...');

    try {
      // Use a smaller, faster model for browser
      this.model = await pipeline(
        'text2text-generation',
        'Xenova/LaMini-Flan-T5-783M',
        { quantized: true }
      );

      this.modelLoaded = true;
      console.log('✅ LLM model ready!');
    } catch (error) {
      console.error('❌ Failed to load LLM model:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async generate(prompt: string, maxTokens: number = 500): Promise<string> {
    if (!this.modelLoaded) {
      await this.initialize();
    }

    if (!this.model) {
      throw new Error('LLM model not loaded');
    }

    try {
      const result = await this.model(prompt, {
        max_new_tokens: maxTokens,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
      });

      return result[0].generated_text;
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.modelLoaded;
  }
}

/**
 * Alternative: Use Groq API for faster, better quality responses
 * Free tier available, no credit card required
 */
export async function generateWithGroq(
  prompt: string,
  apiKey: string = ''
): Promise<string> {
  const GROQ_API_KEY = apiKey || process.env.NEXT_PUBLIC_GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not provided');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: 'You are an expert VALORANT esports coach and analyst with deep knowledge of competitive tactics, player performance metrics, and strategic decision-making.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Use OpenAI API (requires API key from user)
 */
export async function generateWithOpenAI(
  prompt: string,
  apiKey: string
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert VALORANT esports coach and analyst.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Unified generate function with automatic backend selection
 */
export async function generateText(
  prompt: string,
  options: {
    useGroq?: boolean;
    useOpenAI?: boolean;
    apiKey?: string;
  } = {}
): Promise<string> {
  // Try Groq first if API key is available (fastest, best quality)
  const groqKey = options.apiKey || process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (groqKey && groqKey !== 'your_groq_api_key_here') {
    try {
      console.log('🚀 Using Groq API (GPT-OSS-120B)...');
      return await generateWithGroq(prompt, groqKey);
    } catch (error) {
      console.error('❌ Groq API failed:', error);
      throw new Error(`Groq API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Try OpenAI if API key provided
  if (options.useOpenAI && options.apiKey) {
    try {
      console.log('🚀 Using OpenAI API...');
      return await generateWithOpenAI(prompt, options.apiKey);
    } catch (error) {
      console.error('❌ OpenAI API failed:', error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // No API key configured - throw error instead of falling back to browser AI
  throw new Error('No API key configured. Please add NEXT_PUBLIC_GROQ_API_KEY to .env.local');
}
