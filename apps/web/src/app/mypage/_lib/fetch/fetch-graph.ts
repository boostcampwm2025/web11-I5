import { apiGet } from "@/lib/api-client";
import { GraphData } from "../../_types/graph-view";

async function fetchGraph(): Promise<GraphData> {
  try {
    return await apiGet<GraphData>("/graph");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { fetchGraph };
