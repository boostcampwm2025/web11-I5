import { QueryRunner } from 'typeorm';
import { BaseSeed } from './seed.interface';

interface CategoryRow {
  id: number;
  name: string;
}

interface QuestionData {
  title: string;
  content: string;
  avgImportance: number;
  categoryName: string;
}

const questionData: QuestionData[] = [
  // Computer Science - Network
  {
    title: 'TCP와 UDP의 차이점',
    content:
      'TCP와 UDP의 차이점에 대해 설명하고, 각각 어떤 상황에서 사용하는 것이 적합한지 예시를 들어 설명해주세요.',
    avgImportance: 4.8,
    categoryName: 'Network',
  },
  {
    title: 'OSI 7계층 모델',
    content:
      'OSI 7계층 모델의 각 계층과 역할에 대해 설명하고, 데이터가 전송되는 과정을 설명해주세요.',
    avgImportance: 4.5,
    categoryName: 'Network',
  },
  {
    title: 'DNS 동작 원리',
    content:
      'DNS가 무엇이며, 도메인 이름을 IP 주소로 변환하는 과정을 설명해주세요.',
    avgImportance: 4.3,
    categoryName: 'Network',
  },
  {
    title: '로드 밸런싱의 종류와 알고리즘',
    content:
      '로드 밸런싱이 무엇이며, L4와 L7 로드 밸런싱의 차이점과 주요 알고리즘에 대해 설명해주세요.',
    avgImportance: 4.2,
    categoryName: 'Network',
  },
  {
    title: 'CDN이란 무엇인가',
    content:
      'CDN(Content Delivery Network)의 개념과 동작 원리, 그리고 사용 시 장점에 대해 설명해주세요.',
    avgImportance: 4.0,
    categoryName: 'Network',
  },

  // Computer Science - Computer Architecture
  {
    title: 'CPU와 메모리 구조',
    content:
      'CPU의 구성 요소와 메모리 계층 구조에 대해 설명하고, 캐시 메모리가 필요한 이유를 설명해주세요.',
    avgImportance: 4.4,
    categoryName: 'Computer Architecture',
  },
  {
    title: '캐시 메모리와 지역성',
    content:
      '캐시 메모리가 무엇이며, 시간적 지역성과 공간적 지역성에 대해 설명해주세요.',
    avgImportance: 4.3,
    categoryName: 'Computer Architecture',
  },
  {
    title: '파이프라이닝이란',
    content:
      'CPU의 파이프라이닝 기법에 대해 설명하고, 파이프라인 해저드의 종류와 해결 방법을 설명해주세요.',
    avgImportance: 3.8,
    categoryName: 'Computer Architecture',
  },
  {
    title: '32비트와 64비트 시스템의 차이',
    content:
      '32비트와 64비트 시스템의 차이점에 대해 설명하고, 64비트 시스템의 장점을 설명해주세요.',
    avgImportance: 3.5,
    categoryName: 'Computer Architecture',
  },

  // Computer Science - Data Structure
  {
    title: '배열과 연결 리스트의 차이',
    content:
      '배열과 연결 리스트의 차이점에 대해 설명하고, 각각의 시간 복잡도와 사용 시 적합한 상황을 설명해주세요.',
    avgImportance: 4.7,
    categoryName: 'Data Structure',
  },
  {
    title: '스택과 큐의 차이',
    content:
      '스택과 큐의 개념과 차이점에 대해 설명하고, 각각의 활용 예시를 들어주세요.',
    avgImportance: 4.5,
    categoryName: 'Data Structure',
  },
  {
    title: '해시 테이블의 동작 원리',
    content:
      '해시 테이블이 무엇이며, 해시 충돌이 발생했을 때 해결하는 방법에 대해 설명해주세요.',
    avgImportance: 4.8,
    categoryName: 'Data Structure',
  },
  {
    title: '이진 탐색 트리란',
    content:
      '이진 탐색 트리의 개념과 특징, 그리고 탐색/삽입/삭제의 시간 복잡도에 대해 설명해주세요.',
    avgImportance: 4.4,
    categoryName: 'Data Structure',
  },
  {
    title: '힙 자료구조',
    content:
      '힙 자료구조가 무엇이며, 최대 힙과 최소 힙의 차이점, 그리고 우선순위 큐와의 관계를 설명해주세요.',
    avgImportance: 4.3,
    categoryName: 'Data Structure',
  },
  {
    title: '그래프 자료구조',
    content:
      '그래프 자료구조의 개념과 표현 방법(인접 행렬, 인접 리스트)에 대해 설명하고, 각각의 장단점을 비교해주세요.',
    avgImportance: 4.2,
    categoryName: 'Data Structure',
  },
  {
    title: '트라이 자료구조',
    content:
      '트라이 자료구조가 무엇이며, 어떤 상황에서 사용하면 효율적인지 설명해주세요.',
    avgImportance: 3.8,
    categoryName: 'Data Structure',
  },

  // Computer Science - Operating System
  {
    title: '프로세스와 스레드의 차이',
    content:
      '프로세스와 스레드의 차이점에 대해 설명하고, 멀티프로세스와 멀티스레드의 장단점을 비교해주세요.',
    avgImportance: 4.9,
    categoryName: 'Operating System',
  },
  {
    title: '컨텍스트 스위칭이란',
    content:
      '컨텍스트 스위칭이 무엇이며, 왜 오버헤드가 발생하는지 설명해주세요.',
    avgImportance: 4.6,
    categoryName: 'Operating System',
  },
  {
    title: '데드락의 조건과 해결 방법',
    content:
      '데드락이 발생하기 위한 4가지 필수 조건과 데드락을 예방/회피/탐지하는 방법에 대해 설명해주세요.',
    avgImportance: 4.7,
    categoryName: 'Operating System',
  },
  {
    title: '가상 메모리란 무엇인가',
    content: '가상 메모리의 개념과 페이징, 세그멘테이션에 대해 설명해주세요.',
    avgImportance: 4.5,
    categoryName: 'Operating System',
  },
  {
    title: '페이지 교체 알고리즘',
    content:
      '페이지 폴트가 무엇이며, FIFO, LRU, LFU 등 페이지 교체 알고리즘에 대해 설명해주세요.',
    avgImportance: 4.3,
    categoryName: 'Operating System',
  },
  {
    title: 'CPU 스케줄링 알고리즘',
    content:
      'CPU 스케줄링 알고리즘의 종류(FCFS, SJF, RR 등)와 각각의 특징에 대해 설명해주세요.',
    avgImportance: 4.4,
    categoryName: 'Operating System',
  },
  {
    title: '뮤텍스와 세마포어의 차이',
    content:
      '뮤텍스와 세마포어의 차이점에 대해 설명하고, 각각 어떤 상황에서 사용하는지 설명해주세요.',
    avgImportance: 4.5,
    categoryName: 'Operating System',
  },

  // Computer Science - Database
  {
    title: '데이터베이스 정규화',
    content:
      '데이터베이스 정규화가 무엇이며, 왜 필요한지 설명해주세요. 1NF, 2NF, 3NF에 대해 각각 설명해주세요.',
    avgImportance: 4.6,
    categoryName: 'Database',
  },
  {
    title: '인덱스의 동작 원리',
    content:
      '데이터베이스 인덱스가 무엇이며, B-Tree 인덱스의 동작 원리와 사용 시 주의할 점을 설명해주세요.',
    avgImportance: 4.8,
    categoryName: 'Database',
  },
  {
    title: 'ACID 속성이란',
    content:
      '트랜잭션의 ACID 속성에 대해 각각 설명하고, 왜 중요한지 설명해주세요.',
    avgImportance: 4.7,
    categoryName: 'Database',
  },
  {
    title: 'SQL과 NoSQL의 차이',
    content:
      'SQL과 NoSQL 데이터베이스의 차이점에 대해 설명하고, 각각 어떤 상황에서 사용하면 좋은지 설명해주세요.',
    avgImportance: 4.5,
    categoryName: 'Database',
  },
  {
    title: '트랜잭션 격리 수준',
    content:
      '트랜잭션의 격리 수준 4가지(Read Uncommitted, Read Committed, Repeatable Read, Serializable)에 대해 설명해주세요.',
    avgImportance: 4.4,
    categoryName: 'Database',
  },
  {
    title: 'JOIN의 종류',
    content:
      'SQL JOIN의 종류(INNER, LEFT, RIGHT, FULL OUTER, CROSS)에 대해 설명하고, 각각의 차이점을 설명해주세요.',
    avgImportance: 4.3,
    categoryName: 'Database',
  },
  {
    title: '데이터베이스 락의 종류',
    content:
      '데이터베이스의 락(Lock) 종류와 낙관적 락, 비관적 락의 차이점에 대해 설명해주세요.',
    avgImportance: 4.2,
    categoryName: 'Database',
  },

  // Computer Science - Software Engineering
  {
    title: '객체지향 프로그래밍의 특징',
    content:
      '객체지향 프로그래밍의 4가지 특징(캡슐화, 상속, 다형성, 추상화)에 대해 설명해주세요.',
    avgImportance: 4.6,
    categoryName: 'Software Engineering',
  },
  {
    title: 'SOLID 원칙이란',
    content: '객체지향 설계의 SOLID 원칙 5가지에 대해 각각 설명해주세요.',
    avgImportance: 4.7,
    categoryName: 'Software Engineering',
  },
  {
    title: '디자인 패턴 - 싱글톤',
    content:
      '싱글톤 패턴이 무엇이며, 구현 방법과 사용 시 주의할 점에 대해 설명해주세요.',
    avgImportance: 4.3,
    categoryName: 'Software Engineering',
  },
  {
    title: '디자인 패턴 - 팩토리',
    content:
      '팩토리 패턴(팩토리 메서드, 추상 팩토리)에 대해 설명하고, 언제 사용하면 좋은지 설명해주세요.',
    avgImportance: 4.2,
    categoryName: 'Software Engineering',
  },
  {
    title: 'TDD란 무엇인가',
    content:
      'TDD(Test-Driven Development)가 무엇이며, 장단점과 TDD 사이클에 대해 설명해주세요.',
    avgImportance: 4.1,
    categoryName: 'Software Engineering',
  },
  {
    title: 'CI/CD란 무엇인가',
    content:
      'CI(Continuous Integration)와 CD(Continuous Deployment/Delivery)의 개념과 차이점에 대해 설명해주세요.',
    avgImportance: 4.4,
    categoryName: 'Software Engineering',
  },

  // Computer Science - Algorithm
  {
    title: '시간 복잡도와 공간 복잡도',
    content:
      '시간 복잡도와 공간 복잡도가 무엇이며, Big-O 표기법에 대해 설명해주세요.',
    avgImportance: 4.8,
    categoryName: 'Algorithm',
  },
  {
    title: '정렬 알고리즘 비교',
    content:
      '버블 정렬, 선택 정렬, 삽입 정렬, 퀵 정렬, 병합 정렬의 시간 복잡도와 특징을 비교해주세요.',
    avgImportance: 4.6,
    categoryName: 'Algorithm',
  },
  {
    title: '이진 탐색 알고리즘',
    content:
      '이진 탐색 알고리즘의 원리와 시간 복잡도, 그리고 사용 조건에 대해 설명해주세요.',
    avgImportance: 4.5,
    categoryName: 'Algorithm',
  },
  {
    title: 'DFS와 BFS의 차이',
    content:
      'DFS(깊이 우선 탐색)와 BFS(너비 우선 탐색)의 차이점과 각각의 구현 방법, 활용 사례에 대해 설명해주세요.',
    avgImportance: 4.7,
    categoryName: 'Algorithm',
  },
  {
    title: '동적 프로그래밍이란',
    content:
      '동적 프로그래밍(DP)이 무엇이며, 메모이제이션과 타뷸레이션의 차이점에 대해 설명해주세요.',
    avgImportance: 4.4,
    categoryName: 'Algorithm',
  },
  {
    title: '그리디 알고리즘이란',
    content:
      '그리디 알고리즘의 개념과 동적 프로그래밍과의 차이점, 그리고 적용 가능한 조건에 대해 설명해주세요.',
    avgImportance: 4.2,
    categoryName: 'Algorithm',
  },

  // Web - Browser Rendering
  {
    title: '브라우저 렌더링 과정',
    content:
      '브라우저가 HTML, CSS, JavaScript를 파싱하여 화면에 렌더링하는 과정을 설명해주세요.',
    avgImportance: 4.7,
    categoryName: 'Browser Rendering',
  },
  {
    title: 'DOM과 CSSOM',
    content:
      'DOM과 CSSOM이 무엇이며, 렌더 트리가 어떻게 구성되는지 설명해주세요.',
    avgImportance: 4.4,
    categoryName: 'Browser Rendering',
  },
  {
    title: 'Reflow와 Repaint',
    content:
      'Reflow와 Repaint의 차이점에 대해 설명하고, 성능 최적화를 위해 어떻게 최소화할 수 있는지 설명해주세요.',
    avgImportance: 4.5,
    categoryName: 'Browser Rendering',
  },
  {
    title: '크리티컬 렌더링 패스',
    content:
      '크리티컬 렌더링 패스(Critical Rendering Path)가 무엇이며, 최적화 방법에 대해 설명해주세요.',
    avgImportance: 4.2,
    categoryName: 'Browser Rendering',
  },

  // Web - Security
  {
    title: 'XSS 공격과 방어',
    content:
      'XSS(Cross-Site Scripting) 공격이 무엇이며, 어떻게 방어할 수 있는지 설명해주세요.',
    avgImportance: 4.8,
    categoryName: 'Security',
  },
  {
    title: 'CSRF 공격과 방어',
    content:
      'CSRF(Cross-Site Request Forgery) 공격이 무엇이며, 어떻게 방어할 수 있는지 설명해주세요.',
    avgImportance: 4.7,
    categoryName: 'Security',
  },
  {
    title: 'SQL Injection 공격과 방어',
    content:
      'SQL Injection 공격이 무엇이며, 어떻게 방어할 수 있는지 설명해주세요.',
    avgImportance: 4.6,
    categoryName: 'Security',
  },
  {
    title: 'CORS란 무엇인가',
    content:
      'CORS(Cross-Origin Resource Sharing)가 무엇이며, 왜 필요한지 설명해주세요.',
    avgImportance: 4.5,
    categoryName: 'Security',
  },
  {
    title: 'JWT 토큰 인증',
    content:
      'JWT(JSON Web Token)의 구조와 동작 원리, 그리고 세션 기반 인증과의 차이점을 설명해주세요.',
    avgImportance: 4.6,
    categoryName: 'Security',
  },

  // Web - Rest API
  {
    title: 'REST API란 무엇인가',
    content: 'REST API의 개념과 RESTful한 API 설계 원칙에 대해 설명해주세요.',
    avgImportance: 4.8,
    categoryName: 'Rest API',
  },
  {
    title: 'HTTP 메서드의 종류',
    content:
      'HTTP 메서드(GET, POST, PUT, PATCH, DELETE)의 차이점과 각각의 용도에 대해 설명해주세요.',
    avgImportance: 4.6,
    categoryName: 'Rest API',
  },
  {
    title: 'HTTP 상태 코드',
    content:
      'HTTP 상태 코드의 분류(1xx, 2xx, 3xx, 4xx, 5xx)와 주요 상태 코드에 대해 설명해주세요.',
    avgImportance: 4.4,
    categoryName: 'Rest API',
  },
  {
    title: 'API 버저닝 전략',
    content:
      'REST API 버저닝 방법(URL, 헤더, 쿼리 파라미터)의 장단점에 대해 설명해주세요.',
    avgImportance: 3.8,
    categoryName: 'Rest API',
  },

  // Web - HTTP(S)
  {
    title: 'HTTP와 HTTPS의 차이점',
    content:
      'HTTP와 HTTPS의 차이점에 대해 설명하고, HTTPS가 보안상 안전한 이유를 설명해주세요.',
    avgImportance: 4.5,
    categoryName: 'HTTP(S)',
  },
  {
    title: 'HTTP/1.1과 HTTP/2의 차이',
    content:
      'HTTP/1.1과 HTTP/2의 차이점에 대해 설명하고, HTTP/2의 주요 특징을 설명해주세요.',
    avgImportance: 4.3,
    categoryName: 'HTTP(S)',
  },
  {
    title: 'TLS/SSL 핸드셰이크',
    content: 'TLS/SSL 핸드셰이크 과정에 대해 설명해주세요.',
    avgImportance: 4.1,
    categoryName: 'HTTP(S)',
  },
  {
    title: 'HTTP 헤더의 종류',
    content:
      'HTTP 요청/응답 헤더의 주요 종류와 각각의 역할에 대해 설명해주세요.',
    avgImportance: 4.0,
    categoryName: 'HTTP(S)',
  },

  // Web - Caching
  {
    title: '브라우저 캐싱 전략',
    content:
      '브라우저 캐싱이 무엇이며, Cache-Control 헤더의 주요 디렉티브에 대해 설명해주세요.',
    avgImportance: 4.4,
    categoryName: 'Caching',
  },
  {
    title: 'ETag와 Last-Modified',
    content:
      'ETag와 Last-Modified 헤더의 역할과 조건부 요청에 대해 설명해주세요.',
    avgImportance: 4.1,
    categoryName: 'Caching',
  },
  {
    title: '서버 사이드 캐싱',
    content:
      'Redis, Memcached 등을 이용한 서버 사이드 캐싱 전략에 대해 설명해주세요.',
    avgImportance: 4.3,
    categoryName: 'Caching',
  },

  // Web - Infra
  {
    title: 'Docker란 무엇인가',
    content:
      'Docker의 개념과 가상머신과의 차이점, 그리고 컨테이너의 장점에 대해 설명해주세요.',
    avgImportance: 4.6,
    categoryName: 'Infra',
  },
  {
    title: 'Kubernetes란 무엇인가',
    content:
      'Kubernetes의 개념과 주요 컴포넌트(Pod, Service, Deployment 등)에 대해 설명해주세요.',
    avgImportance: 4.3,
    categoryName: 'Infra',
  },
  {
    title: '마이크로서비스 아키텍처',
    content:
      '마이크로서비스 아키텍처의 개념과 모놀리식 아키텍처와의 차이점, 장단점에 대해 설명해주세요.',
    avgImportance: 4.4,
    categoryName: 'Infra',
  },

  // Frontend - React
  {
    title: 'React의 Virtual DOM',
    content:
      'React의 Virtual DOM이 무엇이며, 어떻게 동작하는지 설명해주세요. 그리고 왜 성능 개선에 도움이 되는지 설명해주세요.',
    avgImportance: 4.7,
    categoryName: 'React',
  },
  {
    title: 'React의 생명주기',
    content:
      'React 컴포넌트의 생명주기(Lifecycle)에 대해 설명하고, 클래스 컴포넌트와 함수형 컴포넌트에서의 차이를 설명해주세요.',
    avgImportance: 4.5,
    categoryName: 'React',
  },
  {
    title: 'useState와 useEffect',
    content:
      'React Hooks의 useState와 useEffect에 대해 설명하고, 사용 시 주의할 점을 설명해주세요.',
    avgImportance: 4.6,
    categoryName: 'React',
  },
  {
    title: 'useMemo와 useCallback',
    content:
      'useMemo와 useCallback의 차이점과 각각 언제 사용해야 하는지 설명해주세요.',
    avgImportance: 4.4,
    categoryName: 'React',
  },
  {
    title: 'React의 상태 관리',
    content:
      'React에서 상태 관리 방법(useState, Context API, Redux 등)에 대해 설명하고, 각각의 장단점을 비교해주세요.',
    avgImportance: 4.5,
    categoryName: 'React',
  },
  {
    title: 'React의 Key 속성',
    content:
      'React에서 리스트를 렌더링할 때 Key 속성이 왜 필요한지 설명해주세요.',
    avgImportance: 4.3,
    categoryName: 'React',
  },
  {
    title: 'React의 Reconciliation',
    content: 'React의 재조정(Reconciliation) 알고리즘에 대해 설명해주세요.',
    avgImportance: 4.2,
    categoryName: 'React',
  },

  // Frontend - JavaScript
  {
    title: '클로저란 무엇인가',
    content:
      'JavaScript의 클로저(Closure)가 무엇이며, 실제 활용 예시를 들어 설명해주세요.',
    avgImportance: 4.8,
    categoryName: 'JavaScript',
  },
  {
    title: '호이스팅이란 무엇인가',
    content:
      'JavaScript의 호이스팅(Hoisting)이 무엇이며, var, let, const의 차이점과 함께 설명해주세요.',
    avgImportance: 4.6,
    categoryName: 'JavaScript',
  },
  {
    title: '이벤트 루프와 비동기',
    content:
      'JavaScript의 이벤트 루프(Event Loop)가 어떻게 동작하는지 설명하고, 콜 스택, 태스크 큐, 마이크로태스크 큐에 대해 설명해주세요.',
    avgImportance: 4.9,
    categoryName: 'JavaScript',
  },
  {
    title: 'Promise와 async/await',
    content:
      'Promise와 async/await의 개념과 차이점, 그리고 에러 처리 방법에 대해 설명해주세요.',
    avgImportance: 4.7,
    categoryName: 'JavaScript',
  },
  {
    title: 'this 바인딩',
    content:
      'JavaScript에서 this가 어떻게 바인딩되는지 설명하고, call, apply, bind의 차이점을 설명해주세요.',
    avgImportance: 4.5,
    categoryName: 'JavaScript',
  },
  {
    title: '프로토타입 체인',
    content:
      'JavaScript의 프로토타입 체인(Prototype Chain)이 무엇이며, 어떻게 동작하는지 설명해주세요.',
    avgImportance: 4.4,
    categoryName: 'JavaScript',
  },
  {
    title: 'ES6+ 주요 문법',
    content:
      'ES6 이후 추가된 주요 문법(화살표 함수, 구조 분해, 스프레드 연산자, 템플릿 리터럴 등)에 대해 설명해주세요.',
    avgImportance: 4.3,
    categoryName: 'JavaScript',
  },

  // Frontend - TypeScript
  {
    title: 'TypeScript를 사용하는 이유',
    content:
      'TypeScript를 사용하는 이유와 JavaScript 대비 장점에 대해 설명해주세요.',
    avgImportance: 4.5,
    categoryName: 'TypeScript',
  },
  {
    title: 'TypeScript의 타입 종류',
    content:
      'TypeScript의 기본 타입과 고급 타입(Union, Intersection, Generic 등)에 대해 설명해주세요.',
    avgImportance: 4.4,
    categoryName: 'TypeScript',
  },
  {
    title: 'interface와 type의 차이',
    content:
      'TypeScript에서 interface와 type alias의 차이점에 대해 설명해주세요.',
    avgImportance: 4.3,
    categoryName: 'TypeScript',
  },
  {
    title: 'TypeScript의 제네릭',
    content:
      'TypeScript의 제네릭(Generic)이 무엇이며, 언제 사용하면 좋은지 예시와 함께 설명해주세요.',
    avgImportance: 4.2,
    categoryName: 'TypeScript',
  },

  // Frontend - CSS
  {
    title: 'CSS Box Model',
    content:
      'CSS Box Model에 대해 설명하고, content-box와 border-box의 차이점을 설명해주세요.',
    avgImportance: 4.4,
    categoryName: 'CSS',
  },
  {
    title: 'Flexbox와 Grid의 차이',
    content:
      'CSS Flexbox와 Grid의 차이점과 각각 언제 사용하면 좋은지 설명해주세요.',
    avgImportance: 4.5,
    categoryName: 'CSS',
  },
  {
    title: 'CSS 선택자 우선순위',
    content:
      'CSS 선택자의 우선순위(Specificity)가 어떻게 계산되는지 설명해주세요.',
    avgImportance: 4.2,
    categoryName: 'CSS',
  },
  {
    title: 'CSS-in-JS란',
    content:
      'CSS-in-JS의 개념과 장단점, 그리고 대표적인 라이브러리에 대해 설명해주세요.',
    avgImportance: 4.0,
    categoryName: 'CSS',
  },

  // Frontend - Build Tools
  {
    title: 'Webpack이란 무엇인가',
    content:
      'Webpack의 개념과 주요 구성 요소(Entry, Output, Loader, Plugin)에 대해 설명해주세요.',
    avgImportance: 4.3,
    categoryName: 'Build Tools',
  },
  {
    title: '번들링과 트리 쉐이킹',
    content:
      '번들링이 무엇이며, 트리 쉐이킹(Tree Shaking)이 어떻게 동작하는지 설명해주세요.',
    avgImportance: 4.2,
    categoryName: 'Build Tools',
  },
  {
    title: 'Babel이란 무엇인가',
    content: 'Babel의 역할과 트랜스파일링 과정에 대해 설명해주세요.',
    avgImportance: 4.1,
    categoryName: 'Build Tools',
  },

  // Backend - Node.js
  {
    title: 'Node.js의 특징',
    content:
      'Node.js의 특징(싱글 스레드, 이벤트 기반, 논블로킹 I/O)에 대해 설명해주세요.',
    avgImportance: 4.6,
    categoryName: 'Node.js',
  },
  {
    title: 'npm과 package.json',
    content: 'npm의 역할과 package.json 파일의 주요 속성에 대해 설명해주세요.',
    avgImportance: 4.3,
    categoryName: 'Node.js',
  },
  {
    title: 'Express.js 미들웨어',
    content:
      'Express.js의 미들웨어가 무엇이며, 어떻게 동작하는지 설명해주세요.',
    avgImportance: 4.4,
    categoryName: 'Node.js',
  },

  // Backend - NestJS
  {
    title: 'NestJS의 아키텍처',
    content:
      'NestJS의 모듈, 컨트롤러, 서비스 구조에 대해 설명하고, 의존성 주입이 어떻게 동작하는지 설명해주세요.',
    avgImportance: 4.5,
    categoryName: 'NestJS',
  },
  {
    title: 'NestJS의 데코레이터',
    content:
      'NestJS에서 사용하는 주요 데코레이터(@Controller, @Injectable, @Module 등)에 대해 설명해주세요.',
    avgImportance: 4.3,
    categoryName: 'NestJS',
  },
  {
    title: 'NestJS의 Guard와 Interceptor',
    content:
      'NestJS의 Guard와 Interceptor의 역할과 차이점에 대해 설명해주세요.',
    avgImportance: 4.2,
    categoryName: 'NestJS',
  },
  {
    title: 'NestJS의 Pipe',
    content:
      'NestJS의 Pipe가 무엇이며, 유효성 검사와 데이터 변환에 어떻게 사용되는지 설명해주세요.',
    avgImportance: 4.1,
    categoryName: 'NestJS',
  },
];

