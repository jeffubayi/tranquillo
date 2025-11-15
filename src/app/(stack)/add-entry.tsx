
import { Button } from '@/components/button/Button';
import { Input } from '@/components/input/Input';
import { APP_COLORS } from '@/constants/colors';
import { useHandleJournalEntryCreation } from '@/features/journal-entries/hooks/useHandleJournalEntryCreation';
import { useCurrentUserProfile } from '@/features/profile/hooks/useCurrentUserProfile';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface AIResponse {
  response: string;
  mood_score: number;
  suggested_techniques: string[];
}

export default function AddEntryScreen() {
  const { data: userProfile } = useCurrentUserProfile();

  const userDisplayName = useMemo(() => {
    return userProfile?.username || 'User';
  }, [userProfile]);

  const [content, setContent] = useState('');
  const [moodRating, setMoodRating] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [showResponse, setShowResponse] = useState(false);

  const { handleCreateEntry, createIsPending } = useHandleJournalEntryCreation();

  const shouldDisableSubmit = isSubmitting || createIsPending || content.trim().length === 0;

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('A problem shared is a problem halved. Please share your thoughts.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setShowResponse(false);
    setAiResponse(null);

    try {
      const result = await handleCreateEntry(content, moodRating);

      // If entry was created successfully and has AI data, show the response
      if (result?.aiData) {
        setAiResponse({
          response: result.aiData.ai_response,
          mood_score: result.aiData.mood_score,
          suggested_techniques: result.aiData.themes,
        });
        setShowResponse(true);
      } else {
        // If no AI response, just go back
        router.back();
      }
    } catch (error) {
      console.error('Submit error:', error);
      // Error is already handled in the hook with Alert
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    setContent('');
    setMoodRating(5);
    setAiResponse(null);
    setShowResponse(false);
    router.back();
  };

  const handleChange = (text: string) => {
    if (error) setError(null);
    setContent(text);
  };

  // If showing AI response, display that instead
  if (showResponse && aiResponse) {
    return (
      <ScrollView
        contentContainerStyle={{ padding: 24, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.responseTitle}>Here's what I'm thinking...</Text>

          <View style={styles.responseContainer}>
            <Text style={styles.responseText}>{aiResponse.response}</Text>
          </View>

          <View style={styles.techniquesContainer}>
            <Text style={styles.techniquesTitle}>Suggested Techniques:</Text>
            {aiResponse.suggested_techniques.map((technique, index) => (
              <View key={index} style={styles.techniqueItem}>
                <Text style={styles.techniqueBullet}>•</Text>
                <Text style={styles.techniqueText}>{technique}</Text>
              </View>
            ))}
          </View>

          <View style={styles.moodScoreContainer}>
            <Text style={styles.moodScoreLabel}>Current Mood Rating:</Text>
            <Text style={styles.moodScoreValue}>{aiResponse.mood_score}/10</Text>
          </View>

          <Button title="Done" onPress={handleDone} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 24, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Text style={styles.title}>How are you feeling today, {userDisplayName}?</Text>

        {/* Mood Rating Selector */}
        <View style={styles.moodRatingContainer}>
          <Text style={styles.moodLabel}>Rate your mood (1-10):</Text>
          <View style={styles.ratingButtons}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <Button
                key={rating}
                title={rating.toString()}
                onPress={() => setMoodRating(rating)}
                disabled={isSubmitting}
                // style={[styles.ratingButton, moodRating === rating && styles.ratingButtonActive]}
                // textStyle={[
                //   styles.ratingButtonText,
                //   moodRating === rating && styles.ratingButtonTextActive,
                // ]}
              />
            ))}
          </View>
        </View>

        <Input
          value={content}
          onChangeText={handleChange}
          placeholder="A penny for your thoughts..."
          placeholderTextColor={APP_COLORS['body-text-disabled']}
          multiline
          style={{ minHeight: 100, padding: 16 }}
          inputWrapperStyle={{ borderRadius: 18 }}
          error={error ?? undefined}
        />

        {isSubmitting && (
          <View style={styles.analyzingContainer}>
            <Text style={styles.analyzingText}>
              We're in this together! Reflecting on what you shared...
            </Text>
          </View>
        )}

        <Button
          title={isSubmitting ? 'Logging Your Thoughts...' : 'Log Your Thoughts'}
          onPress={handleSubmit}
          disabled={shouldDisableSubmit}
          loading={isSubmitting}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: 12,
  },
  title: {
    color: APP_COLORS['body-text'],
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 12,
    fontFamily: 'Manrope',
  },
  moodRatingContainer: {
    marginBottom: 16,
  },
  moodLabel: {
    color: APP_COLORS['body-text'],
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 8,
    fontFamily: 'Manrope',
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingButton: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 8,
    backgroundColor: APP_COLORS.offwhite,
    borderWidth: 1,
    borderColor: APP_COLORS['body-text-disabled'],
  },
  ratingButtonActive: {
    backgroundColor: APP_COLORS.secondary,
    borderColor: APP_COLORS.secondary,
  },
  ratingButtonText: {
    color: APP_COLORS['body-text'],
    fontSize: 14,
    fontFamily: 'Manrope',
  },
  ratingButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  analyzingContainer: {
    marginVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 12,
    backgroundColor: APP_COLORS.offwhite,
    borderRadius: 12,
  },
  analyzingText: {
    color: APP_COLORS.secondary,
    fontSize: 12,
    fontWeight: '300',
    fontStyle: 'italic',
    textAlign: 'left',
    fontFamily: 'Manrope',
  },
  responseTitle: {
    color: APP_COLORS['body-text'],
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: 'Manrope',
  },
  responseContainer: {
    backgroundColor: APP_COLORS.offwhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  responseText: {
    color: APP_COLORS['body-text'],
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    fontFamily: 'Manrope',
  },
  techniquesContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  techniquesTitle: {
    color: APP_COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Manrope',
  },
  techniqueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  techniqueBullet: {
    color: APP_COLORS.secondary,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: 'Manrope',
  },
  techniqueText: {
    flex: 1,
    color: APP_COLORS['body-text'],
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
    fontFamily: 'Manrope',
  },
  moodScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: APP_COLORS.offwhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  moodScoreLabel: {
    color: APP_COLORS['body-text'],
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Manrope',
  },
  moodScoreValue: {
    color: APP_COLORS.secondary,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Manrope',
  },
});
