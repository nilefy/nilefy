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
  FormControl,
  InspectorFormControlsTypes,
} from '@/lib/Editor/interface';
import { InspectorFormControls } from './formControls';
import { ErrorPopover } from './formControls/errorPopover';
import { cn } from '@/lib/cn';

export const EntityFormControlContext = createContext<{
  onChange: (newValue: unknown) => void;
  entityId: string;
  id: string;
  path: string;
  value: unknown;
  onFocus: () => void;
  onBlur: () => void;
  isEvent?: boolean;
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
  (props: { control: FormControl; entityId: string }) => {
    const { onFocus: _onFocus, onBlur } = useContext(EntityFormContext);
    const { control, entityId } = props;
    const id = entityId + '-' + control.path;
    const Component =
      InspectorFormControls[control.type as keyof typeof InspectorFormControls];
    const options = useMemo(
      () => ({
        ...control,
        // @ts-expect-error ignore
        ...(control.options ?? []),
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
    const value = editorStore
      .getEntityById(entityId)!
      .getRawValue(control.path);
    const contextValue = useMemo(
      () => ({
        onChange,
        id,
        entityId,
        path: control.path,
        value: value,
        onFocus,
        onBlur,
        isEvent: control.isEvent,
      }),
      [
        onChange,
        id,
        entityId,
        control.path,
        onFocus,
        onBlur,
        value,
        control.isEvent,
      ],
    );

    return (
      <EntityFormControlContext.Provider value={contextValue}>
        <FormControlWrapper
          entityId={entityId}
          type={options.type as InspectorFormControlsTypes}
          id={id}
          label={control.label}
          path={control.path}
          hidden={options.hidden}
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
export type ComparisonOperations =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'LESSER'
  | 'GREATER'
  | 'IN'
  | 'NOT_IN';

type Condition = {
  path: string;
  value: any;
  comparison: ComparisonOperations;
};
export interface ConditionObject {
  conditionType: 'AND' | 'OR';
  conditions: Conditions;
}

export type Conditions = Array<Condition> | ConditionObject;

export type IsHidden<T = Record<string, unknown>> =
  | ((args: {
      store: typeof editorStore;
      entityId: string;
      finalValues: T;
    }) => boolean)
  | boolean
  | Condition
  | ConditionObject;

export const calculateIsHidden = (
  hidden: IsHidden,
  entityId: string,
): boolean => {
  if (typeof hidden === 'boolean') {
    return hidden;
  }

  if (typeof hidden === 'function') {
    return hidden({
      store: editorStore,
      entityId,
      finalValues: editorStore.getEntityById(entityId)!.finalValues,
    });
  }
  if (Array.isArray(hidden)) {
    return applyBooleanOperator(evaluateConditions(hidden, entityId), 'OR');
  }
  if ('conditionType' in hidden) {
    return evaluateConditionObject(hidden, entityId);
  }
  return evaluateCondition(
    hidden as Condition,
    editorStore
      .getEntityById(entityId)
      ?.getRawValue((hidden as Condition).path),
  );
};

const applyBooleanOperator = (
  conditions: Array<boolean>,
  conditionType: 'AND' | 'OR',
): boolean => {
  if (conditionType === 'AND') {
    return conditions.every((condition) => condition);
  }
  return conditions.some((condition) => condition);
};

const evaluateConditionObject = (
  conditionObject: ConditionObject,
  entityId: string,
): boolean => {
  const conditions = conditionObject.conditions;
  if (Array.isArray(conditions)) {
    return applyBooleanOperator(
      evaluateConditions(conditions, entityId),
      conditionObject.conditionType,
    );
  }
  return applyBooleanOperator(
    [evaluateConditionObject(conditions, entityId)],
    conditionObject.conditionType,
  );
};

const evaluateConditions = (conditions: Conditions, entityId: string) => {
  if (Array.isArray(conditions)) {
    return conditions.map((condition) =>
      evaluateCondition(
        condition,
        editorStore.getEntityById(entityId)!.getRawValue(condition.path),
      ),
    );
  }
  return [evaluateConditionObject(conditions, entityId)];
};

const evaluateCondition = (condition: Condition, valueAtPath: any) => {
  const value = condition.value;
  switch (condition.comparison) {
    case 'EQUALS':
      return valueAtPath === value;
    case 'NOT_EQUALS':
      return valueAtPath !== value;
    case 'GREATER':
      return valueAtPath > value;
    case 'LESSER':
      return valueAtPath < value;
    case 'IN':
      return Array.isArray(value) && value.includes(valueAtPath);
    case 'NOT_IN':
      return Array.isArray(value) && !value.includes(valueAtPath);
    default:
      return true;
  }
};

const FormControlWrapper = observer(
  (
    props: {
      children: React.ReactNode;
      type: InspectorFormControlsTypes;
      id: string;
      entityId: string;
      path: string;
      hidden?: IsHidden;
    } & BaseControlProps,
  ) => {
    const entity = editorStore.getEntityById(props.entityId);
    if (props.hidden && calculateIsHidden(props.hidden, props.entityId))
      return null;
    return (
      <ErrorPopover>
        <div className="flex w-full flex-col gap-1">
          <Label
            className="text-sm font-medium text-gray-600"
            htmlFor={props.id}
          >
            {props.label}
          </Label>
          <div
            className={cn({
              'border-red-500 border rounded-sm': entity?.pathHasErrors(
                props.path,
              ),
            })}
          >
            {props.children}
          </div>
        </div>
      </ErrorPopover>
    );
  },
);
