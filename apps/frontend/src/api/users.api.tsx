export type User = {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'invited' | 'archived';
  imageUrl?: string;
};
