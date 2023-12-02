interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

type BaseControlProps = {
  id: string;
  label: string;
  defaultValue?: string | number;
  value?: string | number;
};

// each widget props
type InspectorInputProps = Partial<
  Pick<InputProps, "type" | "placeholder" | "max" | "min">
>;

type InspectorSelectProps = {
  items: { label: string; value: string }[];
  placeholder?: string;
};
type InspectorColorProps = {
  color: string;
};

type InspectorEvents = {
  
};
type EventManagerButton = {
  
};

// config panel types
type FormControlOptions = {
  input: InspectorInputProps;
  select: InspectorSelectProps;
  color: InspectorColorProps;
  event: InspectorEvents;
  EventManagerButton: EventManagerButton;
};

type MappedTypeToArray<T> = T extends { [K in keyof T]: infer U } ? U[] : never;
type WidgetInspectorConfig<TProps> = {
  sectionName: string;
  children: MappedTypeToArray<{
    [key in keyof TProps]: {
      [key2 in InspectorFormControls]: {
        type: key2;
        key: key;
        options: FormControlOptions[key2];
        label: string;
      } & BaseControlProps;
    }[InspectorFormControls];
  }>;
}[];

type InspectorFormControls = keyof FormControlOptions;

export type {
  BaseControlProps,
  InspectorInputProps,
  InspectorSelectProps,
  WidgetInspectorConfig,
  InspectorFormControls,
  InspectorColorProps,
  InspectorEvents,
  EventManagerButton,
};
