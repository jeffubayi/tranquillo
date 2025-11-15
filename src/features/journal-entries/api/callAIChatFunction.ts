// features/journal-entries/api/callAIChatFunction.ts

interface AIChatRequest {
  message: string;
  mood_rating: number;
}

interface AIChatResponse {
  id: string;
  response: string;
  mood_analysis: {
    current_rating: number;
    suggested_techniques: string[];
  };
  timestamp: string;
  usage: {
    tokens_used: number;
    requests_remaining: string;
  };
  theraapi_version: string;
}

interface ProcessedAIData {
  mood: string;
  mood_score: number;
  summary: string;
  themes: string[];
  tip: string;
  ai_response: string;
}

const thera_api = process.env.EXPO_PUBLIC_THERA_API_KEY!;

// Map mood rating to mood string
const getMoodFromRating = (rating: number): string => {
  if (rating <= 2) return 'very_negative';
  if (rating <= 4) return 'negative';
  if (rating <= 6) return 'neutral';
  if (rating <= 8) return 'positive';
  return 'very_positive';
};

export const callAIChatFunction = async (
  content: string,
  moodRating: number
): Promise<ProcessedAIData> => {
  try {
    const response = await fetch('https://sgkucjwmpwqewpdgjocq.supabase.co/functions/v1/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer {thera_api}`,
      },
      body: JSON.stringify({
        message: content,
        mood_rating: moodRating,
      } as AIChatRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Chat API error: ${response.status} - ${errorText}`);
    }

    const data: AIChatResponse = await response.json();
    console.log('===========> AI Chat API response received: ===========>', data);
    // Process the response to match your database schema
    const processedData: ProcessedAIData = {
      mood: getMoodFromRating(data.mood_analysis.current_rating),
      mood_score: data.mood_analysis.current_rating,
      summary: data.response.length > 200 ? data.response.substring(0, 200) + '...' : data.response,
      themes: data.mood_analysis.suggested_techniques || [],
      tip: data.mood_analysis.suggested_techniques?.[0] || 'Take a moment to breathe and reflect',
      ai_response: data.response,
    };

    console.log('AI Chat API response processed:', {
      id: data.id,
      mood: processedData.mood,
      mood_score: processedData.mood_score,
      techniques: data.mood_analysis.suggested_techniques,
    });

    return processedData;
  } catch (error) {
    console.error('Error calling AI chat function:', error);
    throw error;
  }
};
