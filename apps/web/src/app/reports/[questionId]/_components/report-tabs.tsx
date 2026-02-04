import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/tabs/tabs";
import { BarChart3, BookText, CircleCheckBig } from "lucide-react";
import FeedbackSection from "./feedback/feedback-section";
import { AnalysisStatus, ReportDetail } from "../_types/report-detail";
import { Question } from "@/app/daily/questions/_types/types";
import type { GraphData } from "@/app/mypage/_types/graph-view";
import GraphView from "@/app/mypage/_components/graph-view/graph-view";

type ReportQuestion = Question & {
  categoryDisplay: string;
  subCategory: string;
};

interface HistoryItem {
  submissionId: number;
  inputType: "VOICE" | "TEXT";
  displayIndex: number;
  status: AnalysisStatus;
  duration: string;
  answerContent: string;
}

interface ReportTabsProps {
  selectedAttempt: HistoryItem;
  evaluation: ReportDetail;
  question: ReportQuestion;
  /** 이 제출에서 추가된 그래프(노드·엣지). 없으면 null */
  submissionGraph: GraphData | null;
  /** 이 문제에 대한 전체 학습 그래프(서브그래프). 하이라이트 베이스용 */
  fullGraphForQuestion: GraphData | null;
}

function ReportTabs({
  selectedAttempt,
  evaluation,
  question,
  submissionGraph,
  fullGraphForQuestion,
}: ReportTabsProps) {
  const keywords =
    evaluation.status === "COMPLETED"
      ? evaluation.feedback.extractedKeywords
      : [];

  // 베이스: 전체 누적 그래프가 있으면 사용, 없으면 제출 그래프만 사용
  const graphData =
    fullGraphForQuestion != null && fullGraphForQuestion.nodes.length > 0
      ? fullGraphForQuestion
      : submissionGraph;

  const hasGraph = graphData != null && graphData.nodes.length > 0;

  // 제출에서 추가된 노드·엣지만 하이라이트 (전체 그래프 표시 시)
  const highlightNodeIds =
    fullGraphForQuestion != null &&
    submissionGraph != null &&
    submissionGraph.nodes.length > 0
      ? submissionGraph.nodes.map((n) => n.id)
      : undefined;
  const highlightEdgeIds =
    fullGraphForQuestion != null &&
    submissionGraph != null &&
    submissionGraph.edges.length > 0
      ? submissionGraph.edges.map((e) => e.id)
      : undefined;

  return (
    <Tabs defaultValue="feedback" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="feedback">
          <CircleCheckBig className="mr-1.5 md:mr-2.5 w-4 h-4 hidden sm:block" />{" "}
          분석 리포트
        </TabsTrigger>
        <TabsTrigger value="answer">
          <BookText className="mr-1.5 md:mr-2.5 w-4 h-4 hidden sm:block" /> 답변
          스크립트
        </TabsTrigger>
        <TabsTrigger value="graph">
          <BarChart3 className="mr-1.5 md:mr-2.5 w-4 h-4 hidden sm:block" />{" "}
          이번 제출 학습 그래프
        </TabsTrigger>
      </TabsList>

      <TabsContent value="feedback">
        <FeedbackSection
          attempt={selectedAttempt.displayIndex}
          status={selectedAttempt.status}
          data={evaluation}
          question={question}
        />
      </TabsContent>

      <TabsContent value="answer">
        <div className="overflow-hidden">
          <div className="p-5 md:p-9">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 md:mb-6">
              <div>
                <h3 className="text-base md:text-[1.125rem] font-bold text-slate-900">
                  나의 답변 원문
                </h3>
              </div>
              {selectedAttempt.inputType === "VOICE" &&
                selectedAttempt.answerContent && (
                  <div className="flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5">
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                    <span className="text-xs md:text-sm text-slate-500">
                      AI 음성 복원 완료
                    </span>
                  </div>
                )}
            </div>

            <div className="bg-white py-4 md:py-6 border-y border-slate-200">
              {selectedAttempt.answerContent ? (
                <p className="text-sm md:text-[0.9375rem] leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {selectedAttempt.answerContent}
                </p>
              ) : (
                <p className="py-4 text-xs md:text-sm text-center text-slate-400">
                  저장된 답변이 없습니다.
                </p>
              )}
            </div>

            {keywords.length > 0 &&
              evaluation.totalScore &&
              evaluation.totalScore >= 30 && (
                <div className="mt-4 md:mt-6">
                  <h4 className="font-semibold text-xs md:text-sm text-slate-400 uppercase tracking-wider mb-2 md:mb-3">
                    CORE KEYWORDS
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                    {keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 md:py-1.5 bg-slate-100 text-slate-700 text-xs md:text-sm font-medium rounded-md"
                      >
                        <span className="text-slate-400 font-semibold">#</span>{" "}
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="graph">
        <div className="overflow-hidden">
          {hasGraph ? (
            <div className="relative w-full h-80 md:h-96">
              <GraphView
                key={selectedAttempt.submissionId}
                graphData={graphData}
                clickEventDisabled
                zoomEnabled
                highlightNodeIds={highlightNodeIds}
                highlightEdgeIds={highlightEdgeIds}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">
                이 제출에서 추가된 학습 그래프가 없습니다.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                키워드가 추출된 답변만 그래프에 반영됩니다.
              </p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default ReportTabs;
