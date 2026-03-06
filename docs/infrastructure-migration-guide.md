# 인프라 마이그레이션 가이드

> Next.js → Vercel (Hobby) / Nest.js → EC2 + Docker + Nginx / PostgreSQL → NeonDB

---

## 목차

1. [마이그레이션 순서 개요](#1-마이그레이션-순서-개요)
2. [Phase 1: NeonDB 셋업 및 데이터 마이그레이션](#2-phase-1-neondb-셋업-및-데이터-마이그레이션)
3. [Phase 2: EC2에 NestJS + Nginx 배포](#3-phase-2-ec2에-nestjs--nginx-배포)
4. [Phase 3: Vercel로 Next.js 배포](#4-phase-3-vercel로-nextjs-배포)
5. [Phase 4: CI/CD 파이프라인 개편](#5-phase-4-cicd-파이프라인-개편)
6. [Phase 5: 모니터링 전환](#6-phase-5-모니터링-전환)
7. [Phase 6: 기존 인프라 정리](#7-phase-6-기존-인프라-정리)
8. [환경변수 총정리](#8-환경변수-총정리)
9. [롤백 계획](#9-롤백-계획)
10. [월간 예상 비용](#10-월간-예상-비용)

---

## 1. 마이그레이션 순서 개요

```
현재 구조                         새 구조
┌──────────────────────┐        ┌──────────────────────────┐
│  단일 서버 (NCloud)   │        │  Vercel (Hobby 무료)      │
│  ┌────────────────┐  │        │  └─ Next.js               │
│  │ Nginx (:80)    │  │        └──────────┬───────────────┘
│  │ ├─ / → Web     │  │                   │ HTTPS
│  │ ├─ /nest → API │  │        ┌──────────▼───────────────┐
│  │ └─ /socket.io  │  │        │  EC2 (t3.micro 프리티어)   │
│  ├────────────────┤  │        │  ┌─ Nginx (:80/:443)     │
│  │ Next.js (:3000)│  │        │  │  └─ → API (:8000)     │
│  │ NestJS (:8000) │  │        │  └─ NestJS Docker (:8000)│
│  └────────────────┘  │        └──────────┬───────────────┘
└──────────────────────┘                   │ SSL (neon.tech)
                                ┌──────────▼───────────────┐
                                │  NeonDB (Free 무료)       │
                                │  └─ PostgreSQL            │
                                └──────────────────────────┘
```

의존성 방향: **Frontend → Backend → Database** 이므로, **아래에서 위로** 순서로 마이그레이션합니다.

```
[Phase 1] NeonDB 준비 + 데이터 이관
    ↓
[Phase 2] EC2에 NestJS + Nginx 배포 (NeonDB 연결)
    ↓
[Phase 3] Next.js → Vercel 배포 (EC2 API 연결)
    ↓
[Phase 4] CI/CD 파이프라인 개편
    ↓
[Phase 5] 모니터링 전환
    ↓
[Phase 6] 기존 서버 정리
```

---

## 2. Phase 1: NeonDB 셋업 및 데이터 마이그레이션

### 2-1. NeonDB 프로젝트 생성

1. [Neon Console](https://console.neon.tech/)에서 새 프로젝트 생성
2. **Region**: `Asia Pacific (Singapore)` — `ap-southeast-1` (한국에서 가장 가까운 리전)
3. **PostgreSQL Version**: 15 (현재 사용 버전과 동일)
4. 프로젝트 생성 완료 후 **Connection Details** 에서 연결 정보 확인:
   - Host: `ep-<NAME>-<ID>.ap-southeast-1.aws.neon.tech`
   - Database: `neondb` (기본값, 변경 가능)
   - User: `neondb_owner`
   - Password: 자동 생성된 비밀번호
   - Connection string: `postgresql://neondb_owner:<PASSWORD>@ep-<NAME>-<ID>.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

> **NeonDB Free 티어 제한:**
>
> - 0.5 GiB 스토리지
> - 1개 프로젝트, 10개 브랜치
> - 컴퓨트: 0.25 vCPU, 자동 일시중지 (5분 유휴 시)
> - 월 191.9 컴퓨트 시간

### 2-2. 기존 DB 데이터 덤프

현재 운영 서버에 SSH 접속하여 데이터를 덤프합니다.

```bash
# 1) 운영 서버에서 실행
ssh <SSH_USERNAME>@<SSH_HOST>

# 2) Docker 컨테이너에서 pg_dump 실행
docker exec malmanhae-db pg_dump -U postgres -d malmanhae \
  --no-owner --no-acl --clean --if-exists \
  -F c -f /tmp/malmanhae_backup.dump

# 3) 컨테이너에서 호스트로 복사
docker cp malmanhae-db:/tmp/malmanhae_backup.dump ~/malmanhae_backup.dump

# 4) 로컬로 다운로드
scp <SSH_USERNAME>@<SSH_HOST>:~/malmanhae_backup.dump ./malmanhae_backup.dump
```

### 2-3. NeonDB에 데이터 복원

```bash
# Neon 연결 문자열로 복원
pg_restore \
  -h ep-<NAME>-<ID>.ap-southeast-1.aws.neon.tech \
  -p 5432 \
  -U neondb_owner \
  -d neondb \
  --no-owner --no-acl --clean --if-exists \
  ./malmanhae_backup.dump

# 비밀번호 프롬프트 → Neon Console에서 확인한 비밀번호 입력

# 또는 연결 문자열 직접 사용
pg_restore \
  -d "postgresql://neondb_owner:<PASSWORD>@ep-<NAME>-<ID>.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" \
  --no-owner --no-acl --clean --if-exists \
  ./malmanhae_backup.dump
```

### 2-4. 코드 변경: TypeORM 설정에 SSL 추가

**파일: `apps/api/src/configs/typeorm.config.ts`**

```typescript
// 변경 전
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "postgres-db",
  entities: [__dirname + "/../**/*.entity.{js,ts}"],
  synchronize: true,
};

// 변경 후
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "postgres-db",
  entities: [__dirname + "/../**/*.entity.{js,ts}"],
  synchronize: false, // ⚠️ 프로덕션에서는 반드시 false (NeonDB는 외부 관리형 DB)
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
};
```

**파일: `apps/api/src/datasource-cli.ts`** (마이그레이션 CLI용)

```typescript
// 변경 후
import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "postgres-db",
  entities: ["src/**/*.entity.ts"],
  migrations: ["migrations/*.ts"],
  synchronize: false,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});
```

### 2-5. 로컬에서 NeonDB 연결 테스트

```bash
# apps/api/.env.local 에 NeonDB 연결 정보 설정
DB_HOST=ep-<NAME>-<ID>.ap-southeast-1.aws.neon.tech
DB_PORT=5432
DB_USERNAME=neondb_owner
DB_PASSWORD=<NEON_PASSWORD>
DB_NAME=neondb
DB_SSL=true

# API 서버 시작하여 연결 테스트
cd apps/api && pnpm dev
```

### 2-6. NeonDB 추가 설정

1. **Connection Pooling** (Neon Console → Project → Settings → Connection Pooling)
   - Neon은 PgBouncer 기반 connection pooler 내장
   - Pooler endpoint: `-pooler` 접미사가 붙은 호스트명 사용
   - 예: `ep-<NAME>-<ID>-pooler.ap-southeast-1.aws.neon.tech`
   - 포트: `5432`
   - 프로덕션에서는 pooler endpoint 사용 권장

2. **IP Allow List** (Pro 플랜에서만 지원, Free에서는 모든 IP 허용)
   - Free 티어에서는 SSL 필수 + 비밀번호로 보안 유지

3. **Auto-suspend 설정**
   - Free 티어 기본: 5분 유휴 시 컴퓨트 일시중지
   - 첫 요청 시 cold start 발생 (~1초) — 사용량이 적으면 문제 없음
   - 상시 가동이 필요하면 Pro 플랜 필요

---

## 3. Phase 2: EC2에 NestJS + Nginx 배포

### 3-1. EC2 인스턴스 생성

#### AWS Console에서 생성

1. **AMI**: Amazon Linux 2023 또는 Ubuntu 24.04 LTS
2. **인스턴스 타입**: `t3.micro` (프리티어, 1 vCPU, 1 GiB RAM)
   - 또는 `t4g.micro` (ARM, 프리티어, 더 나은 성능/$)
3. **스토리지**: 30 GiB gp3 (프리티어 범위)
4. **키 페어**: 새로 생성 또는 기존 키 사용
5. **네트워크**: Default VPC, 퍼블릭 서브넷, 퍼블릭 IP 자동 할당

#### 보안 그룹 설정

| 유형  | 포트 | 소스      | 용도                    |
| ----- | ---- | --------- | ----------------------- |
| SSH   | 22   | 내 IP     | SSH 접속                |
| HTTP  | 80   | 0.0.0.0/0 | 웹 (HTTPS 리다이렉트용) |
| HTTPS | 443  | 0.0.0.0/0 | API 서비스              |

#### Elastic IP 할당 (선택이지만 권장)

```bash
# Elastic IP 할당 (인스턴스 재시작 시에도 IP 유지)
aws ec2 allocate-address --domain vpc --region ap-northeast-2

# EC2 인스턴스에 연결
aws ec2 associate-address \
  --instance-id <INSTANCE_ID> \
  --allocation-id <ALLOCATION_ID>

# 프리티어: 실행 중인 EC2에 연결된 Elastic IP 1개는 무료
```

### 3-2. EC2 초기 설정

SSH 접속 후 필요한 소프트웨어를 설치합니다.

```bash
ssh -i <KEY_FILE>.pem ec2-user@<ELASTIC_IP>

# === Amazon Linux 2023 기준 ===

# 1) 시스템 업데이트
sudo dnf update -y

# 2) Docker 설치
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# 3) Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4) 재접속 (docker 그룹 반영)
exit
ssh -i <KEY_FILE>.pem ec2-user@<ELASTIC_IP>

# 5) 확인
docker --version
docker-compose --version
```

### 3-3. NestJS 코드 변경

#### 3-3-1. CORS 설정 변경 (`apps/api/src/main.ts`)

현재 CORS가 개발환경에서만 활성화되어 있으나, Vercel(프론트) ↔ EC2(백엔드)는 크로스 오리진이므로 프로덕션에서도 CORS가 필요합니다.

```typescript
// 변경 전
// CORS 설정 (개발용)
if (process.env.NODE_ENV === "development") {
  app.enableCors({
    origin: true,
    credentials: true,
  });
}

// 변경 후
// CORS 설정 (Vercel ↔ EC2 크로스 오리진)
const corsOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",") || [];
app.enableCors({
  origin: process.env.NODE_ENV === "development" ? true : corsOrigins,
  credentials: true,
});
```

#### 3-3-2. 헬스체크 엔드포인트 추가 (`apps/api/src/app.controller.ts`)

Nginx 헬스체크용 엔드포인트를 NestJS에 직접 추가합니다.

```typescript
// 기존 코드에 추가
@Get('health')
@ApiOperation({ summary: '헬스 체크' })
@ApiResponse({ status: 200, description: 'OK' })
healthCheck(): { status: string } {
  return { status: 'ok' };
}
```

### 3-4. Nginx 설정 변경

EC2에서 Nginx는 **API 전용 리버스 프록시 + SSL 종료** 역할만 합니다.
(Next.js는 Vercel이 서빙하므로 `/` 프록시 제거)

**파일: `nginx.conf` (새 버전)**

```nginx
server {
    listen 80;
    server_name api.malmanhae.com;

    # HTTP → HTTPS 리다이렉트
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.malmanhae.com;

    # SSL 인증서 (Let's Encrypt / Certbot)
    ssl_certificate /etc/letsencrypt/live/api.malmanhae.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.malmanhae.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # API 프록시 (모든 경로 → NestJS)
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 지원
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_buffering off;
    }

    # 헬스체크 (Nginx 자체 응답)
    location /nginx-health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
```

### 3-5. Docker Compose 프로덕션 설정

**파일: `infra/docker-compose.prod.yaml` (새 버전)**

```yaml
x-logging: &default-logging
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"

services:
  api:
    container_name: malmanhae-api
    image: ${DOCKERHUB_USERNAME}/malmanhae-api:latest
    restart: unless-stopped
    logging: *default-logging
    ports:
      - "8000:8000"
    environment:
      NODE_ENV: production
      PORT: 8000
      # NeonDB
      DB_HOST: ${DB_HOST}
      DB_PORT: 5432
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      DB_SSL: "true"
      # Gemini
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      GEMINI_GRADING_MODEL: gemini-2.0-flash
      GEMINI_DEFAULT_MODEL: gemini-2.0-flash
      # NCloud STT
      NCLOUD_CLOVA_SPEECH_INVOKE_URL: ${NCLOUD_CLOVA_SPEECH_INVOKE_URL}
      NCLOUD_CLOVA_SPEECH_SECRET_KEY: ${NCLOUD_CLOVA_SPEECH_SECRET_KEY}
      STT_CALLBACK_URL: ${STT_CALLBACK_URL}
      # NCloud Object Storage
      NCLOUD_OBJECT_STORAGE_ENDPOINT: ${NCLOUD_OBJECT_STORAGE_ENDPOINT}
      NCLOUD_OBJECT_STORAGE_REGION: ${NCLOUD_OBJECT_STORAGE_REGION}
      NCLOUD_OBJECT_STORAGE_ACCESS_KEY: ${NCLOUD_OBJECT_STORAGE_ACCESS_KEY}
      NCLOUD_OBJECT_STORAGE_SECRET_KEY: ${NCLOUD_OBJECT_STORAGE_SECRET_KEY}
      NCLOUD_OBJECT_STORAGE_BUCKET: ${NCLOUD_OBJECT_STORAGE_BUCKET}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS}
      # Mail
      MAIL_HOST: ${MAIL_HOST}
      MAIL_PORT: ${MAIL_PORT}
      MAIL_USER: ${MAIL_USER}
      MAIL_PASSWORD: ${MAIL_PASSWORD}
      MAIL_FROM: ${MAIL_FROM}
      # Google OAuth
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      GOOGLE_CALLBACK_URL: ${GOOGLE_CALLBACK_URL}
      FRONTEND_URL: ${FRONTEND_URL}
    networks:
      - app-network

  # 모니터링 (선택)
  prometheus:
    container_name: malmanhae-prometheus
    image: prom/prometheus:v3.8.1
    restart: unless-stopped
    logging: *default-logging
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yaml:/etc/prometheus/prometheus.yml:ro
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.retention.time=15d"
    networks:
      - app-network

  grafana:
    container_name: malmanhae-grafana
    image: grafana/grafana:12.3.1
    restart: unless-stopped
    logging: *default-logging
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_USER: ${GF_SECURITY_ADMIN_USER}
      GF_SECURITY_ADMIN_PASSWORD: ${GF_SECURITY_ADMIN_PASSWORD}
    volumes:
      - ./grafana-datasource.yaml:/etc/grafana/provisioning/datasources/datasource.yaml:ro
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

> **변경 포인트 (기존 대비):**
>
> - `db` (PostgreSQL) 서비스 제거 → NeonDB 사용
> - `web` (Next.js) 서비스 제거 → Vercel 사용
> - `nginx` 서비스 제거 → EC2 호스트에서 직접 Nginx 실행 (SSL 인증서 관리 편의)
> - `loki`, `promtail` 제거 (간소화, Docker 로그로 충분)
> - `pgdata` 볼륨 제거

### 3-6. EC2에 SSL 인증서 설정 (Let's Encrypt)

```bash
# 1) Nginx 설치 (호스트에서 직접 실행)
sudo dnf install -y nginx   # Amazon Linux 2023
# 또는
sudo apt install -y nginx   # Ubuntu

# 2) Certbot 설치
sudo dnf install -y certbot python3-certbot-nginx   # Amazon Linux
# 또는
sudo apt install -y certbot python3-certbot-nginx    # Ubuntu

# 3) DNS 설정이 완료된 상태에서 인증서 발급
sudo certbot --nginx -d api.malmanhae.com

# 4) 자동 갱신 확인
sudo certbot renew --dry-run

# 5) 자동 갱신 크론탭 (보통 certbot이 자동으로 설정하지만 확인)
sudo systemctl enable certbot-renew.timer
```

### 3-7. Nginx 설정 적용

```bash
# nginx.conf를 EC2에 복사
sudo cp nginx.conf /etc/nginx/conf.d/malmanhae.conf

# 기본 설정 비활성화 (충돌 방지)
sudo rm -f /etc/nginx/conf.d/default.conf

# 설정 테스트
sudo nginx -t

# Nginx 시작
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3-8. API 이미지 빌드 및 배포

```bash
# 로컬에서 이미지 빌드 후 Docker Hub에 푸시 (또는 EC2에서 직접 빌드)

# 옵션 A: Docker Hub 경유
docker build -t <DOCKERHUB_USERNAME>/malmanhae-api:latest -f apps/api/Dockerfile .
docker push <DOCKERHUB_USERNAME>/malmanhae-api:latest

# EC2에서 풀 & 실행
ssh -i <KEY_FILE>.pem ec2-user@<ELASTIC_IP>
cd ~/malmanhae

# .env 파일 생성 (시크릿 포함)
cat > .env << 'EOF'
DOCKERHUB_USERNAME=<YOUR_USERNAME>
DB_HOST=ep-<NAME>-<ID>.ap-southeast-1.aws.neon.tech
DB_PORT=5432
DB_USERNAME=neondb_owner
DB_PASSWORD=<NEON_PASSWORD>
DB_NAME=neondb
GEMINI_API_KEY=<KEY>
JWT_SECRET=<SECRET>
CORS_ALLOWED_ORIGINS=https://malmanhae.vercel.app,https://www.malmanhae.com
GOOGLE_CLIENT_ID=<ID>
GOOGLE_CLIENT_SECRET=<SECRET>
GOOGLE_CALLBACK_URL=https://api.malmanhae.com/api/auth/google/callback
FRONTEND_URL=https://malmanhae.vercel.app
# ... 나머지 환경변수
EOF

# Docker Compose 실행
docker-compose -f infra/docker-compose.prod.yaml pull
docker-compose -f infra/docker-compose.prod.yaml up -d
```

### 3-9. DNS 설정

```
# DNS 관리에서 A 레코드 추가:
api.malmanhae.com → A → <EC2_ELASTIC_IP>
```

### 3-10. 동작 확인

```bash
# 헬스체크
curl https://api.malmanhae.com/health
# 응답: {"status":"ok"}

# API 테스트
curl https://api.malmanhae.com/
# 응답: Hello World!

# Nginx 헬스체크
curl https://api.malmanhae.com/nginx-health
# 응답: OK
```

---

## 4. Phase 3: Vercel로 Next.js 배포

### 4-1. Vercel 프로젝트 설정

Vercel GitHub App을 사용할 수 없는 환경이므로, **Vercel CLI + GitHub Actions**로 배포합니다.

1. Vercel CLI로 프로젝트 연결 (프로젝트 루트에서 실행):
   ```bash
   npm install -g vercel
   vercel link
   ```
   - Team/Account 선택
   - 기존 프로젝트 연결 또는 새 프로젝트 생성
   - 완료 후 `.vercel/project.json`에서 `orgId`, `projectId` 확인

2. Vercel Dashboard에서 프로젝트 설정 확인:
   - **Root Directory**: `apps/web` (모노레포이므로 반드시)
   - **Framework Preset**: Next.js (자동 감지)

3. GitHub Secrets 등록:
   - `VERCEL_TOKEN`: Vercel > Settings > Tokens에서 생성
   - `VERCEL_ORG_ID`: `.vercel/project.json`의 `orgId`
   - `VERCEL_PROJECT_ID`: `.vercel/project.json`의 `projectId`

4. GitHub Actions 워크플로우 (`.github/workflows/deploy-web.yml`):
   - `main` 브랜치 push 시 `apps/web/**` 또는 `packages/**` 변경 감지
   - Vercel CLI로 `pull → build → deploy` 순서로 프로덕션 배포

> **Vercel Hobby 플랜 제한:**
>
> - 개인 비상업 프로젝트만 가능
> - Serverless Function 실행 제한: 10초 (API Routes)
> - 빌드 시간: 45분/빌드
> - 대역폭: 100 GB/월
> - 1개 팀원만 가능

### 4-2. 코드 변경: next.config.ts

```typescript
// 변경 전
const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone", // ← 삭제
  images: {
    /* ... */
  },
  transpilePackages: ["msw"],
};

// 변경 후
const nextConfig: NextConfig = {
  reactCompiler: true,
  // output: "standalone" 삭제 — Vercel은 자체 빌드 시스템 사용
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kr.object.ncloudstorage.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  transpilePackages: ["msw"],
};
```

### 4-3. Vercel 환경변수 설정

Vercel Dashboard → Project → Settings → Environment Variables:

| 변수명                   | 값                          | 환경                             |
| ------------------------ | --------------------------- | -------------------------------- |
| `NEXT_PUBLIC_API_URL`    | `https://api.malmanhae.com` | Production, Preview, Development |
| `NEXT_PUBLIC_SOCKET_URL` | `https://api.malmanhae.com` | Production, Preview, Development |
| `API_URL`                | `https://api.malmanhae.com` | Production, Preview, Development |
| `BOOSTAD_BLOG_KEY`       | `<현재 값>`                 | Production                       |
| `NEXT_PUBLIC_SENTRY_DSN` | `<현재 값>`                 | Production                       |
| `SENTRY_AUTH_TOKEN`      | `<현재 값>`                 | Production                       |

> ⚠️ **중요**: 기존 `API_URL=http://api:8000` (Docker 내부 통신) → `https://api.malmanhae.com` (외부 EC2 주소)로 변경

### 4-4. api-client.ts 확인

코드 변경은 불필요합니다. 환경변수만 올바르게 설정하면 됩니다.

```typescript
// apps/web/src/lib/api-client.ts (변경 불필요)
const API_BASE_URL = process.env.API_URL || "http://localhost:8000";
// Vercel에서 API_URL=https://api.malmanhae.com 으로 자동 적용
```

### 4-5. Google OAuth 콜백 URL 업데이트

1. **Google Cloud Console** → APIs & Services → Credentials → OAuth 2.0 Client
   - Authorized redirect URIs 업데이트:
     ```
     https://api.malmanhae.com/api/auth/google/callback
     ```
   - Authorized JavaScript origins 업데이트:
     ```
     https://malmanhae.vercel.app
     https://www.malmanhae.com  (커스텀 도메인 사용 시)
     ```

2. **EC2의 .env 파일 업데이트**:

   ```bash
   # EC2에서
   GOOGLE_CALLBACK_URL=https://api.malmanhae.com/api/auth/google/callback
   FRONTEND_URL=https://malmanhae.vercel.app
   CORS_ALLOWED_ORIGINS=https://malmanhae.vercel.app,https://www.malmanhae.com
   ```

3. **API 컨테이너 재시작**:
   ```bash
   cd ~/malmanhae
   docker-compose -f infra/docker-compose.prod.yaml down
   docker-compose -f infra/docker-compose.prod.yaml up -d
   ```

### 4-6. Vercel 커스텀 도메인 설정 (선택)

1. Vercel Dashboard → Project → Settings → Domains
2. 도메인 추가: `www.malmanhae.com` 또는 `malmanhae.com`
3. DNS 설정:
   ```
   malmanhae.com     → A     → 76.76.21.21  (Vercel)
   www.malmanhae.com → CNAME → cname.vercel-dns.com
   ```

### 4-7. 배포 확인

```bash
# main 브랜치에 apps/web/** 또는 packages/** 변경 push 시
# GitHub Actions가 Vercel CLI로 자동 배포

# 수동 배포 (Vercel CLI)
npx vercel --prod --token=<VERCEL_TOKEN>
```

---

## 5. Phase 4: CI/CD 파이프라인 개편

### 5-1. GitHub Actions Secrets 업데이트

**유지할 시크릿:**

- `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` — API 이미지 빌드/푸시용 (계속 사용)
- `SSH_HOST` → EC2 Elastic IP로 변경
- `SSH_USERNAME` → `ec2-user` (Amazon Linux) 또는 `ubuntu` (Ubuntu)
- `SSH_PRIVATE_KEY` → EC2 키 페어의 프라이빗 키
- `NEXT_PUBLIC_API_URL`, `CHROMATIC_PROJECT_TOKEN` 등 CI 관련

**삭제할 시크릿:**

- 기존 NCloud 서버 관련 시크릿 (새 EC2 값으로 교체)

**추가/변경할 시크릿:**

| 시크릿            | 값                       | 용도            |
| ----------------- | ------------------------ | --------------- |
| `SSH_HOST`        | EC2 Elastic IP           | 배포 대상 서버  |
| `SSH_USERNAME`    | `ec2-user` 또는 `ubuntu` | SSH 접속 사용자 |
| `SSH_PRIVATE_KEY` | EC2 키 페어 프라이빗 키  | SSH 인증        |
| `DB_HOST`         | NeonDB 호스트            | 백엔드 DB 연결  |
| `DB_USERNAME`     | `neondb_owner`           | DB 인증         |
| `DB_PASSWORD`     | NeonDB 비밀번호          | DB 인증         |
| `DB_NAME`         | `neondb`                 | DB 이름         |

### 5-2. deploy.yml 변경

**파일: `.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  push:
    branches: [main]

env:
  API_IMAGE: ${{ secrets.DOCKERHUB_USERNAME }}/malmanhae-api

jobs:
  # Next.js는 Vercel이 자동 배포 — 별도 작업 불필요

  deploy-api:
    name: Build and Deploy API to EC2
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push API image
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ./apps/api/Dockerfile
          push: true
          platforms: linux/amd64
          tags: |
            ${{ env.API_IMAGE }}:latest
            ${{ env.API_IMAGE }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Copy docker-compose to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: infra/docker-compose.prod.yaml
          target: ~/malmanhae

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          envs: DOCKERHUB_USERNAME,DB_HOST,DB_USERNAME,DB_PASSWORD,DB_NAME,GEMINI_API_KEY,NCLOUD_CLOVA_SPEECH_INVOKE_URL,NCLOUD_CLOVA_SPEECH_SECRET_KEY,NCLOUD_OBJECT_STORAGE_ENDPOINT,NCLOUD_OBJECT_STORAGE_REGION,NCLOUD_OBJECT_STORAGE_ACCESS_KEY,NCLOUD_OBJECT_STORAGE_SECRET_KEY,NCLOUD_OBJECT_STORAGE_BUCKET,STT_CALLBACK_URL,JWT_SECRET,CORS_ALLOWED_ORIGINS,MAIL_HOST,MAIL_PORT,MAIL_USER,MAIL_PASSWORD,MAIL_FROM,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,GOOGLE_CALLBACK_URL,FRONTEND_URL
          script: |
            cd ~/malmanhae
            docker-compose -f infra/docker-compose.prod.yaml pull
            docker-compose -f infra/docker-compose.prod.yaml down --remove-orphans
            docker-compose -f infra/docker-compose.prod.yaml up -d
            docker image prune -f
        env:
          DOCKERHUB_USERNAME: ${{ secrets.DOCKERHUB_USERNAME }}
          DB_HOST: ${{ secrets.DB_HOST }}
          DB_USERNAME: ${{ secrets.DB_USERNAME }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
          DB_NAME: ${{ secrets.DB_NAME }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          NCLOUD_CLOVA_SPEECH_INVOKE_URL: ${{ secrets.NCLOUD_CLOVA_SPEECH_INVOKE_URL }}
          NCLOUD_CLOVA_SPEECH_SECRET_KEY: ${{ secrets.NCLOUD_CLOVA_SPEECH_SECRET_KEY }}
          NCLOUD_OBJECT_STORAGE_ENDPOINT: ${{ secrets.NCLOUD_OBJECT_STORAGE_ENDPOINT }}
          NCLOUD_OBJECT_STORAGE_REGION: ${{ secrets.NCLOUD_OBJECT_STORAGE_REGION }}
          NCLOUD_OBJECT_STORAGE_ACCESS_KEY: ${{ secrets.NCLOUD_OBJECT_STORAGE_ACCESS_KEY }}
          NCLOUD_OBJECT_STORAGE_SECRET_KEY: ${{ secrets.NCLOUD_OBJECT_STORAGE_SECRET_KEY }}
          NCLOUD_OBJECT_STORAGE_BUCKET: ${{ secrets.NCLOUD_OBJECT_STORAGE_BUCKET }}
          STT_CALLBACK_URL: ${{ secrets.STT_CALLBACK_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          CORS_ALLOWED_ORIGINS: ${{ secrets.CORS_ALLOWED_ORIGINS }}
          MAIL_HOST: ${{ secrets.MAIL_HOST }}
          MAIL_PORT: ${{ secrets.MAIL_PORT }}
          MAIL_USER: ${{ secrets.MAIL_USER }}
          MAIL_PASSWORD: ${{ secrets.MAIL_PASSWORD }}
          MAIL_FROM: ${{ secrets.MAIL_FROM }}
          GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
          GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
          GOOGLE_CALLBACK_URL: ${{ secrets.GOOGLE_CALLBACK_URL }}
          FRONTEND_URL: ${{ secrets.FRONTEND_URL }}
```

> **기존 대비 변경 포인트:**
>
> - Web 이미지 빌드/푸시 단계 완전 제거 (Vercel CLI 워크플로우가 별도 처리)
> - `nginx.conf` SCP 제거 (EC2 호스트에서 직접 관리)
> - DB 관련 환경변수 NeonDB로 변경
> - `BOOSTAD_BLOG_KEY` 등 프론트엔드 전용 변수 제거
> - 모니터링(Prometheus/Grafana) 관련 환경변수 및 파일 SCP 제거

---

## 6. Phase 5: 모니터링

모니터링 스택(Prometheus, Grafana)은 t3.micro 메모리(1GB) 제한으로 제거되었습니다. Docker 로그를 직접 확인하는 방식으로 운영합니다.

```bash
# Docker 로그 직접 확인
docker logs malmanhae-api --tail 100 -f

# 로그 로테이션은 docker-compose의 json-file 드라이버가 처리 (max-size: 10m, max-file: 3)
```

> Sentry(프론트엔드)는 Vercel 환경에서 계속 사용됩니다.

---

## 7. Phase 6: 기존 인프라 정리

### 7-1. 삭제/변경할 파일

| 파일                             | 액션            | 이유                                       |
| -------------------------------- | --------------- | ------------------------------------------ |
| `apps/web/Dockerfile`            | **삭제**        | Vercel이 빌드 처리                         |
| `nginx.conf`                     | **수정**        | API 전용 + SSL 설정으로 변경 (3-4 참고)    |
| `infra/docker-compose.prod.yaml` | **수정**        | DB/Web/Nginx/모니터링 서비스 제거 (3-5 참고) |
| `infra/loki-config.yaml`         | **삭제**        | 모니터링 스택 제거됨                       |
| `infra/promtail-config.yaml`     | **삭제**        | 모니터링 스택 제거됨                       |
| `infra/prometheus.yaml`          | **삭제**        | 모니터링 스택 제거됨                       |
| `infra/grafana-datasource.yaml`  | **삭제**        | 모니터링 스택 제거됨                       |

### 7-2. 유지할 파일

| 파일                              | 이유                                    |
| --------------------------------- | --------------------------------------- |
| `apps/api/Dockerfile`             | EC2에서 Docker 빌드용                   |
| `infra/docker-compose.local.yaml` | 로컬 개발용                             |
| `infra/docker-compose-infra.yaml` | 로컬 DB 개발용                          |
| `.github/workflows/deploy-web.yml`| Vercel CLI 기반 Next.js 배포 워크플로우 |

### 7-3. 기존 NCloud 서버 종료

마이그레이션 완료 후 안정성 확인 절차:

1. DNS TTL을 낮게 설정 (300초) → 롤백 대비
2. 새 인프라에서 최소 **1~2주 안정 운영** 확인
3. 전체 기능 테스트 (로그인, 문제 풀기, STT, 녹음, 지식그래프 등)
4. 기존 NCloud 서버의 Docker Compose 중단
5. 기존 서버 인스턴스 종료/삭제

---

## 8. 환경변수 총정리

### Vercel (Next.js)

| 변수                     | 값                          |
| ------------------------ | --------------------------- |
| `NEXT_PUBLIC_API_URL`    | `https://api.malmanhae.com` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://api.malmanhae.com` |
| `API_URL`                | `https://api.malmanhae.com` |
| `BOOSTAD_BLOG_KEY`       | 기존 값 유지                |
| `NEXT_PUBLIC_SENTRY_DSN` | 기존 값 유지                |
| `SENTRY_AUTH_TOKEN`      | 기존 값 유지                |

### EC2 .env (NestJS Docker)

| 변수                         | 값                                                       |
| ---------------------------- | -------------------------------------------------------- |
| `DOCKERHUB_USERNAME`         | Docker Hub 사용자명                                      |
| `DB_HOST`                    | `ep-<NAME>-<ID>.ap-southeast-1.aws.neon.tech`            |
| `DB_USERNAME`                | `neondb_owner`                                           |
| `DB_PASSWORD`                | NeonDB 비밀번호                                          |
| `DB_NAME`                    | `neondb`                                                 |
| `GEMINI_API_KEY`             | 기존 값 유지                                             |
| `JWT_SECRET`                 | 기존 값 유지                                             |
| `CORS_ALLOWED_ORIGINS`       | `https://malmanhae.vercel.app,https://www.malmanhae.com` |
| `GOOGLE_CLIENT_ID`           | 기존 값 유지                                             |
| `GOOGLE_CLIENT_SECRET`       | 기존 값 유지                                             |
| `GOOGLE_CALLBACK_URL`        | `https://api.malmanhae.com/api/auth/google/callback`     |
| `FRONTEND_URL`               | `https://malmanhae.vercel.app`                           |
| `NCLOUD_CLOVA_SPEECH_*`      | 기존 값 유지                                             |
| `NCLOUD_OBJECT_STORAGE_*`    | 기존 값 유지                                             |
| `STT_CALLBACK_URL`           | `https://api.malmanhae.com/...` (EC2 주소로 업데이트)    |
| `MAIL_*`                     | 기존 값 유지                                             |

### GitHub Actions Secrets

| 시크릿                | 용도                            |
| --------------------- | ------------------------------- |
| `DOCKERHUB_USERNAME`  | Docker Hub 이미지 빌드          |
| `DOCKERHUB_TOKEN`     | Docker Hub 인증                 |
| `SSH_HOST`            | EC2 Elastic IP                  |
| `SSH_USERNAME`        | `ec2-user` / `ubuntu`           |
| `SSH_PRIVATE_KEY`     | EC2 키 페어                     |
| `DB_HOST`             | NeonDB 호스트                   |
| `DB_USERNAME`         | NeonDB 사용자                   |
| `DB_PASSWORD`         | NeonDB 비밀번호                 |
| `DB_NAME`             | `neondb`                        |
| `VERCEL_TOKEN`        | Vercel CLI 인증 토큰            |
| `VERCEL_ORG_ID`       | Vercel Organization ID          |
| `VERCEL_PROJECT_ID`   | Vercel Project ID               |
| 나머지                | 기존과 동일                     |

---

## 9. 롤백 계획

각 Phase별 문제 발생 시 롤백 방법:

### Phase 1 (DB) 롤백

- 기존 PostgreSQL 컨테이너가 아직 동작 중이므로, 환경변수만 원복하면 즉시 롤백
- `.env`에서 `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`를 기존 값으로 변경
- `DB_SSL=true` 제거

### Phase 2 (EC2) 롤백

- 기존 NCloud 서버의 Docker Compose가 아직 동작 중이므로, DNS만 기존 서버 IP로 변경
- 또는 기존 서버에서 `docker compose up -d` 재실행

### Phase 3 (Vercel) 롤백

- Vercel Dashboard → Deployments → 이전 배포 선택 → **Promote to Production**
- 또는 기존 서버의 Nginx + Web 컨테이너 재활성화

### 전체 롤백

```bash
# 기존 NCloud 서버에서 전체 스택 재시작
ssh <SSH_USERNAME>@<기존_SSH_HOST>
cd ~/malmanhae
docker compose -f infra/docker-compose.prod.yaml up -d

# DNS를 기존 서버 IP로 변경
```

---

## 10. 월간 예상 비용

| 서비스                | 프리티어                    | 예상 월 비용                              |
| --------------------- | --------------------------- | ----------------------------------------- |
| **Vercel (Hobby)**    | 무료                        | **$0**                                    |
| **NeonDB (Free)**     | 0.5 GiB, 자동 일시중지      | **$0**                                    |
| **EC2 (t3.micro)**    | 12개월 프리티어: 750시간/월 | **$0** (프리티어) / ~$8.5 (프리티어 이후) |
| **Elastic IP**        | 실행 중 EC2에 연결 시 무료  | **$0**                                    |
| **EBS (30 GiB gp3)**  | 30 GiB 무료                 | **$0**                                    |
| **Docker Hub (Free)** | 1개 private repo            | **$0**                                    |
| **Route 53** (선택)   | —                           | **~$0.5** (호스팅 영역 1개)               |
| **Let's Encrypt**     | 무료                        | **$0**                                    |

### 합계

| 기간                           | 월 비용        |
| ------------------------------ | -------------- |
| **AWS 프리티어 기간 (12개월)** | **$0 ~ $0.5**  |
| **프리티어 이후**              | **~$8.5 ~ $9** |

> **NeonDB cold start 참고**: Free 티어는 5분 유휴 시 컴퓨트가 일시중지되며, 재접속 시 ~0.5-1초의 cold start가 발생합니다. 트래픽이 간헐적인 개인 프로젝트에서는 체감이 미미하지만, 상시 접속이 필요하면 NeonDB Pro ($19/월)를 고려하세요.

---

## 체크리스트

### Phase 1: NeonDB

- [ ] NeonDB 프로젝트 생성 (Singapore 리전)
- [ ] 기존 DB 데이터 pg_dump
- [ ] NeonDB에 pg_restore
- [ ] `typeorm.config.ts`에 SSL 옵션 + `synchronize: false` 적용
- [ ] `datasource-cli.ts`에 SSL 옵션 적용
- [ ] 로컬에서 NeonDB 연결 테스트

### Phase 2: EC2

- [ ] EC2 인스턴스 생성 (t3.micro, 보안 그룹 설정)
- [ ] Elastic IP 할당 및 연결
- [ ] Docker + Docker Compose 설치
- [ ] `main.ts` CORS 설정 변경 (프로덕션에서도 활성화)
- [ ] `app.controller.ts`에 `/health` 엔드포인트 추가
- [ ] `nginx.conf` API 전용 + SSL 설정으로 변경
- [ ] DNS 설정 (`api.malmanhae.com` → EC2 IP)
- [ ] Let's Encrypt SSL 인증서 발급
- [ ] Nginx 설정 적용 및 시작
- [ ] `docker-compose.prod.yaml` 수정 (DB/Web 서비스 제거)
- [ ] EC2에 .env 파일 생성
- [ ] Docker Compose 실행 및 API 동작 확인

### Phase 3: Vercel

- [ ] `vercel link`로 프로젝트 연결 및 `orgId`, `projectId` 확인
- [ ] GitHub Secrets에 `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` 등록
- [ ] `next.config.ts`에서 `output: "standalone"` 제거
- [ ] `.github/workflows/deploy-web.yml` 워크플로우 추가
- [ ] Vercel 환경변수 설정
- [ ] Google Cloud Console에서 OAuth 콜백 URL 업데이트
- [ ] EC2 .env에서 `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS` 업데이트
- [ ] Vercel 배포 및 프론트엔드 동작 확인
- [ ] 전체 E2E 테스트 (로그인 → 문제 풀기 → STT → 지식그래프)

### Phase 4: CI/CD

- [ ] GitHub Secrets 업데이트 (EC2 SSH 정보, NeonDB 정보)
- [ ] `deploy.yml` 수정 (Web 빌드 제거, EC2 배포로 변경)
- [ ] 테스트 배포 실행 및 확인

### Phase 5: 모니터링

- [ ] Prometheus/Grafana 제거 확인 (docker-compose.prod.yaml에서 삭제됨)
- [ ] Docker 로그 직접 확인 방식으로 전환

### Phase 6: 정리

- [ ] `apps/web/Dockerfile` 삭제
- [ ] `infra/prometheus.yaml`, `infra/grafana-datasource.yaml` 삭제
- [ ] `infra/loki-config.yaml`, `infra/promtail-config.yaml` 삭제
- [ ] 기존 인프라 파일 정리
- [ ] 1~2주 안정 운영 확인
- [ ] 기존 NCloud 서버 종료
