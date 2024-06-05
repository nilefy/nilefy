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
    | initialProps | `WidgetProps`                | true     | Props the widget will start with (the component should add the props it must have to operate). |

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
