# 말만해

<img src="https://github.com/user-attachments/assets/d6ad76ea-e6ad-4ee2-b47b-488435f148fa">

<div align="center">
  <h4>말로 설명하며 배우는 AI 기반 CS 학습 플랫폼</h4> 
</div>

<br />

## 💭 이런 불편함에서 시작했습니다

- CS 학습이 개념 이해에 머물러, 이를 논리적으로 설명하고 점검할 기회가 부족합니다.
- 내가 알고 있는 지식의 오개념을 피드백 받을 수 있는 환경이 충분하지 않습니다.
- 개념 간 연결 구조를 파악하기 어려워 전체적인 CS 지식 체계를 세우기 힘듭니다.
- 학습을 꾸준히 이어갈 동기화 루틴이 부족해, 일정 시점 이후 학습이 중단됩니다.

<br />

## 🛠️ 이 불편함을 이렇게 해결합니다

### 🎙️ 음성 답변으로 설명하기

- 말로 개념을 설명하며 생각을 정리합니다.
- Clova Speech로 음성을 STT 변환한 뒤, Gemini로 문맥에 맞게 답변을 후보정합니다.
- STT 단독 사용 시 발생하는 인식 오류를 줄여 설명의 의도가 최대한 정확히 반영되도록 설계되었습니다.

