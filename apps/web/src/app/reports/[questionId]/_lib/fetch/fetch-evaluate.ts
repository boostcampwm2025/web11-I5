"use server";

async function reEvaluate(submissionId: number): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.API_URL}/answer-evaluation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId }),
    });
    return response.ok;
  } catch (error) {
    console.error("재채점 요청 실패: ", error);
    return false;
  }
}

export { reEvaluate };
