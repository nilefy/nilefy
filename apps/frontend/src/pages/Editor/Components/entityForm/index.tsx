import { editorStore } from '@/lib/Editor/Models';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { observer } from 'mobx-react-lite';
import {
  Collapsible,
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
      asChild
    >
      <div className="pb-5 pt-3">
        <div className="flex items-center justify-between space-x-4">
          <h3 className="text-lg font-semibold text-gray-800">{sectionName}</h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              {opened ? <ChevronDown /> : <ChevronUp />}
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-5">
          {children}
        </CollapsibleContent>
      </div>
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
        editorStore.getEntityById(entityId)!.setValue(control.path, newValue);
      },
      [control.path, entityId],
    );

    const contextValue = {
      onChange,
      id,
      entityId,
      path: control.path,
      value: editorStore.getEntityById(entityId)!.getRawValue(control.path),
      onFocus,
      onBlur,
    };
    return (
      <EntityFormControlContext.Provider value={contextValue}>
        <FormControlWrapper
          entityId={entityId}
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
export const DefaultSection = observer(
  (props: { section: EntityInspectorConfig[number]; selectedId: string }) => {
    const { section, selectedId } = props;
    return (
      <FormSectionView sectionName={section.sectionName}>
        {section.children.map((control) => {
          const id = `${selectedId}-${control.path}`;
          return (
            <EntityFormControl
              key={id}
              control={control}
              entityId={selectedId}
            />
          );
        })}
      </FormSectionView>
    );
  },
);
const FormControlWrapper = observer(
  (
    props: {
      children: React.ReactNode;
      type: InspectorFormControlsTypes;
      id: string;
      entityId: string;
      hidden?: (props: Record<string, unknown>) => boolean;
    } & BaseControlProps,
  ) => {
    if (
      props.hidden &&
      props.hidden(editorStore.getEntityById(props.entityId)!.finalValues)
    )
      return null;
    return (
      <ErrorPopover>
        <div className="flex w-full flex-col  gap-1">
          <Label
            className="text-sm font-medium text-gray-600"
            htmlFor={props.id}
          >
            {props.label}
          </Label>
          {props.children}
        </div>
      </ErrorPopover>
    );
  },
);
