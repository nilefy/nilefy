import { editorStore } from '@/lib/Editor/Models';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { commandManager } from '@/Actions/CommandManager';
import { ChangePropAction } from '@/Actions/Editor/changeProps';

import { observer } from 'mobx-react-lite';
import { Collapsible } from '@radix-ui/react-collapsible';
import {
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  BaseControlProps,
  EntityInspectorConfig,
  InspectorFormControlsTypes,
} from '@/lib/Editor/interface';
import { InspectorFormControls } from './formControls';
import { ErrorPopover } from './formControls/errorPopover';

export const EntityFormControlContext = createContext<{
  onChange: (newValue: unknown) => void;
  entityId: string;
  id: string;
  path: string;
  value: unknown;
  onFocus: () => void;
  onBlur: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}>({} as any);
export const FormSectionView = (props: {
  children: React.ReactNode;
  sectionName: string;
}) => {
  const { children, sectionName } = props;
  const [opened, setOpened] = useState(true);
  return (
    <Collapsible
      open={opened}
      onOpenChange={setOpened}
      className="h-full w-full space-y-2"
      key={sectionName}
    >
      <div className="flex items-center justify-between space-x-4">
        <h4 className="text-sm font-semibold">{sectionName}</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            {opened ? <ChevronDown /> : <ChevronUp />}
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-5">{children}</CollapsibleContent>
    </Collapsible>
  );
};
export const EntityFormContext = createContext<{
  focusedPath: string | null;
  onFocus: (path: string) => void;
  onBlur: () => void;
}>({} as any);
export const EntityForm = observer(
  ({ children }: { children: React.ReactNode }) => {
    const [focusedPath, setFocusedPath] = useState<string | null>(null);
    const onBlur = useCallback(() => {
      setFocusedPath(null);
    }, []);
    const contextValue = useMemo(
      () => ({
        focusedPath,
        onFocus: setFocusedPath,
        onBlur,
      }),
      [focusedPath, onBlur],
    );
    return (
      <EntityFormContext.Provider value={contextValue}>
        {children}
      </EntityFormContext.Provider>
    );
  },
);

export const EntityFormControl = observer(
  (props: {
    control: EntityInspectorConfig[number]['children'][number];
    entityId: string;
  }) => {
    const { onFocus: _onFocus, onBlur } = useContext(EntityFormContext);
    const { control, entityId } = props;
    const id = entityId + control.path;

    const Component = InspectorFormControls[control.type];
    const options = useMemo(
      () => ({
        ...control,
        ...control.options,
      }),
      [control],
    );
    const onFocus = useCallback(() => {
      _onFocus(control.path);
    }, [_onFocus, control.path]);

    const onChange = useCallback(
      (newValue: unknown) => {
        commandManager.executeCommand(
          new ChangePropAction(entityId, control.path, newValue),
        );
      },
      [control.path, entityId],
    );
    const contextValue = {
      onChange,
      id,
      entityId,
      path: control.path,
      value: editorStore.currentPage
        .getWidgetById(entityId)
        .getRawValue(control.path),
      onFocus,
      onBlur,
    };
    return (
      <EntityFormControlContext.Provider value={contextValue}>
        <FormControlWrapper
          type={options.type as InspectorFormControlsTypes}
          id={id}
          label={control.label}
        >
          {/* @ts-expect-error ignore */}
          <Component {...options} key={control.id} />
        </FormControlWrapper>
      </EntityFormControlContext.Provider>
    );
  },
);

const FormControlWrapper = observer(
  (
    props: {
      children: React.ReactNode;
      type: InspectorFormControlsTypes;
      id: string;
    } & BaseControlProps,
  ) => {
    return (
      <div>
        <Label htmlFor={props.id}>{props.label}</Label>
        {props.children}
        <ErrorPopover />
      </div>
    );
  },
);