export class QuestionSeed extends BaseSeed {
  name = 'QuestionSeed';
  environment: 'development' | 'production' | 'both' = 'development';

  async run(queryRunner: QueryRunner): Promise<void> {
    const result = (await queryRunner.query(
      `SELECT COUNT(*) as count FROM questions`,
    )) as Array<{ count: string }>;

    if (parseInt(result[0].count) > 0) {
      console.log('Questions already exist, skipping...');
      return;
    }

    const categories = (await queryRunner.query(`
      SELECT id, name FROM categories WHERE depth = 2;
    `)) as CategoryRow[];

    const getCategoryId = (name: string): number | undefined =>
      categories.find((c) => c.name === name)?.id;

    const values = questionData
      .map((q) => {
        const categoryId = getCategoryId(q.categoryName);
        if (!categoryId) {
          console.warn(`Category not found: ${q.categoryName}`);
          return null;
        }
        const escapedTitle = q.title.replace(/'/g, "''");
        const escapedContent = q.content.replace(/'/g, "''");
        return `('${escapedTitle}', '${escapedContent}', NULL, 0, ${q.avgImportance}, ${categoryId})`;
      })
      .filter(Boolean)
      .join(',\n        ');

    await queryRunner.query(`
      INSERT INTO questions (
        title,
        content,
        tts_url,
        avg_score,
        avg_importance,
        category_id
      )
      VALUES
        ${values};
    `);

    console.log(`Inserted ${questionData.length} questions`);
  }
}
