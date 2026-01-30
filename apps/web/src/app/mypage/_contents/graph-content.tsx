"use client";

import { Button } from "@/components/button/button";
import { BarChart3, Expand } from "lucide-react";
import * as React from "react";
import GraphView from "../_components/graph-view/graph-view";
import { GraphData } from "../_types/graph-view";

function GraphContent({ graphData }: { graphData: GraphData }) {
  const [openModalStatus, setOpenModalStatus] = React.useState(false);
  const handleModalToggle = React.useCallback(() => {
    setOpenModalStatus((prev) => !prev);
  }, []);

  return (
    <>
      {graphData.nodes.length === 0 ? (
        <div className="flex flex-col h-full w-full items-center justify-center py-8 md:py-12 text-center px-4">
          <div className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
            아직 학습 데이터가 없습니다
          </h3>
          <p className="text-xs md:text-sm text-gray-500">
            문제를 풀면 학습 그래프가 생성됩니다
          </p>
        </div>
      ) : (
        <div className="relative w-full h-120">
          <Button
            onClick={handleModalToggle}
            size="icon"
            variant="outline"
            className="absolute right-0 top-6 md:top-8"
            aria-label="그래프 확대"
          >
            <Expand className="text-muted-foreground" />
          </Button>
          <GraphView graphData={graphData} />
        </div>
      )}
      {openModalStatus && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleModalToggle();
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl md:rounded-2xl w-full h-full max-w-5xl max-h-[90vh] md:max-h-5/6 shadow-xl overflow-hidden relative"
          >
            <div className="w-full h-full">
              <GraphView graphData={graphData} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GraphContent;
