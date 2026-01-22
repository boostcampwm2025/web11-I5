const SolvedStatus = {
  SOLVED: 'SOLVED',
  UNSOLVED: 'UNSOLVED',
} as const;

type SolvedStatus = (typeof SolvedStatus)[keyof typeof SolvedStatus];

export { SolvedStatus };
