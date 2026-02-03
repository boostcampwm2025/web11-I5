export const mockCategories = [
  { id: 1, name: "네트워크", depth: 0, parentId: null },
  { id: 2, name: "운영체제", depth: 0, parentId: null },
  { id: 3, name: "데이터베이스", depth: 0, parentId: null },
];

export const mockCategoryTrees: Record<number, object> = {
  1: {
    id: 1,
    name: "네트워크",
    depth: 0,
    parentId: null,
    children: [
      { id: 11, name: "TCP/IP", depth: 1, parentId: 1 },
      { id: 12, name: "HTTP", depth: 1, parentId: 1 },
    ],
  },
  2: {
    id: 2,
    name: "운영체제",
    depth: 0,
    parentId: null,
    children: [
      { id: 21, name: "프로세스", depth: 1, parentId: 2 },
      { id: 22, name: "메모리", depth: 1, parentId: 2 },
    ],
  },
  3: {
    id: 3,
    name: "데이터베이스",
    depth: 0,
    parentId: null,
    children: [
      { id: 31, name: "SQL", depth: 1, parentId: 3 },
      { id: 32, name: "인덱스", depth: 1, parentId: 3 },
    ],
  },
};
