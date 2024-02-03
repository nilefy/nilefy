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