[🔗 음성 입력부터 의미 보정까지, Presigned URL–STT–Gemini 파이프라인 설계](https://github.com/boostcampwm2025/web11-MMH/wiki/%EC%9D%8C%EC%84%B1-%EC%9E%85%EB%A0%A5%EB%B6%80%ED%84%B0-%EC%9D%98%EB%AF%B8-%EB%B3%B4%EC%A0%95%EA%B9%8C%EC%A7%80,-Presigned-URL%E2%80%93STT%E2%80%93Gemini-%ED%8C%8C%EC%9D%B4%ED%94%84%EB%9D%BC%EC%9D%B8-%EC%84%A4%EA%B3%84)

[🔗 Canvas로 직접 실시간 녹음 파형 그래프 그리기](https://github.com/boostcampwm2025/web11-MMH/wiki/Canvas%EB%A1%9C-%EC%A7%81%EC%A0%91-%EC%8B%A4%EC%8B%9C%EA%B0%84-%EB%85%B9%EC%9D%8C-%ED%8C%8C%ED%98%95-%EA%B7%B8%EB%9E%98%ED%94%84-%EA%B7%B8%EB%A6%AC%EA%B8%B0)

![speech](https://github.com/user-attachments/assets/483df25f-4420-4cdd-8b7f-9fb659160933)

<br />

### 🤖 AI 채점으로 CS 실력 확인

- 루브릭 기반 평가를 통해 답변을 정량적으로 점수화합니다.
- 총점과 세부 점수를 통해 현재 CS 이해 수준을 확인할 수 있습니다.

[🔗 CS 답변을 정량화하기 위한 루브릭 기반 AI 채점 설계](https://github.com/boostcampwm2025/web11-MMH/wiki/CS-%EB%8B%B5%EB%B3%80%EC%9D%84-%EC%A0%95%EB%9F%89%ED%99%94%ED%95%98%EA%B8%B0-%EC%9C%84%ED%95%9C-%EB%A3%A8%EB%B8%8C%EB%A6%AD-%EA%B8%B0%EB%B0%98-AI-%EC%B1%84%EC%A0%90-%EC%84%A4%EA%B3%84)

![reports](https://github.com/user-attachments/assets/b0e67df3-08e3-40a7-aaaf-f8e81bf9206a)

<br />

### 🧠 나의 답변으로 완성되는 지식 그래프

- 사용자 답변에서 핵심 키워드르 자동으로 추출합니다.
- 각 질문과 키워드는 사용자 설명에 따라 다르게 구성됩니다.
- 답변한 질문은 그래프의 노드가 됩니다.
- 문제를 풀수록 키워드 간 연결이 쌓이며, 나만의 CS 지식 구조가 시각화됩니다.

[🔗 왜 그래프 라이브러리를 쓰지 않았을까: Canvas로 구현한 개인화 지식 그래프](https://github.com/boostcampwm2025/web11-MMH/wiki/%EC%99%9C-%EA%B7%B8%EB%9E%98%ED%94%84-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC%EB%A5%BC-%EC%93%B0%EC%A7%80-%EC%95%8A%EC%95%98%EC%9D%84%EA%B9%8C:-Canvas%EB%A1%9C-%EA%B5%AC%ED%98%84%ED%95%9C-%EA%B0%9C%EC%9D%B8%ED%99%94-%EC%A7%80%EC%8B%9D-%EA%B7%B8%EB%9E%98%ED%94%84)

![graph](https://github.com/user-attachments/assets/94a3ac5e-51e0-46c6-817c-eb20ea161db4)

<br />

### 🖼️ 명화 스트릭으로 학습 지속

- 문제를 하나씩 풀수록 셀이 채워지며 그림이 점진적으로 완성됩니다.
- 문제 풀이 결과가 시각적으로 누적되어, 자연스럽게 학습 지속을 유도합니다.

[🔗 보로노이 알고리즘으로 구현한 학습 스트릭 시스템](https://github.com/boostcampwm2025/web11-MMH/wiki/%EB%B3%B4%EB%A1%9C%EB%85%B8%EC%9D%B4-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98%EC%9C%BC%EB%A1%9C-%EA%B5%AC%ED%98%84%ED%95%9C-%ED%95%99%EC%8A%B5-%EC%8A%A4%ED%8A%B8%EB%A6%AD-%EC%8B%9C%EC%8A%A4%ED%85%9C)

![streak](https://github.com/user-attachments/assets/5bfbdaef-a173-4c03-a3db-1aa8c1750688)

<br />

## 🚀 로컬에서 실행하기

> Node.js, pnpm, Docker가 설치되어 있어야 합니다.

```sh
# 1. 레포지토리 클론
git clone https://github.com/boostcampwm2025/web11-MMH.git
cd web11-MMH

# 2. 프로젝트 의존성 설치
pnpm install

# 3. .env.local 파일을 참고하여 apps/web, apps/api 에 .env 파일을 각각 생성

# 4. Docker Compose를 사용해 인프라 실행 (DB 등)
pnpm infra

# 5. 개발 서버 실행 (web + api)
pnpm dev
```

환경변수 관련해서 더 자세한 내용은 [위키](https://github.com/boostcampwm2025/web11-MMH/wiki/%ED%99%98%EA%B2%BD%EB%B3%80%EC%88%98-%EC%B6%94%EA%B0%80%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)에서 확인해주세요!

<br />

## 🧩 기술 스택

[🔗 인프라 구성 및 배포 아키텍처](https://github.com/boostcampwm2025/web11-MMH/wiki/%EC%9D%B8%ED%94%84%EB%9D%BC-%EA%B5%AC%EC%84%B1-%EB%B0%8F-%EB%B0%B0%ED%8F%AC-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98)

<table>
    <thead>
        <tr>
            <th>Category</th>
            <th>Stack</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                <p align=center>Common</p>
            </td>
            <td>
                <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=ffffff">
                <img src="https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=ffffff">
								<img src="https://img.shields.io/badge/Turborepo-FF1E56?logo=turborepo&logoColor=white" alt="Turborepo" />
                <img src="https://img.shields.io/badge/ESLint-4B32C3?logo=Eslint">
            </td>
        </tr>
        <tr>
            <td>
               <p align=center>Frontend</p>
            </td>
            <td>
						  <img src="https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white" alt="Next.js" />
						  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
						  <img src="https://img.shields.io/badge/Storybook-FF4785?logo=storybook&logoColor=white" alt="Storybook" />
						  <img src="https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white" alt="Vitest" />
		        </td>
        </tr>
        <tr>
            <td>
                <p align=center>Backend</p>
            </td>
            <td>
              <img src="https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white" alt="NestJS" />
						  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
						  <img src="https://img.shields.io/badge/TypeORM-FE0803?logo=typeorm&logoColor=white" alt="TypeORM" />
						  <img src="https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white" alt="Jest" />
            </td>
        </tr>
        <tr>
            <td>
                <p align=center>Infrastructure & AI</p>
            </td>
            <td>
              <img src="https://img.shields.io/badge/Naver_Cloud_Platform-03C75A?logo=naver&logoColor=white" alt="Naver Cloud Platform" />
						  <img src="https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white" alt="Nginx" />
						  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker" />
						  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white" alt="GitHub Actions" />
						  <img src="https://img.shields.io/badge/google%20gemini-8E75B2?logo=google%20gemini&logoColor=white" alt="Google Gemini" />
            </td>
        </tr>
    </tbody>
</table>

<br />

## 👥 팀원 소개

| [<img src="https://github.com/AYEOOON.png" width="100px">](https://github.com/AYEOOON) | [<img src="https://github.com/kimjihyo.png" width="100px">](https://github.com/kimjihyo) | [<img src="https://github.com/dltnwjd308.png" width="100px">](https://github.com/dltnwjd308) | [<img src="https://github.com/rwaeng.png" width="100px">](https://github.com/rwaeng) | [<img src="https://github.com/swgivenchy.png" width="100px">](https://github.com/swgivenchy) |
| :------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------: |
|                       [J050\_김아연](https://github.com/AYEOOON)                       |                       [J073\_김지효](https://github.com/kimjihyo)                        |                        [J192\_이수정](https://github.com/dltnwjd308)                         |                      [J252\_조아령](https://github.com/rwaeng)                       |                        [J272\_최준호](https://github.com/swgivenchy)                         |
|                                          해리                                          |                                           조엘                                           |                                             조이                                             |                                         알로                                         |                                             루이                                             |
|                                        **INfP**                                        |                                         **INTj**                                         |                                           **ISTJ**                                           |                                       **isfj**                                       |                                           **ISfP**                                           |
