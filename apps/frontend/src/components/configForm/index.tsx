import { InspectorFormControls } from './formControls';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { WidgetInspectorConfig } from '@webloom/configpaneltypes';

type GenericConfig = WidgetInspectorConfig<Record<string, unknown>>;
export type ConfigFormGenricOnChange = (key: string, newValue: unknown) => void;
export const FormContext = createContext<{
  onChange: ConfigFormGenricOnChange;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}>({} as any);
export const FormControlContext = createContext<{
  onChange: (newValue: unknown) => void;
  id?: string;
  toProperty?: string;
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

const FormSection = (props: {
  section: GenericConfig[number];
  itemProps: Record<string, unknown>;
}) => {
  const { section, itemProps } = props;
  return (
    <FormSectionView sectionName={section.sectionName}>
      {section.children.map((control) => {
        return (
          <FormControl
            key={control.id}
            control={control}
            itemProps={itemProps}
          />
        );
      })}
    </FormSectionView>
  );
};

const FormControl = (props: {
  control: GenericConfig[number]['children'][number];
  itemProps: Record<string, unknown>;
}) => {
  const { onChange } = useContext(FormContext);
  const { control, itemProps } = props;
  const Component = InspectorFormControls[control.type];
  const options = useMemo(
    () => ({
      ...control,
      ...control.options,
      value: itemProps[control.key],
    }),
    [control, itemProps],
  );
  const onChangeCallback = useCallback(
    (newValue: unknown) => {
      onChange(control.key, newValue);
    },
    [onChange, control.key],
  );
  const contextValue = useMemo(
    () => ({ onChange: onChangeCallback }),
    [onChangeCallback],
  );
  return (
    <FormControlContext.Provider value={contextValue} key={control.id}>
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        <Component {...options} />
      }
    </FormControlContext.Provider>
  );
};
/**
 *  use useCallback before passing onChange to FormSection
 */
export const ConfigForm = ({
  config: inspectorConfig,
  onChange,
  itemProps,
}: {
  config: GenericConfig;
  onChange: ConfigFormGenricOnChange;
  itemProps: Record<string, unknown>;
}) => {
  const contextValue = useMemo(() => ({ onChange }), [onChange]);
  return inspectorConfig.map((section) => (
    <FormContext.Provider value={contextValue} key={section.sectionName}>
      <FormSection section={section} itemProps={itemProps} />
    </FormContext.Provider>
  ));
};
