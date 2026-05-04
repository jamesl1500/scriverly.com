'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/libs/apiClient';

export interface PlanUsage {
  plan:     string;
  analysis: { used: number; limit: number | null };
  outline:  { used: number; limit: number | null };
}

export function useCurrentPlan() {
  return useQuery<PlanUsage>({
    queryKey: ['user-plan'],
    queryFn:  async () => {
      const res = await apiClient.get<{ success: true; data: PlanUsage }>('/user/plan');
      return res.data.data;
    },
    staleTime: 60 * 1000, // re-fetch at most once per minute
  });
}
