export const inspectorConfig: WidgetInspectorConfig<WebloomInputProps> = [
  {
    sectionName: 'Rest API',
    children: [
      {
        id: `restapi-url`,
        key: 'type',
        label: 'Type',
        type: 'select',
        options: {
          items: [
            {
              label: 'Text',
              value: 'text',
            },
            {
              label: 'Number',
              value: 'number',
            },
            {
              label: 'Password',
              value: 'password',
            },
          ],
          placeholder: 'Select type',
        },
      },
      {
        id: `restapi-placeholder`,
        key: 'placeholder',
        label: 'Placeholder',
        type: 'input',
        options: {
          placeholder: 'Enter placeholder',
          type: 'text',
        },
      },
    ],
  },
  {
    sectionName: 'Label',
    children: [
      {
        id: `restapi-label`,
        key: 'label',
        label: 'Label',
        type: 'input',
        options: {
          placeholder: 'Enter label',
          type: 'text',
        },
      },
    ],
  },
];
