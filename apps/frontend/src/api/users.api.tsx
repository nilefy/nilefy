import { fetchX, FetchXError } from '@/utils/fetch';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from '@tanstack/react-query';

const USERS_QUERY_KEY = 'users';
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

function useCurrentUser() {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, 'current'],
    queryFn: async () => {
      const res = await fetchX('auth/me');
      return (await res.json()) as User;
    },
  });
}

async function update(
  data: Partial<Pick<User, 'username'> & { password: string }>,
) {
  const res = await fetchX(`/users`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });
  return await res.json();
}
function useUpdateUser(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof update>>,
    FetchXError,
    Parameters<typeof update>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: update,
    ...options,
  });
  return mutate;
}

export const users = {
  currentUser: { useQuery: useCurrentUser },
  updateCurrentUser: { useMutation: useUpdateUser },
};
