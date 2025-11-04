import { userProfileKeys } from '@/lib/queryKeys';
import { supabase } from '@/services/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type UserProfileUpdate = {
  first_name?: string;
  emotion_check?: string;
  bio?: string;
  onboarded?: boolean;
};

export function useUpdateUserProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: UserProfileUpdate) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: updates.first_name,
          onboarded: updates.onboarded,
        })
        .eq('id', userId)
        .select('*')
        .maybeSingle();

      if (error) throw error;
      return { first_name: data.first_name, ...data };
    },
    onSuccess: (data) => {
      if (!data) return;
      queryClient.setQueryData(userProfileKeys.detail(userId), data);
    },
  });
}
