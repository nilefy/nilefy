FROM --platform=linux/amd64 node:lts-alpine3.19

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

# packages
# COPY packages/configPanelTypes/package.json ./packages/configPanelTypes/
COPY packages/constants/package.json ./packages/constants/
COPY packages/database/package.json ./packages/database/
COPY packages/permissions/package.json ./packages/permissions/

RUN npm install -g pnpm@8

RUN pnpm install

COPY apps/backend/ ./apps/backend/
COPY apps/frontend/ ./apps/frontend/
COPY packages/constants ./packages/constants/
COPY packages/database ./packages/database/
COPY packages/permissions/ ./packages/permissions/

# build

RUN pnpm build

EXPOSE 3000

CMD [ "pnpm", "start:docker" ]