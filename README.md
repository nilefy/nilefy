# Nilefy

![nilefyTM](./nilefyTM.webp)

## Getting started

this repo uses [turpo repo](https://turbo.build/repo/docs) to manage the monorepo for more information check up the docs

- make sure you have **node.js** version `20.x.x`

- make sure you have **pnpm** installed `npm i -g pnpm@8`

- in the root install deps `pnpm install`

- create .env `cp .env.example .env`

- run all packages in dev mode `pnpm run dev`

- prototype the database schema `pnpm db:push`

- you can check [swagger](https://swagger.io/) docs in [http://localhost:3000/api#/](http://localhost:3000/api)


### manage database

- if you want to seed the database with random data(users/workspaces/apps/...) `pnpm db:seed` seed will generate admin the following credentials, and any other user with the password `password`

    ```ts
    {
        email: 'admin@admin.com',
        username: 'admin',
        password: 'superadmin',
      }
    ```

- if you don't need to seed database with random data use `pnpm db:seed:prod` it will fill the database with only the requried data for the backend to operate(permissions/data sources/..)

- If you want to update data sources configuration use `pnpm db:syncDss` it will update the data sources configuration in the database

### docs

- to start docs server in dev mode run `pnpm dev:docs` in the root or in **apps/docs** run `pnpm start`

- to build docs in the root run `build:docs`

please check [CONTRIBUTING.md](./CONTRIBUTING.md) for more information on how to contribute(branch names/ commit messages and so on)

