import { useState } from 'react';
import RenameInput from './renameInput';
import PageMenu from './pageMenu';
import { PageDto } from '@/api/pages.api';

function Page({
  workspaceId,
  appId,
  page,
}: {
  workspaceId: number;
  appId: number;
  page: PageDto;
}) {
  const isEnabled = page?.enabled || null;
  //   const isHomePage = false; //TODO : should come from the app
  const [isEditingPageName, setIsEditingPageName] = useState(false);

  if (isEditingPageName) {
    return <RenameInput page={page} updateEditMode={setIsEditingPageName} />;
  }
  //TODO : use the defined booleans (isHidden,isEnabled ,etc... ) to render the suitable icon or not render the page at all

  return (
    <div className={` flex flex-row items-center justify-between p-2 `}>
      <p className="text-[15px]">{page.name}</p>
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
