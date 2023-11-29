import { useState } from 'react';
import { Page as IPage } from './pageSelector';
import RenameInput from './renameInput';
import PageMenu from './pageMenu';

function Page({
  workspaceId,
  appId,
  page,
}: {
  workspaceId: number;
  appId: number;
  page: IPage;
}) {
  const isHidden = page?.visible || null;
  const isEnabled = page?.enabled || null;
  const [isHovered, setIsHovered] = useState(false);
  //   const isHomePage = false; //TODO : should come from the app
  const [isEditingPageName, setIsEditingPageName] = useState(false);

  if (isEditingPageName) {
    return <RenameInput page={page} updateEditMode={setIsEditingPageName} />;
  }
  //TODO : use the defined booleans (isHidden,isEnabled ,etc... ) to render the suitable icon or not render the page at all
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={` flex flex-row items-center justify-between p-2 `}
    >
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
