FROM node:22-alpine

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV WATCHPACK_POLLING=true

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000
CMD ["pnpm", "dev", "--hostname", "0.0.0.0"]
