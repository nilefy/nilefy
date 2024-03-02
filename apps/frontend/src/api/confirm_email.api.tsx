import { fetchX } from '@/utils/fetch';
import { useQuery } from '@tanstack/react-query';

export const confirmEmail = async (
  confirmationData: EmailConfirmationData,
): Promise<ConfirmationResponse> => {
  console.log('right before the call');
  const response = await fetchX(
    `auth/confirm/${confirmationData.email}/${confirmationData.jwt}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
  );

  console.log('Right after the call');
  const data = await response.json();
  console.log(data);
  return data;
};
export interface EmailConfirmationData {
  email: string | undefined;
  jwt: string | undefined;
}

interface ConfirmationResponse {
  message: string;
}

export function useConfirmEmail(email: string, token: string) {
  const pages = useQuery({
    // todo fix this
    // todo edit email_confimration.tsx
    queryKey: [PAGES_QUERY_KEY, { workspaceId, appId }],
    queryFn: async () => await fetchPages({ workspaceId, appId }),
    staleTime: 0,
  });
  return pages;
}
