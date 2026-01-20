# 말만해

**말만해**는 말로 설명하며 생각을 정리하는 과정을 학습으로 삼아, 구두 기반의 CS 학습을 돕는 플랫폼입니다.
AI 피드백과 지식 구조화·시각화를 통해 개념의 흐름과 연결을 자연스럽게 이해할 수 있게 합니다.

## ✨ 서비스 주요 기능

1. **구두 설명 기반 학습:** 말이나 글로 설명하는 과정 자체를 학습으로 삼아 지식을 정리합니다.

2. **AI 정량 평가 및 피드백:** 답변을 모범 답안과 비교해 정확도·논리·깊이를 점수와 피드백으로 제공합니다.

3. **지식 구조화 및 시각화:** 개념과 키워드 간 관계를 그래프로 시각화해 구조적으로 이해합니다.

4. **지속 학습 게이미피케이션:** 스트릭과 점수로 학습 동기를 유지하고 루틴화를 돕습니다.

더 자세한 내용은 [서비스 기획서](https://github.com/boostcampwm2025/web11-MMH/wiki/%EC%84%9C%EB%B9%84%EC%8A%A4-%EA%B8%B0%ED%9A%8D%EC%84%9C)를 참고해주세요!

## 🚀 시작하기

> [!NOTE]
> Node 18+, pnpm v10.24.0 버전을 사용해야합니다.

1. 레포지토리 클론

   ```bash
   git clone https://github.com/boostcampwm2025/web11-MMH.git
   cd web11-MMH
   ```

2. 프로젝트 의존성 설치

   ```bash
   pnpm install
   ```

3. [환경변수 가이드라인](https://github.com/boostcampwm2025/web11-MMH/wiki/%ED%99%98%EA%B2%BD%EB%B3%80%EC%88%98-%EC%B6%94%EA%B0%80%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)을 참고해서 각 프로젝트에 `.env` 파일을 생성해주세요.

4. Docker Compose를 사용하여 데이터베이스 등 인프라를 실행합니다.

   ```bash
   pnpm infra
   ```

5. 개발 서버 실행

   ```bash
   # 전체 실행 (web + api)
   pnpm dev
   ```

   개별 실행이 필요한 경우:

   ```bash
   # 프론트엔드만 실행
   pnpm dev-web

   # 백엔드만 실행
   pnpm dev-api
   ```

## 📜 스크립트 명령어

| 명령어             | 설명                            |
| ------------------ | ------------------------------- |
| `pnpm dev`         | 전체 개발 서버 실행 (web + api) |
| `pnpm dev-web`     | 프론트엔드 개발 서버만 실행     |
| `pnpm dev-api`     | 백엔드 개발 서버만 실행         |
| `pnpm build`       | 프로덕션 빌드                   |
| `pnpm lint`        | ESLint 실행                     |
| `pnpm format`      | Prettier로 코드 포맷팅          |
| `pnpm check-types` | TypeScript 타입 체크            |
| `pnpm storybook`   | Storybook 실행                  |
| `pnpm infra`       | Docker Compose로 인프라 실행    |

## 🏗️ 아키텍처

### 인프라 아키텍처

![](https://github.com/user-attachments/assets/f8377ca0-ae7a-4187-8396-09bdd4ce8522)

그 밖의 아키텍처 관련 내용은 [Wiki - 서비스 아키텍처](https://github.com/boostcampwm2025/web11-MMH/wiki/%EC%84%9C%EB%B9%84%EC%8A%A4-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98)를 참고해주세요!

## 🛠️ 기술 스택

### Common

<div>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Turborepo-FF1E56?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</div>

### Frontend

<div>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white" alt="Storybook" />
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
</div>

### Backend

<div>
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white" alt="TypeORM" />
  <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
</div>

### Infrastructure & AI

<div>
  <img src="https://img.shields.io/badge/Naver_Cloud_Platform-03C75A?style=for-the-badge&logo=naver&logoColor=white" alt="Naver Cloud Platform" />
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions" />
  <img src="https://img.shields.io/badge/google%20gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white" alt="Google Gemini" />
</div>

## 👥 만든 사람들

| [<img src="https://github.com/AYEOOON.png" width="100px">](https://github.com/AYEOOON) | [<img src="https://github.com/kimjihyo.png" width="100px">](https://github.com/kimjihyo) | [<img src="https://github.com/dltnwjd308.png" width="100px">](https://github.com/dltnwjd308) | [<img src="https://github.com/rwaeng.png" width="100px">](https://github.com/rwaeng) | [<img src="https://github.com/swgivenchy.png" width="100px">](https://github.com/swgivenchy) |
| :------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------: |
|                       [J050\_김아연](https://github.com/AYEOOON)                       |                       [J073\_김지효](https://github.com/kimjihyo)                        |                        [J192\_이수정](https://github.com/dltnwjd308)                         |                      [J252\_조아령](https://github.com/rwaeng)                       |                        [J272\_최준호](https://github.com/swgivenchy)                         |
|                                          해리                                          |                                           조엘                                           |                                             조이                                             |                                         알로                                         |                                             루이                                             |
|                                        **INfP**                                        |                                         **INFj**                                         |                                           **ISTJ**                                           |                                       **ISFJ**                                       |                                           **ISfP**                                           |

> 서로 다른 내향인 5명이 모였어요!
