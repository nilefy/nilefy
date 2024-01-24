export const apiConfig: ApiConfig<ApiInputProps>[] = [
  {
    sectionName: 'Connection',
    children: [
      {
        id: 'base_url',
        key: 'base_url',
        label: 'Base URL',
        type: 'input',
        options: {
          placeholder: 'Enter base URL',
          type: 'text',
        },
      },
      {
        id: 'bearer_token',
        key: 'bearer_token',
        label: 'Bearer Token',
        type: 'input',
        options: {
          placeholder: 'Enter bearer token (JWT)',
          type: 'text',
        },
      },
      {
        id: 'auth_type',
        key: 'auth_type',
        label: 'Authentication Type',
        type: 'select',
        options: {
          type: 'text',
          items: [
            {
              label: 'Bearer',
              value: 'bearer',
            },
            {
              label: 'basic',
              value: 'basic',
            },
            {
              label: 'OAuth2',
              value: 'oauth2',
            },
          ],
          placeholder: 'select authentication type',
        },
      },
      // Add other configuration options based on your needs
    ],
  },
  {
    sectionName: 'Credentials',
    children: [
      {
        id: 'user_name',
        key: 'user_name',
        label: 'Username',
        type: 'input',
        options: {
          placeholder: 'Enter username',
          type: 'text',
        },
      },
      {
        id: 'password',
        key: 'password',
        label: 'Password',
        type: 'input',
        options: {
          placeholder: 'Enter password',
          type: 'password',
        },
      },
      // Add other credential-related options
    ],
  },
  {
    sectionName: 'Client Details',
    children: [
      {
        id: 'client_id',
        key: 'client_id',
        label: 'Client ID',
        type: 'input',
        options: {
          placeholder: 'Enter client ID',
          type: 'text',
        },
      },
      {
        id: 'client_secret',
        key: 'client_secret',
        label: 'Client Secret Type',
        type: 'input',
        options: {
          placeholder: 'Enter client secret type',
          type: 'text',
        },
      },
    ],
  },
];

export interface ApiConfig<T> {
  sectionName: string;
  children: ApiConfigItem<T>[];
}

export interface ApiConfigItem<T> {
  id: string;
  key: keyof T;
  label: string;
  type: 'input' | 'select';
  options: {
    placeholder: string;
    type: string;
    items?: { label: string; value: string }[];
  };
}

export type ApiInputProps = {
  base_url: string;
  bearer_token: string;
  auth_type: string;
  user_name: string;
  password: string;
  client_id: string;
  client_secret: string;  
};

export const queryConfig: QueryConfig<QueryT>[] = [
  {
    sectionName: 'Query Details',
    children: [
      {
        id: 'name',
        key: 'name',
        label: 'Query Name',
        type: 'input',
        options: {
          placeholder: 'Enter query name',
          type: 'text',
        },
      },
      {
        id: 'endpoint',
        key: 'endpoint',
        label: 'Endpoint',
        type: 'input',
        options: {
          placeholder: 'Enter endpoint',
          type: 'text',
        },
      },
      {
        id: 'method',
        key: 'method',
        label: 'HTTP Method',
        type: 'select',
        options: {
          type: 'text',
          items: [
            {
              label: 'GET',
              value: 'GET',
            },
            {
              label: 'POST',
              value: 'POST',
            },
            // Add other HTTP methods as needed
          ],
          placeholder: 'Select HTTP method',
        },
      },
    ],
  },
  {
    sectionName: 'Headers',
    children: [
      {
        id: 'headers',
        key: 'headers',
        label: 'Headers',
        type: 'array',
        options: {
          placeholder: 'Enter headers',
          type: 'text',
        },
      },
    ],
  },
  {
    sectionName: 'Parameters',
    children: [
      {
        id: 'params',
        key: 'params',
        label: 'Parameters',
        type: 'object',
        options: {
          placeholder: 'Enter parameters',
          type: 'text',
        },
      },
    ],
  },
  {
    sectionName: 'Body',
    children: [
      {
        id: 'body',
        key: 'body',
        label: 'Request Body',
        type: 'input',
        options: {
          placeholder: 'Enter request body',
          type: 'text',
        },
      },
    ],
  },

];

export interface QueryConfig<T> {
  sectionName: string;
  children: QueryConfigItem<T>[];
}

export interface QueryConfigItem<T> {
  id: string;
  key: keyof T;
  label: string;
  type: 'input' | 'select' | 'array' | 'object'; // Add other types as needed
  options: {
    placeholder: string;
    type: string;
    items?: { label: string; value: string }[];
  };
}

export type QueryT = {
  name: string;
  endpoint: string;
  method: string;
  headers: [string, string][];
  params: Record<string, unknown>;
  body: string;
};
