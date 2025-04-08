FROM node:20-alpine as build-stage

WORKDIR /app
RUN npm config set registry https://registry.npmmirror.com && npm install -g pnpm

# RUN corepack enable
# RUN corepack prepare pnpm@latest --activate

#COPY package.json pnpm-lock.yaml ./
COPY package.json ./
#RUN pnpm install --frozen-lockfile
RUN pnpm install


COPY . .
RUN pnpm build

EXPOSE 5000

CMD ["pnpm", "run", "start"]

