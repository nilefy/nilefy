import { commandManager } from '@/actions/CommandManager';
import { RemoteSelectEntity } from '@/actions/Editor/remoteSelectEntity';
import { Button } from '@/components/ui/button';
import { editorStore } from '@/lib/Editor/Models';
import { entries } from 'lodash';
import { X, XCircle } from 'lucide-react';
import { observer } from 'mobx-react-lite';

export const DebugPanel = observer(() => {
  const errors = editorStore.currentPageErrors;
  return (
    <div className="h-full w-full">
      <header className="flex w-full items-center justify-between border-b p-2">
        <h2 className="font-bold">Errors</h2>
        <Button
          variant={'ghost'}
          title="Close"
          onClick={() => {
            editorStore.setBottomPanelMode('query');
          }}
        >
          <X size={24} />
        </Button>
      </header>
      <div className="divide-y">
        {entries(errors).map(([entity, errClasses]) => {
          return entries(errClasses).map(([errClass, errMessages]) => {
            return entries(errMessages).map(([errorPath, errors]) => {
              return errors.map((error, i) => {
                return (
                  <div
                    key={`err${entity}${errClass}${errorPath}${i}`}
                    className="flex items-center gap-1 bg-[#fff2f2] p-2 text-sm"
                  >
                    <XCircle size={16} color="red" />
                    <div>
                      {`${errClass}: `}
                      <Button
                        variant={'link'}
                        className="p-0"
                        onClick={() => {
                          commandManager.executeCommand(
                            new RemoteSelectEntity(entity),
                          );
                        }}
                      >{`${entity} `}</Button>
                    </div>
                    <div>{`${error}`}</div>
                    <Button
                      variant={'link'}
                      className="ml-auto p-0"
                      onClick={() => {
                        commandManager.executeCommand(
                          new RemoteSelectEntity(entity),
                        );
                      }}
                    >
                      {' '}
                      {`${entity}.${errorPath}`}
                    </Button>
                  </div>
                );
              });
            });
          });
        })}
      </div>
    </div>
  );
});
