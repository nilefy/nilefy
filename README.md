# WEBLOOM

## Getting started

this repo uses [turpo repo](https://turbo.build/repo/docs) to manage the monorepo for more information check up the docs

- make sure you have **node.js** version `18.x.x`

- make sure you have **pnpm** installed `npm i -g pnpm`

- install deps `pnpm install`

- create backebd .env `cp apps/backend/.env.example apps/backend/.env`

- prototype the database schema `pnpm db:push`

- if you want to seed the database with random data `pnpm db:seed` seed will generate admin the following credentials, and any other user with the password `password`

    ```ts
    {
        email: 'admin@admin.com',
        username: 'admin',
        password: 'superadmin',
      }
    ```

- run all packages in dev mode `pnpm run dev`

- you can check [swagger](https://swagger.io/) docs in [http://localhost:3000/api#/](http://localhost:3000/api)

- for the docs use `pnpm docs:start`

- please check [CONTRIBUTING.md](./CONTRIBUTING.md) for more information on how to contribute(branch names/ commit messages and so on)
