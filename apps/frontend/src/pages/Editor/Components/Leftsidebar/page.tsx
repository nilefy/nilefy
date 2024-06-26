import { useState } from 'react';
import RenameInput from '../../../../components/renameInput';

import { PageDto } from '@/api/pages.api';
import { Button } from '@/components/ui/button';
import PageMenu from './pageMenu';
import { useNavigateToEditorPage } from '@/lib/Editor/hooks';

function Page({
  workspaceId,
  appId,
  page,
}: {
  workspaceId: number;
  appId: number;
  page: PageDto;
}) {
  const [isEditingPageName, setIsEditingPageName] = useState(false);
  const navigate = useNavigateToEditorPage(page.id);
  if (isEditingPageName) {
    return <RenameInput page={page} updateEditMode={setIsEditingPageName} />;
  }
  // const openPageCallback = useCallback(() => {}, [appId, pageId, workspaceId]);

  return (
    <div className={` flex flex-row items-center justify-between p-2 `}>
      <Button
        variant={'ghost'}
        className="text-[15px]"
        onClick={() => {
          navigate();
        }}
      >
        {page.name}
      </Button>
      <PageMenu
        page={page}
        workspaceId={workspaceId}
        appId={appId}
        updateEditMode={setIsEditingPageName}
      />
    </div>
  );
}

export default Page;
