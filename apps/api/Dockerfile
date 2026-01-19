# Task1. API 서비스에 필요한 파일만 추출
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .

# --scope=api로 api 서비스에 필요한 패키지만 골라내기
# --docker 옵션으로 docker 레이어 캐싱에 최적화된 구조를 out폴더에 생성
RUN turbo prune --scope=api --docker

# Task2. 의존성 설치 및 빌드
FROM node:20-alpine AS builder

ENV CI=true
ENV HUSKY=0

WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

RUN pnpm turbo run build --filter=api

# Task3. 이미지 실행
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# 빌드 결과값
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

EXPOSE 8000

# 애플리케이션 실행
CMD ["node", "apps/api/dist/src/main"]

