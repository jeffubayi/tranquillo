export const generateMoodTipMessage = (
  mood: string | undefined,
  tip: string
) => {
  if (!mood) {
    return {
      intro: 'Here’s a tip for today:',
      tip,
    };
  }

  const lowercaseMood = mood
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  // const capitalizedMood = mood.charAt(0).toUpperCase() + mood.slice(1);

  return {
    intro: `Based on your last entry, you felt ${lowercaseMood}.`,
    tip,
  };
};
