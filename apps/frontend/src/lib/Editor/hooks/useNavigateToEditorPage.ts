import { useNavigate } from 'react-router-dom';
import { editorStore } from '../Models';

export const useNavigateToEditorPage = (id: string | number) => {
  const naviagte = useNavigate();
  return () => {
    if (id == editorStore.currentPageId) return;
    naviagte(`./${id}`);
  };
};
