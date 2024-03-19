# Developing 

- create branch `git checkout -b feat/MY_BRANCH_NAME` to know how to name your branch please check [How To Name a Branch](#how-to-name-a-branch)

- use the guidelines for commit messages please check [Commit Guidelines](#commit-guidelines)

- create pull request

## How To Name a Branch

The branch name will consist of a pattern like the following

```sh
{type}/{number}-short-name-of-{feature/issue/ticket}
```

where

- type is required
- number is optional

Examples of branch are

##### feature branches

```
feat/114-authentication
feat/114-auth
```

##### bug fix branches

```sh
fix/115-auth
fix/115-auth-error
fix/115-auth-issue
```

##### docs branches

```sh
docs/116-how-to-auth
docs/how-to-auth
docs/websockets
```

### types

- **chore**: Regular code maintenance
- **feat**: The new feature you're introducing
- **fix**: A bug fix
- **test**: Everything related to testing
- **ui**: Feature and updates related to UI/UX
- **refactor**: Refactoring a specific section of the codebase
- **docs**: Everything related to documentation

## Commit Guidelines

- We encourage [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format for your commit messages.
- Keep your commit messages concise, clear, and descriptive.
- Make sure to include a brief summary of the changes made in the commit.

```sh
# The commit message should be structured as follows:

<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

```

Example Commit Message:

```sh
feat(auth): Add new authentication module
```

## setting up google auth for development

follow this link to know how to create google cloud project for testing [https://support.google.com/cloud/answer/6158849?hl=en#zippy=](https://support.google.com/cloud/answer/6158849?hl=en#zippy=) or this(choose your fighter) [https://medium.com/@flavtech/google-oauth2-authentication-with-nestjs-explained-ab585c53edec](https://medium.com/@flavtech/google-oauth2-authentication-with-nestjs-explained-ab585c53edec)

## solve a lot of `git checkout`

if your workflow normally like the following

```sh
git checkout branch
pnpm i 
pnpm db:push(drop database && create database && pnpm db:push && pnpm db:seed)
```

you could use this git hook to automate those steps, to know more about git hooks check

- [https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [https://www.atlassian.com/git/tutorials/git-hooks](https://www.atlassian.com/git/tutorials/git-hooks)

we will use `post-checkout` event, follow those steps to enable the hook

- `touch .git/hooks/post-checkout`

- copy this script to the created file(please note i wrote this script for zsh and the database interaction is done through `docker`, but i will mark the parts i think needs changes for other shells)

    ```sh
    #!/bin/zsh

    echo "----------------------------"
    echo "Running post-checkout script"

    # Save the original stdin file descriptor
    echo "Running git pull"
    exec 3<&0
    git pull </dev/tty || exit 1
    # Restore the original stdin
    exec 0<&3

    pnpm i

    # redirect stdin to pnpm db:push
    # Save the original stdin file descriptor
    exec 3<&0
    pnpm db:push </dev/tty
    # Restore the original stdin
    exec 0<&3

    # Check the exit status of the command
    if [ $? -ne 0 ]; then
        # THIS PART NEEDS TO CHANGE FOR OTHER SHELLS
        vared -p 'db:push failed. Do you want to re-create all the tables and seed? (y/n): ' -c response

        # THIS PART NEEDS TO CHANGE FOR OTHER SHELLS
        # Check the user's response
        if [[ $response == [Yy]* ]]; then
            # CHANGE THIS TO HOW YOU NORMALLY USE PSQL
            # Save the original stdin file descriptor
            exec 3<&0
            # NOTE: it assumes db name is loom
            docker exec -it pgsql psql -U postgres -d loom -c "
                DROP SCHEMA public CASCADE;
                CREATE SCHEMA public;
            "</dev/tty
            # Restore the original stdin
            exec 0<&3

            # redirect stdin to pnpm db:push
            # Save the original stdin file descriptor
            exec 3<&0
            pnpm db:push </dev/tty
            # Restore the original stdin
            exec 0<&3
            pnpm db:seed
        else
            echo "Exiting script."
        fi
    fi
    echo "----------------------------"
    ```

## How to create new Widget

- create new folder with the widget name in `/apps/frontend/src/pages/Editor/Components/WebloomWidgets/`
    
    for example 

    ```sh
    cd apps/frontend/src/pages/Editor/Components/WebloomWidgets/ && mkdir Input
    ```

- create `index.tsx` this file will contains the widget config and maybe the widget itself.

    ```sh
    cd Input && touch index.tsx
    ```

    > if you want to create any utils or divide your component in files please create the files in the same folder

- the widget is defined through the interface `Widget`

    > you can import the interface Widget from `import { Widget } from '@/lib/Editor/interface';`

    here's a breif description of each field in the interface and how to use it

    > the `widget` interface expect generics `Props` to be the type of widget props

    | Property     | Type                         | Required | Description                                                                                    |
    | ------------ | ---------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
    | component    | `React.ElementType`          | true     | The React function component.                                                                  |
    | config       | `WidgetConfig`               | true     | Used to describe metadata about the component. [For more information](#widgetconfig)           |
    | schema       | `WidgetInspectorConfig`      | true     | Describe the props schema using [rjsf](https://rjsf-team.github.io/react-jsonschema-form/docs/) flavored JSON schema.                                     |
    | setters      | `WidgetSetters<WidgetProps>` | false    | Describe the auto-generated [for more information](#widgetsetters) setters.                    |
    | defaultProps | `WidgetProps`                | true     | Props the widget will start with (the component should add the props it must have to operate). |

- add the widget to the list of Webloom Widgets [here](/apps/frontend/src/pages/Editor/Components/index.ts)

- that's it, thank you!

### widget[config]

Used to describe metadata about the component. here's a breif description of each prop

- icon: the icon to be displayed in the insert tab
- name: widget name
- layoutConfig: used to describe the widget layout constraints like how many rows/cols the widget will be dropped with

    ```ts
    // example from the input widget

        layoutConfig: {
        colsCount: 5,
        rowsCount: 8,
        minColumns: 1,
        minRows: 4,
        },
    ```

### widget[setters]

we support two ways for the component to create methods/setters

1. auto-generate setters bindings from description

    use this for simple prop setter like `setValue`
   
   this should be configured in `widget.setters` 

   follows the interface `WidgetSetters<WidgetProps>`

   please check the comments in the example for more information
   
   ```ts
    // example from input widget
    setters: {
    //  ^^^^^^^^ => setter name
        setValue: {
        //  ^^^^ => the path to the prop please note you can use lodash path syntax
            path: 'value',
        //  ^^^^ => NOTE: this type is only used to show the autocompleation
            type: 'string',
        },
        setDisabled: {
            path: 'disabled',
            type: 'boolean',
        },
    }
    ```

2. add custom methods using `WebloomWidget.appendSetters()`

    provide widgets with api to create custom methods

    this feature should be used if the method is not a setter for a path in widget props, for example

    - `form.submit()` submit a form is not a prop setter and it depends on the HTML of the widget so `Widget.setters` cannot be used for this method and need to supply custom method

    - `input.validate()`: validation cannot be triggered through setter

    - `input.clearValue()`: `Widget.setters` can be used to create setter for `input.value` and this setter will accept the value as function argument can be used like the following `input.setValue("any value here")` but for syntactic sugar  like `clearValue` a custom method should be assigned

    this method manily will be used inside the react component to get access to the jsx if needed
    
    ```ts
    // exmaple from input widget

    // nothing fancy just a function
    const clearValue = useCallback(() => {
        onPropChange({
        key: 'value',
        value: '',
        });
    }, [onPropChange]);

    useEffect(() => {
        // how to use appendSetters to add new methods in the runtime
        widget.appendSetters([
        {
            key: 'focus',
            setter: () => {
            // assume there's a ref in the component that reference the input directly
            if (!inputRef || !inputRef.current) return;
            inputRef.current.focus();
            },
        },
        {
            key: 'clearValue',
            setter: clearValue,
        },
        ]);
    }, [clearValue]);
    ```

### widget[events]

how to configure the events the widget will react to

> please note that widgets don't define what will happen in the event and don't run logic themselves they just define when the handler will run.

event so the widget won't run the event itself the widget will hold **the events configuration** so if the component will handle events it should do those steps:

- include this type in its props `events: genEventHandlerUiSchema(webloomInputEvents)`

- define the events names the component can fire, for example

    ```ts
        const webloomInputEvents = {
    //  event name     event name in the event configuration widget
        onTextChanged: 'onTextChanged',
        onFocus: 'onFocus',
        onBlur: 'onBlur',
        } as const;
    ```

- in `widget.schema` should do two steps

    1. add the json schema of `events` in `widget.schema.dataSchema`
    2. add the uischema to show the correct widget in the inspector

        ```ts
        // here's a schema with the two steps
        const schema: WidgetInspectorConfig = {
        dataSchema: {
            type: 'object',
            properties: {
                // events json schema
                events: widgetsEventHandlerJsonSchema,
            },
            required: ['events'],
        },
        uiSchema: {
            // events ui schema to show correct widget in the inspector
            events: genEventHandlerUiSchema(webloomInputEvents),
        },
        };
        ```

- inform the editor when to run the event

    for example the input widget has event called `onTextChanged` that should run with the input `onChange` event, the widget should inform the editor that event happened with this api `editorStore.executeActions`  

    ```ts
    // example
    <Input
    ref={inputRef}
    onChange={(e) => {
        // inform the editor that it should run the event onTextChanged
        editorStore.executeActions<typeof webloomInputEvents>(
        id,
        'onTextChanged',
        );
    }}
    onFocus={() =>
        // inform the editor that it should run the event onFocus
        editorStore.executeActions<typeof webloomInputEvents>(id, 'onFocus')
    }
    onBlur={() =>
        // inform the editor that it should run the event onBlur
        editorStore.executeActions<typeof webloomInputEvents>(id, 'onBlur')
    }
    />
    ```

## How to Create a New Plugin/Data Source

This guide explains how to create a plugin to connect to a remote data source such as a database, API, or SaaS service.

We will create a simple PostgreSQL plugin.

- Create a folder with the data source name: `mkdir ./apps/backend/src/data_sources/plugins/postgresql`

- Let's create a file to host our plugin logic: `touch ./apps/backend/src/data_sources/plugins/postgresql/main.ts`

- Any plugin should follow the interface `QueryRunnerI<ConfigT, QueryT>`
    
  - `ConfigT`: is the type of the data source config(config the plugin needs to connect to the backend, or any configuration the plugin wants to share across all data queries)
  - `QueryT`: the type of the query config

- We normally divide the types from the implementation, so let's create a file to host our plugin types:`touch ./apps/backend/src/data_sources/plugins/postgresql/types.ts`

    we use zod for validation so let's create our plugin types
    
  - `configT`

    ```ts
        export const configSchema = z.object({
          user: z.string().min(1),
          host: z.string().min(1),
          port: z.number().default(5432),
          database: z.string().min(1),
          password: z.string(),
        });
    ```

  - `QueryT`

    ```ts
        export const querySchema = z.object({
          query: z.string(),
        });
    ```

  - export the types

    ```ts
        export type ConfigT = z.infer<typeof configSchema>;
        export type QueryT = z.infer<typeof querySchema>;

    ```

- As we're already in `types.ts`, let's discuss how the front-end will render a form for our plugin
    we use [RJSF](https://rjsf-team.github.io/react-jsonschema-form/docs/) which renders form based on json schema.

  - we need to convert our zod schema to json schema(or you can write your schema directly in json schema) we use [zod-to-json-schema](https://www.npmjs.com/package/zod-to-json-schema)

  - rjsf uses custom schema called **[uiSchema](https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/uiSchema)** to customize how the form will look

    > A UI schema is basically an object literal providing information on how the form should be rendered, while the JSON schema tells what.
    The uiSchema object follows the tree structure of the form field hierarchy, and defines how each property should be rendered.
    
    so we need to return both the front-end let's create this

    ```ts
    // ConfigT
    export const pluginConfigForm = {
        // json schema
      schema: zodToJsonSchema(configSchema, 'configSchema'),
      // ui schema
      uiSchema: {
        host: {
          'ui:placeholder': 'localhost',
          'ui:title': 'Host',
        },
        port: {
          'ui:placeholder': '5432',
          'ui:title': 'Port',
        },
        database: {
          'ui:placeholder': 'Name of your database',
          'ui:title': 'Database Name',
        },
        user: {
          'ui:placeholder': 'Enter username',
        },
        password: {
          'ui:widget': 'password',
          'ui:placeholder': 'Enter password',
        },
      },
    };
    ```

    ```ts
    // QueryT
    export const queryConfigForm = {
      schema: zodToJsonSchema(querySchema, 'querySchema'),
      uiSchema: {
        query: {
          'ui:widget': 'sql',
          'ui:placeholder': 'select * from table;',
          'ui:title': 'SQL Query',
        },
        options: {
          'ui:widget': 'sql',
          'ui:placeholder': 'select * from table;',
          'ui:title': 'Options',
        },
      },
    };
    ```

- let's get back to writing the logic of our plugin in `main.ts`

start by copying this boilerplate code

```ts

import { QueryConfig, QueryRet } from '../../../data_queries/query.types';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import { configSchema, ConfigT, QueryT } from './types';

export default class PostgresqlQueryService
  implements QueryRunnerI<ConfigT, QueryT>
{
  async run(
    dataSourceConfig: ConfigT,
    query: QueryConfig<QueryT>,
  ): Promise<QueryRet> {
  }

  // optional
  connect(dataSourceConfig: ConfigT): Pool {
  }

  // optional
  async testConnection(dataSourceConfig: ConfigT) {
  }
}
```

- there's no constraints on how you organize your plugin but the `run` function, because this the entry point to the plugin

> NOTE that config validation is the plugin respobsiblity

- you can use any library/driver to connect to your external data source, in our example we will use [pg](https://node-postgres.com/) to connect to postgres

the `connect` method

```ts
  connect(dataSourceConfig: ConfigT): Pool {
    const config: PoolConfig = {
      ...dataSourceConfig,
    };
    return new Pool(config);
  }
```

- update the `run` method, this the entry point of the plugin so its job will be mainlly calling other methods/functions

```ts
  async run(
    dataSourceConfig: ConfigT,
    query: QueryConfig<QueryT>,
  ): Promise<QueryRet> {
    try {
      // validate ASAP
      configSchema.parse(dataSourceConfig);
      const pool = this.connect(dataSourceConfig);
      const res = await pool.query(query.query.query);
      return {
        statusCode: 200,
        data: res.rows,
      };
    } catch (error) {
      return {
        statusCode: 500,
        data: {},
        error: (error as Error).message,
      };
    }
  }
```
