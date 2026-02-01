# 말만해

<p align="center">
  <img src="https://github.com/user-attachments/assets/f4ee6cd3-3622-4f7c-b729-f842cb3a971d" width="80%">
</p>

<div align="center">
  <h4>말로 설명하며 배우는 AI 기반 CS 학습 플랫폼</h4> 
</div>

## 💭 이런 불편함에서 시작했습니다

- CS 학습이 개념 이해에 머물러, 이를 논리적으로 설명하고 점검할 기회가 부족합니다.
- 내가 아는 내용을 객관적으로 평가받고 피드백 받을 수 있는 환경이 충분하지 않습니다.
- 개념 간 연결 구조를 파악하기 어려워 전체적인 CS 지식 체계를 세우기 힘듭니다.
- 학습을 꾸준히 이어갈 동기화 루틴이 부족해, 일정 시점 이후 학습이 중단됩니다.

## 🛠️ 이 불편함을 이렇게 해결합니다

### 🎙️ 음성 답변으로 설명하기

- 말로 개념을 설명하며 생각을 정리합니다.
- Clova Speech로 음성을 STT 변환한 뒤, Gemini로 문맥에 맞게 답변을 후보정합니다.
- STT 단독 사용 시 발생하는 인식 오류를 줄여 설명의 의도가 최대한 정확히 반영되도록 설계되었습니다.

[음성 입력부터 의미 보정까지, Presigned URL–STT–Gemini 파이프라인 설계](https://github.com/boostcampwm2025/web11-MMH)

![speech gif](https://res.cloudinary.com/dab33vdij/image/upload/v1769955242/speech_wcgijb.gif)

### 🤖 AI 체점으로 CS 실력 확인

- 루브릭 기반 평가를 통해 답변을 정량적으로 점수화합니다.
- 총점과 세부 점수를 통해 현재 CS 이해 수준을 확인할 수 있습니다.

[CS 답변을 정량화하기 위한 루브릭 기반 AI 체점 설계](https://github.com/boostcampwm2025/web11-MMH)

![reports gif](https://res.cloudinary.com/dab33vdij/image/upload/v1769955243/reports_dc6ggr.gif)

### 🧠 나의 답변으로 완성되는 지식 그래프

- 사용자 답변에서 핵심 키워드르 자동으로 추출합니다.
- 각 질문과 키워드는 사용자 설명에 따라 다르게 구성됩니다.
- 답변한 질문은 그래프의 노드가 됩니다.
- 문제를 풀수록 키워드 간 연결이 쌓이며, 나만의 CS 지식 구조가 시각화됩니다.

[왜 그래프 라이브러리를 쓰지 않았을까: Canvas로 구현한 개인화 지식 그래프](https://github.com/boostcampwm2025/web11-MMH)

![graph gif](https://res.cloudinary.com/dab33vdij/image/upload/v1769955242/graph_xzqvtp.gif)

### 🖼️ 명화 스트릭으로 학습 지속

- 문제를 하나씩 풀수록 셀이 채워지며 그림이 점진적으로 완성됩니다.
- 문제 풀이 결과가 시각적으로 누적되어, 자연스럽게 학습 지속을 유도합니다.

[보로노이 알고리즘으로 구현한 학습 스트릭 시스템](https://github.com/boostcampwm2025/web11-MMH)

![streak gif](https://res.cloudinary.com/dab33vdij/image/upload/v1769955850/streak_zmtllj.gif)

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

## 👥 팀원 소개

| [<img src="https://github.com/AYEOOON.png" width="100px">](https://github.com/AYEOOON) | [<img src="https://github.com/kimjihyo.png" width="100px">](https://github.com/kimjihyo) | [<img src="https://github.com/dltnwjd308.png" width="100px">](https://github.com/dltnwjd308) | [<img src="https://github.com/rwaeng.png" width="100px">](https://github.com/rwaeng) | [<img src="https://github.com/swgivenchy.png" width="100px">](https://github.com/swgivenchy) |
| :------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------: |
|                       [J050\_김아연](https://github.com/AYEOOON)                       |                       [J073\_김지효](https://github.com/kimjihyo)                        |                        [J192\_이수정](https://github.com/dltnwjd308)                         |                      [J252\_조아령](https://github.com/rwaeng)                       |                        [J272\_최준호](https://github.com/swgivenchy)                         |
|                                          해리                                          |                                           조엘                                           |                                             조이                                             |                                         알로                                         |                                             루이                                             |
|                                        **INfP**                                        |                                         **INFj**                                         |                                           **ISTJ**                                           |                                       **ISFJ**                                       |                                           **ISfP**                                           |
