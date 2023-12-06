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
