import { fetchX } from '@/utils/fetch';

export type User = {
  id: string;
  username: string;
  onboardingCompleted: boolean;
  email: string;
  status: 'active' | 'invited' | 'archived';
  imageUrl?: string;
};

export async function updateOnBoardingStatus({
  onboardingCompleted,
}: {
  onboardingCompleted: boolean;
}) {
  const res = await fetchX(`users/set-onboarding`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ onboardingCompleted }),
  });
  return (await res.json()) as User;
}
