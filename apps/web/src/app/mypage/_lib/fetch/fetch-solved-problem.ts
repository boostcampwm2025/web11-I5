import { apiGet } from "@/lib/api-client";
import { SolvedProblemResDto } from "../../_types/solved-probrlem";

async function fetchSolvedProblem(): Promise<SolvedProblemResDto> {
  try {
    return await apiGet<SolvedProblemResDto>("/api/users/solved-problems");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { fetchSolvedProblem };
