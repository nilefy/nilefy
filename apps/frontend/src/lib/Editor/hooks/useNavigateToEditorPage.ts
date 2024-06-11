import { useNavigate } from 'react-router-dom';

export const useNavigateToEditorPage = (id: string | number) => {
  const naviagte = useNavigate();
  return () => {
    naviagte(`./${id}`);
  };
};
