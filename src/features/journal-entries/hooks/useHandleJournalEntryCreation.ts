// features/journal-entries/hooks/useHandleJournalEntryCreation.ts

import { useUpdateJournalEntry } from '@/features/journal-entries/hooks/useUpdateJournalEntry';
import { useJournalEntryAnalysisStore } from '@/features/journal-entries/store/useJournalEntryAnalysisStore';
import { wellnessScoreKeys } from '@/lib/queryKeys';
import { useSupabaseSession } from '@/services/SupabaseAuthProvider';
import { useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { callAIChatFunction } from '../api/callAIChatFunction';
import { useCreateJournalEntry } from './useCreateJournalEntry';

export const useHandleJournalEntryCreation = () => {
  const { session } = useSupabaseSession();
  const userId = session?.user.id;


  const queryClient = useQueryClient();

  const createEntryMutation = useCreateJournalEntry();
  const updateEntryMutation = useUpdateJournalEntry({ language: "en" });
  const { startAnalyzing, stopAnalyzing } = useJournalEntryAnalysisStore();

  const handleCreateEntry = async (content: string, moodRating: number = 5) => {
    if (!userId) {
      Alert.alert('Error', 'User session not found. Please log in again.');
      return;
    }

    let createdEntryId: string | null = null;
    let aiData = null;

    try {
      // Step 1: Create entry with temporary default values
      const createdEntry = await createEntryMutation.mutateAsync({
        userId,
        mood: 'neutral',
        content,
      });

      createdEntryId = createdEntry.id;
      startAnalyzing(createdEntry.id);

      try {
        // Step 2: AI analysis using new chat endpoint
        aiData = await callAIChatFunction(content, moodRating);

        // Step 3: Update entry with AI-generated data
        await updateEntryMutation.mutateAsync({
          id: createdEntry.id,
          mood: aiData.mood,
          mood_score: aiData.mood_score,
          summary: aiData.summary,
          // themes: aiData.themes,
          tip: aiData.tip,
          // localized: userLanguage,
        });

        console.log('Entry created and analyzed successfully:', {
          entryId: createdEntry.id,
          mood: aiData.mood,
          mood_score: aiData.mood_score,
          themes: aiData.themes,
        });
      } catch (aiError) {
        console.error('=================================. AI analysis failed:', aiError);
        // Alert.alert('AI Analysis Error', aiError || 'Failed to analyze journal entry.');
      } finally {
        if (createdEntryId) {
          stopAnalyzing(createdEntryId);
        }
      }

      // Invalidate wellness score to refresh data
      await queryClient.invalidateQueries({
        queryKey: wellnessScoreKeys.detail(userId),
      });

      return {
        ...createdEntry,
        aiData,
      };
    } catch (error) {
      console.error('Error creating journal entry:', error);
      Alert.alert(
        'Creation Error',
        'Failed to create journal entry. Please try again.'
      );
      throw error;
    }
  };

  return {
    handleCreateEntry,
    createIsPending:
      createEntryMutation.isPending || updateEntryMutation.isPending,
  };
};
