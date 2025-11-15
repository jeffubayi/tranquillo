import { Button } from '@/components/button/Button';
import { ThemedSafeAreaView } from '@/components/layouts/ThemedSafeAreaView';
import { StyleSheet, Text, View, Platform, ScrollView } from 'react-native';
import OnboardingSceneOne from '../scenes/OnboardingSceneOne';
import OnboardingSceneTwo from '../scenes/OnboardingSceneTwo';
import OnboardingSceneThree from '../scenes/OnboardingSceneThree';
import { router } from 'expo-router';

// Conditionally import PagerView only on native platforms
let PagerView: any;
if (Platform.OS !== 'web') {
  PagerView = require('react-native-pager-view').default;
}

export default function OnboardingScreen() {
  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <ThemedSafeAreaView
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        gap: 4,
      }}
    >
      {Platform.OS === 'web' ? (
        <ScrollView style={styles.container}>
          <OnboardingSceneOne />
          <OnboardingSceneTwo />
          <OnboardingSceneThree />
        </ScrollView>
      ) : (
        <PagerView style={styles.container} initialPage={0}>
          <OnboardingSceneOne />
          <OnboardingSceneTwo />
          <OnboardingSceneThree />
        </PagerView>
      )}

      <Button
        title="Get Started"
        onPress={handleGetStarted}
        style={{ marginBottom: 24 }}
      />
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
