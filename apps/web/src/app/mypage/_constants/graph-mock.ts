import { GraphData, NodeType } from "../_types/graph-view";

export const mockGraphData: GraphData = {
  nodes: [
    // 기존
    {
      id: 1,
      type: NodeType.QUESTION,
      label: "React란 무엇인가요?",
      questionId: 1,
    },
    { id: 2, type: NodeType.KEYWORD, label: "React", questionId: null },
    { id: 3, type: NodeType.KEYWORD, label: "Virtual DOM", questionId: null },
    {
      id: 4,
      type: NodeType.QUESTION,
      label: "Virtual DOM의 동작 원리는?",
      questionId: 4,
    },
    { id: 5, type: NodeType.KEYWORD, label: "컴포넌트", questionId: null },
    {
      id: 6,
      type: NodeType.QUESTION,
      label: "useState와 useEffect 차이점은?",
      questionId: 6,
    },
    { id: 7, type: NodeType.KEYWORD, label: "Hook", questionId: null },
    // 추가
    { id: 8, type: NodeType.KEYWORD, label: "State", questionId: null },
    { id: 9, type: NodeType.KEYWORD, label: "Props", questionId: null },
    {
      id: 10,
      type: NodeType.QUESTION,
      label: "State와 Props의 차이는?",
      questionId: 10,
    },
    { id: 11, type: NodeType.KEYWORD, label: "Lifecycle", questionId: null },
    {
      id: 12,
      type: NodeType.QUESTION,
      label: "React 컴포넌트 생명주기는?",
      questionId: 12,
    },
    { id: 13, type: NodeType.KEYWORD, label: "useMemo", questionId: null },
    { id: 14, type: NodeType.KEYWORD, label: "useCallback", questionId: null },
    {
      id: 15,
      type: NodeType.QUESTION,
      label: "React 성능 최적화 방법은?",
      questionId: 15,
    },
    { id: 16, type: NodeType.KEYWORD, label: "Context API", questionId: null },
    {
      id: 17,
      type: NodeType.QUESTION,
      label: "Context API는 언제 사용하나요?",
      questionId: 17,
    },

    // --- [추가 데이터: JavaScript Core] (ID: 18 ~ 30) ---
    { id: 18, type: NodeType.KEYWORD, label: "JavaScript", questionId: null },
    { id: 19, type: NodeType.KEYWORD, label: "Closure", questionId: null },
    {
      id: 20,
      type: NodeType.QUESTION,
      label: "Closure란 무엇이고 언제 쓰나요?",
      questionId: 20,
    },
    { id: 21, type: NodeType.KEYWORD, label: "Event Loop", questionId: null },
    {
      id: 22,
      type: NodeType.QUESTION,
      label: "이벤트 루프의 동작 과정은?",
      questionId: 22,
    },
    { id: 23, type: NodeType.KEYWORD, label: "Hoisting", questionId: null },
    { id: 24, type: NodeType.KEYWORD, label: "Prototype", questionId: null },
    {
      id: 25,
      type: NodeType.QUESTION,
      label: "Prototype Chain이란?",
      questionId: 25,
    },
    { id: 26, type: NodeType.KEYWORD, label: "Promise", questionId: null },
    { id: 27, type: NodeType.KEYWORD, label: "Async/Await", questionId: null },
    {
      id: 28,
      type: NodeType.QUESTION,
      label: "Promise와 Async/Await의 차이는?",
      questionId: 28,
    },
    { id: 29, type: NodeType.KEYWORD, label: "TypeScript", questionId: null },
    {
      id: 30,
      type: NodeType.QUESTION,
      label: "TypeScript를 사용하는 이유는?",
      questionId: 30,
    },

    // --- [추가 데이터: Network] (ID: 31 ~ 50) ---
    { id: 31, type: NodeType.KEYWORD, label: "Network", questionId: null },
    { id: 32, type: NodeType.KEYWORD, label: "HTTP", questionId: null },
    { id: 33, type: NodeType.KEYWORD, label: "HTTPS", questionId: null },
    {
      id: 34,
      type: NodeType.QUESTION,
      label: "HTTP와 HTTPS의 차이점은?",
      questionId: 34,
    },
    { id: 35, type: NodeType.KEYWORD, label: "TCP", questionId: null },
    { id: 36, type: NodeType.KEYWORD, label: "UDP", questionId: null },
    {
      id: 37,
      type: NodeType.QUESTION,
      label: "TCP와 UDP의 차이는?",
      questionId: 37,
    },
    { id: 38, type: NodeType.KEYWORD, label: "REST API", questionId: null },
    { id: 39, type: NodeType.KEYWORD, label: "GraphQL", questionId: null },
    {
      id: 40,
      type: NodeType.QUESTION,
      label: "REST와 GraphQL의 장단점은?",
      questionId: 40,
    },
    { id: 41, type: NodeType.KEYWORD, label: "DNS", questionId: null },
    {
      id: 42,
      type: NodeType.QUESTION,
      label: "주소창에 google.com을 치면 일어나는 일?",
      questionId: 42,
    },
    { id: 43, type: NodeType.KEYWORD, label: "OSI 7 Layer", questionId: null },
    { id: 44, type: NodeType.KEYWORD, label: "CORS", questionId: null },
    {
      id: 45,
      type: NodeType.QUESTION,
      label: "CORS 에러 해결 방법은?",
      questionId: 45,
    },
    { id: 46, type: NodeType.KEYWORD, label: "Cookie", questionId: null },
    { id: 47, type: NodeType.KEYWORD, label: "Session", questionId: null },
    { id: 48, type: NodeType.KEYWORD, label: "JWT", questionId: null },
    {
      id: 49,
      type: NodeType.QUESTION,
      label: "Cookie와 Session의 차이는?",
      questionId: 49,
    },
    {
      id: 50,
      type: NodeType.QUESTION,
      label: "JWT 기반 인증 방식이란?",
      questionId: 50,
    },

    // --- [추가 데이터: Operating System] (ID: 51 ~ 65) ---
    { id: 51, type: NodeType.KEYWORD, label: "OS", questionId: null },
    { id: 52, type: NodeType.KEYWORD, label: "Process", questionId: null },
    { id: 53, type: NodeType.KEYWORD, label: "Thread", questionId: null },
    {
      id: 54,
      type: NodeType.QUESTION,
      label: "Process와 Thread의 차이는?",
      questionId: 54,
    },
    {
      id: 55,
      type: NodeType.KEYWORD,
      label: "Context Switching",
      questionId: null,
    },
    { id: 56, type: NodeType.KEYWORD, label: "Deadlock", questionId: null },
    {
      id: 57,
      type: NodeType.QUESTION,
      label: "데드락 발생 조건 4가지는?",
      questionId: 57,
    },
    { id: 58, type: NodeType.KEYWORD, label: "Mutex", questionId: null },
    { id: 59, type: NodeType.KEYWORD, label: "Semaphore", questionId: null },
    {
      id: 60,
      type: NodeType.QUESTION,
      label: "뮤텍스와 세마포어의 차이는?",
      questionId: 60,
    },
    { id: 61, type: NodeType.KEYWORD, label: "Memory", questionId: null },
    { id: 62, type: NodeType.KEYWORD, label: "Paging", questionId: null },
    { id: 63, type: NodeType.KEYWORD, label: "Segmentation", questionId: null },
    {
      id: 64,
      type: NodeType.QUESTION,
      label: "페이징과 세그멘테이션이란?",
      questionId: 64,
    },
    { id: 65, type: NodeType.KEYWORD, label: "Kernel", questionId: null },

    // --- [추가 데이터: Database] (ID: 66 ~ 80) ---
    { id: 66, type: NodeType.KEYWORD, label: "Database", questionId: null },
    { id: 67, type: NodeType.KEYWORD, label: "RDBMS", questionId: null },
    { id: 68, type: NodeType.KEYWORD, label: "NoSQL", questionId: null },
    {
      id: 69,
      type: NodeType.QUESTION,
      label: "SQL과 NoSQL의 차이점은?",
      questionId: 69,
    },
    { id: 70, type: NodeType.KEYWORD, label: "Index", questionId: null },
    {
      id: 71,
      type: NodeType.QUESTION,
      label: "DB 인덱스의 동작 원리는?",
      questionId: 71,
    },
    { id: 72, type: NodeType.KEYWORD, label: "Transaction", questionId: null },
    { id: 73, type: NodeType.KEYWORD, label: "ACID", questionId: null },
    {
      id: 74,
      type: NodeType.QUESTION,
      label: "트랜잭션의 ACID 속성이란?",
      questionId: 74,
    },
    {
      id: 75,
      type: NodeType.KEYWORD,
      label: "Normalization",
      questionId: null,
    },
    { id: 76, type: NodeType.KEYWORD, label: "Join", questionId: null },
    { id: 77, type: NodeType.KEYWORD, label: "Redis", questionId: null },
    { id: 78, type: NodeType.KEYWORD, label: "Replication", questionId: null },
    { id: 79, type: NodeType.KEYWORD, label: "Sharding", questionId: null },
    {
      id: 80,
      type: NodeType.QUESTION,
      label: "샤딩(Sharding)이란 무엇인가요?",
      questionId: 80,
    },

    // --- [추가 데이터: Data Structure & Algo] (ID: 81 ~ 100) ---
    {
      id: 81,
      type: NodeType.KEYWORD,
      label: "Data Structure",
      questionId: null,
    },
    { id: 82, type: NodeType.KEYWORD, label: "Array", questionId: null },
    { id: 83, type: NodeType.KEYWORD, label: "Linked List", questionId: null },
    {
      id: 84,
      type: NodeType.QUESTION,
      label: "Array와 Linked List의 차이는?",
      questionId: 84,
    },
    { id: 85, type: NodeType.KEYWORD, label: "Stack", questionId: null },
    { id: 86, type: NodeType.KEYWORD, label: "Queue", questionId: null },
    {
      id: 87,
      type: NodeType.QUESTION,
      label: "Stack과 Queue의 차이는?",
      questionId: 87,
    },
    { id: 88, type: NodeType.KEYWORD, label: "Hash Table", questionId: null },
    {
      id: 89,
      type: NodeType.QUESTION,
      label: "해시 충돌 해결 방법은?",
      questionId: 89,
    },
    { id: 90, type: NodeType.KEYWORD, label: "Tree", questionId: null },
    {
      id: 91,
      type: NodeType.KEYWORD,
      label: "Binary Search Tree",
      questionId: null,
    },
    { id: 92, type: NodeType.KEYWORD, label: "Heap", questionId: null },
    { id: 93, type: NodeType.KEYWORD, label: "Graph", questionId: null },
    { id: 94, type: NodeType.KEYWORD, label: "DFS", questionId: null },
    { id: 95, type: NodeType.KEYWORD, label: "BFS", questionId: null },
    {
      id: 96,
      type: NodeType.QUESTION,
      label: "DFS와 BFS의 차이는?",
      questionId: 96,
    },
    { id: 97, type: NodeType.KEYWORD, label: "Sorting", questionId: null },
    { id: 98, type: NodeType.KEYWORD, label: "Quick Sort", questionId: null },
    { id: 99, type: NodeType.KEYWORD, label: "Merge Sort", questionId: null },
    {
      id: 100,
      type: NodeType.KEYWORD,
      label: "Time Complexity",
      questionId: null,
    },
  ],
  edges: [
    // --- [기존 엣지] (ID: 1 ~ 15) ---
    { id: 1, sourceId: 1, targetId: 2 },
    { id: 2, sourceId: 1, targetId: 3 },
    { id: 3, sourceId: 4, targetId: 3 },
    { id: 4, sourceId: 1, targetId: 5 },
    { id: 5, sourceId: 6, targetId: 7 },
    { id: 6, sourceId: 6, targetId: 2 },
    // 추가
    { id: 7, sourceId: 10, targetId: 8 },
    { id: 8, sourceId: 10, targetId: 9 },
    { id: 9, sourceId: 12, targetId: 11 },
    { id: 10, sourceId: 12, targetId: 5 },
    { id: 11, sourceId: 15, targetId: 13 },
    { id: 12, sourceId: 15, targetId: 14 },
    { id: 13, sourceId: 15, targetId: 3 },
    { id: 14, sourceId: 17, targetId: 16 },
    { id: 15, sourceId: 17, targetId: 8 },

    // --- [추가 엣지: JS Core] ---
    { id: 16, sourceId: 18, targetId: 2 }, // JS -> React
    { id: 17, sourceId: 20, targetId: 19 }, // Q -> Closure
    { id: 18, sourceId: 20, targetId: 18 }, // Q -> JS
    { id: 19, sourceId: 22, targetId: 21 }, // Q -> Event Loop
    { id: 20, sourceId: 22, targetId: 18 }, // Q -> JS
    { id: 21, sourceId: 18, targetId: 23 }, // JS -> Hoisting
    { id: 22, sourceId: 25, targetId: 24 }, // Q -> Prototype
    { id: 23, sourceId: 25, targetId: 18 }, // Q -> JS
    { id: 24, sourceId: 28, targetId: 26 }, // Q -> Promise
    { id: 25, sourceId: 28, targetId: 27 }, // Q -> Async/Await
    { id: 26, sourceId: 30, targetId: 29 }, // Q -> TS
    { id: 27, sourceId: 30, targetId: 18 }, // Q -> JS

    // --- [추가 엣지: Network] ---
    { id: 28, sourceId: 34, targetId: 32 }, // Q -> HTTP
    { id: 29, sourceId: 34, targetId: 33 }, // Q -> HTTPS
    { id: 30, sourceId: 37, targetId: 35 }, // Q -> TCP
    { id: 31, sourceId: 37, targetId: 36 }, // Q -> UDP
    { id: 32, sourceId: 40, targetId: 38 }, // Q -> REST
    { id: 33, sourceId: 40, targetId: 39 }, // Q -> GraphQL
    { id: 34, sourceId: 42, targetId: 41 }, // Q -> DNS
    { id: 35, sourceId: 42, targetId: 32 }, // Q -> HTTP
    { id: 36, sourceId: 45, targetId: 44 }, // Q -> CORS
    { id: 37, sourceId: 49, targetId: 46 }, // Q -> Cookie
    { id: 38, sourceId: 49, targetId: 47 }, // Q -> Session
    { id: 39, sourceId: 50, targetId: 48 }, // Q -> JWT

    // --- [추가 엣지: OS] ---
    { id: 40, sourceId: 51, targetId: 65 }, // OS -> Kernel
    { id: 41, sourceId: 54, targetId: 52 }, // Q -> Process
    { id: 42, sourceId: 54, targetId: 53 }, // Q -> Thread
    { id: 43, sourceId: 54, targetId: 55 }, // Q -> Context Switching
    { id: 44, sourceId: 57, targetId: 56 }, // Q -> Deadlock
    { id: 45, sourceId: 60, targetId: 58 }, // Q -> Mutex
    { id: 46, sourceId: 60, targetId: 59 }, // Q -> Semaphore
    { id: 47, sourceId: 64, targetId: 61 }, // Q -> Memory
    { id: 48, sourceId: 64, targetId: 62 }, // Q -> Paging
    { id: 49, sourceId: 64, targetId: 63 }, // Q -> Segmentation

    // --- [추가 엣지: DB] ---
    { id: 50, sourceId: 69, targetId: 67 }, // Q -> RDBMS
    { id: 51, sourceId: 69, targetId: 68 }, // Q -> NoSQL
    { id: 52, sourceId: 71, targetId: 70 }, // Q -> Index
    { id: 53, sourceId: 74, targetId: 72 }, // Q -> Transaction
    { id: 54, sourceId: 74, targetId: 73 }, // Q -> ACID
    { id: 55, sourceId: 67, targetId: 75 }, // RDBMS -> Normalization
    { id: 56, sourceId: 67, targetId: 76 }, // RDBMS -> Join
    { id: 57, sourceId: 68, targetId: 77 }, // NoSQL -> Redis
    { id: 58, sourceId: 80, targetId: 79 }, // Q -> Sharding
    { id: 59, sourceId: 80, targetId: 66 }, // Q -> DB

    // --- [추가 엣지: Data Structure & Algo] ---
    { id: 60, sourceId: 84, targetId: 82 }, // Q -> Array
    { id: 61, sourceId: 84, targetId: 83 }, // Q -> Linked List
    { id: 62, sourceId: 87, targetId: 85 }, // Q -> Stack
    { id: 63, sourceId: 87, targetId: 86 }, // Q -> Queue
    { id: 64, sourceId: 89, targetId: 88 }, // Q -> Hash Table
    { id: 65, sourceId: 90, targetId: 91 }, // Tree -> BST
    { id: 66, sourceId: 90, targetId: 92 }, // Tree -> Heap
    { id: 67, sourceId: 96, targetId: 93 }, // Q -> Graph
    { id: 68, sourceId: 96, targetId: 94 }, // Q -> DFS
    { id: 69, sourceId: 96, targetId: 95 }, // Q -> BFS
    { id: 70, sourceId: 97, targetId: 98 }, // Sorting -> Quick
    { id: 71, sourceId: 97, targetId: 99 }, // Sorting -> Merge
    { id: 72, sourceId: 97, targetId: 100 }, // Sorting -> Time Complexity
  ],
};
