# Developing 

- create branch `git checkout -b feat/MY_BRANCH_NAME` to know how to name your branch please check [How To Name a Branch](#how-to-name-a-branch)

- use the guidelines for commit messages please check [Commit Guidelines](#commit-guidelines)

- create pull request

## How To Name a Branch

The branch name will consist of a pattern like the following

```
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

```
fix/115-auth
fix/115-auth-error
fix/115-auth-issue
```

##### docs branches

```
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

```
The commit message should be structured as follows:

<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

```

Example Commit Message:

```
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
