import { GraphData, NodeType } from "../types/graph-view";

export const mockGraphData: GraphData = {
  nodes: [
    // --- [기존 데이터: React 관련] (ID: 1 ~ 17) ---
    { id: 1, type: NodeType.QUESTION, label: "React란 무엇인가요?" },
    { id: 2, type: NodeType.KEYWORD, label: "React" },
    { id: 3, type: NodeType.KEYWORD, label: "Virtual DOM" },
    { id: 4, type: NodeType.QUESTION, label: "Virtual DOM의 동작 원리는?" },
    { id: 5, type: NodeType.KEYWORD, label: "컴포넌트" },
    { id: 6, type: NodeType.QUESTION, label: "useState와 useEffect 차이점은?" },
    { id: 7, type: NodeType.KEYWORD, label: "Hook" },
    { id: 8, type: NodeType.KEYWORD, label: "State" },
    { id: 9, type: NodeType.KEYWORD, label: "Props" },
    { id: 10, type: NodeType.QUESTION, label: "State와 Props의 차이는?" },
    { id: 11, type: NodeType.KEYWORD, label: "Lifecycle" },
    { id: 12, type: NodeType.QUESTION, label: "React 컴포넌트 생명주기는?" },
    { id: 13, type: NodeType.KEYWORD, label: "useMemo" },
    { id: 14, type: NodeType.KEYWORD, label: "useCallback" },
    { id: 15, type: NodeType.QUESTION, label: "React 성능 최적화 방법은?" },
    { id: 16, type: NodeType.KEYWORD, label: "Context API" },
    {
      id: 17,
      type: NodeType.QUESTION,
      label: "Context API는 언제 사용하나요?",
    },

    // --- [추가 데이터: JavaScript Core] (ID: 18 ~ 30) ---
    { id: 18, type: NodeType.KEYWORD, label: "JavaScript" },
    { id: 19, type: NodeType.KEYWORD, label: "Closure" },
    {
      id: 20,
      type: NodeType.QUESTION,
      label: "Closure란 무엇이고 언제 쓰나요?",
    },
    { id: 21, type: NodeType.KEYWORD, label: "Event Loop" },
    { id: 22, type: NodeType.QUESTION, label: "이벤트 루프의 동작 과정은?" },
    { id: 23, type: NodeType.KEYWORD, label: "Hoisting" },
    { id: 24, type: NodeType.KEYWORD, label: "Prototype" },
    { id: 25, type: NodeType.QUESTION, label: "Prototype Chain이란?" },
    { id: 26, type: NodeType.KEYWORD, label: "Promise" },
    { id: 27, type: NodeType.KEYWORD, label: "Async/Await" },
    {
      id: 28,
      type: NodeType.QUESTION,
      label: "Promise와 Async/Await의 차이는?",
    },
    { id: 29, type: NodeType.KEYWORD, label: "TypeScript" },
    { id: 30, type: NodeType.QUESTION, label: "TypeScript를 사용하는 이유는?" },

    // --- [추가 데이터: Network] (ID: 31 ~ 50) ---
    { id: 31, type: NodeType.KEYWORD, label: "Network" },
    { id: 32, type: NodeType.KEYWORD, label: "HTTP" },
    { id: 33, type: NodeType.KEYWORD, label: "HTTPS" },
    { id: 34, type: NodeType.QUESTION, label: "HTTP와 HTTPS의 차이점은?" },
    { id: 35, type: NodeType.KEYWORD, label: "TCP" },
    { id: 36, type: NodeType.KEYWORD, label: "UDP" },
    { id: 37, type: NodeType.QUESTION, label: "TCP와 UDP의 차이는?" },
    { id: 38, type: NodeType.KEYWORD, label: "REST API" },
    { id: 39, type: NodeType.KEYWORD, label: "GraphQL" },
    { id: 40, type: NodeType.QUESTION, label: "REST와 GraphQL의 장단점은?" },
    { id: 41, type: NodeType.KEYWORD, label: "DNS" },
    {
      id: 42,
      type: NodeType.QUESTION,
      label: "주소창에 google.com을 치면 일어나는 일?",
    },
    { id: 43, type: NodeType.KEYWORD, label: "OSI 7 Layer" },
    { id: 44, type: NodeType.KEYWORD, label: "CORS" },
    { id: 45, type: NodeType.QUESTION, label: "CORS 에러 해결 방법은?" },
    { id: 46, type: NodeType.KEYWORD, label: "Cookie" },
    { id: 47, type: NodeType.KEYWORD, label: "Session" },
    { id: 48, type: NodeType.KEYWORD, label: "JWT" },
    { id: 49, type: NodeType.QUESTION, label: "Cookie와 Session의 차이는?" },
    { id: 50, type: NodeType.QUESTION, label: "JWT 기반 인증 방식이란?" },

    // --- [추가 데이터: Operating System] (ID: 51 ~ 65) ---
    { id: 51, type: NodeType.KEYWORD, label: "OS" },
    { id: 52, type: NodeType.KEYWORD, label: "Process" },
    { id: 53, type: NodeType.KEYWORD, label: "Thread" },
    { id: 54, type: NodeType.QUESTION, label: "Process와 Thread의 차이는?" },
    { id: 55, type: NodeType.KEYWORD, label: "Context Switching" },
    { id: 56, type: NodeType.KEYWORD, label: "Deadlock" },
    { id: 57, type: NodeType.QUESTION, label: "데드락 발생 조건 4가지는?" },
    { id: 58, type: NodeType.KEYWORD, label: "Mutex" },
    { id: 59, type: NodeType.KEYWORD, label: "Semaphore" },
    { id: 60, type: NodeType.QUESTION, label: "뮤텍스와 세마포어의 차이는?" },
    { id: 61, type: NodeType.KEYWORD, label: "Memory" },
    { id: 62, type: NodeType.KEYWORD, label: "Paging" },
    { id: 63, type: NodeType.KEYWORD, label: "Segmentation" },
    { id: 64, type: NodeType.QUESTION, label: "페이징과 세그멘테이션이란?" },
    { id: 65, type: NodeType.KEYWORD, label: "Kernel" },

    // --- [추가 데이터: Database] (ID: 66 ~ 80) ---
    { id: 66, type: NodeType.KEYWORD, label: "Database" },
    { id: 67, type: NodeType.KEYWORD, label: "RDBMS" },
    { id: 68, type: NodeType.KEYWORD, label: "NoSQL" },
    { id: 69, type: NodeType.QUESTION, label: "SQL과 NoSQL의 차이점은?" },
    { id: 70, type: NodeType.KEYWORD, label: "Index" },
    { id: 71, type: NodeType.QUESTION, label: "DB 인덱스의 동작 원리는?" },
    { id: 72, type: NodeType.KEYWORD, label: "Transaction" },
    { id: 73, type: NodeType.KEYWORD, label: "ACID" },
    { id: 74, type: NodeType.QUESTION, label: "트랜잭션의 ACID 속성이란?" },
    { id: 75, type: NodeType.KEYWORD, label: "Normalization" },
    { id: 76, type: NodeType.KEYWORD, label: "Join" },
    { id: 77, type: NodeType.KEYWORD, label: "Redis" },
    { id: 78, type: NodeType.KEYWORD, label: "Replication" },
    { id: 79, type: NodeType.KEYWORD, label: "Sharding" },
    {
      id: 80,
      type: NodeType.QUESTION,
      label: "샤딩(Sharding)이란 무엇인가요?",
    },

    // --- [추가 데이터: Data Structure & Algo] (ID: 81 ~ 100) ---
    { id: 81, type: NodeType.KEYWORD, label: "Data Structure" },
    { id: 82, type: NodeType.KEYWORD, label: "Array" },
    { id: 83, type: NodeType.KEYWORD, label: "Linked List" },
    { id: 84, type: NodeType.QUESTION, label: "Array와 Linked List의 차이는?" },
    { id: 85, type: NodeType.KEYWORD, label: "Stack" },
    { id: 86, type: NodeType.KEYWORD, label: "Queue" },
    { id: 87, type: NodeType.QUESTION, label: "Stack과 Queue의 차이는?" },
    { id: 88, type: NodeType.KEYWORD, label: "Hash Table" },
    { id: 89, type: NodeType.QUESTION, label: "해시 충돌 해결 방법은?" },
    { id: 90, type: NodeType.KEYWORD, label: "Tree" },
    { id: 91, type: NodeType.KEYWORD, label: "Binary Search Tree" },
    { id: 92, type: NodeType.KEYWORD, label: "Heap" },
    { id: 93, type: NodeType.KEYWORD, label: "Graph" },
    { id: 94, type: NodeType.KEYWORD, label: "DFS" },
    { id: 95, type: NodeType.KEYWORD, label: "BFS" },
    { id: 96, type: NodeType.QUESTION, label: "DFS와 BFS의 차이는?" },
    { id: 97, type: NodeType.KEYWORD, label: "Sorting" },
    { id: 98, type: NodeType.KEYWORD, label: "Quick Sort" },
    { id: 99, type: NodeType.KEYWORD, label: "Merge Sort" },
    { id: 100, type: NodeType.KEYWORD, label: "Time Complexity" },
  ],
  edges: [
    // --- [기존 엣지] (ID: 1 ~ 15) ---
    { id: 1, sourceId: 1, targetId: 2 },
    { id: 2, sourceId: 1, targetId: 3 },
    { id: 3, sourceId: 4, targetId: 3 },
    { id: 4, sourceId: 1, targetId: 5 },
    { id: 5, sourceId: 6, targetId: 7 },
    { id: 6, sourceId: 6, targetId: 2 },
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
