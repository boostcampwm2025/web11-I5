"use client";
import { Maximize2 } from "lucide-react";
import * as React from "react";
import GraphView from "../_components/graph-view/graph-view";
import { GraphData } from "../_types/graph-view";

function GraphContent({ graphData }: { graphData: GraphData }) {
  const [openModalStatus, setOpenModalStatus] = React.useState(false);

  const handleModalOpen = () => {
    setOpenModalStatus(true);
  };

  const handleModalClose = () => {
    setOpenModalStatus(false);
  };
  return (
    <>
      <div className="flex py-8 justify-between items-center">
        <div className="flex flex-col justify-start gap-2">
          <span className="text-lg font-bold text-slate-900">지식 그래프</span>
          <span className="text-sm font-medium text-slate-500">
            개념 간의 연결 고리를 시각화합니다.
          </span>
        </div>
        <button
          onClick={handleModalOpen}
          className="flex justify-center items-center w-10 h-10 border border-slate-200 bg-white rounded-xl"
        >
          <Maximize2 className="w-5 h-5" stroke="#94A3B8" />
        </button>
      </div>
      <GraphView graphData={graphData} />
      {openModalStatus && (
        <div
          onClick={handleModalClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full h-full max-w-5xl max-h-5/6 shadow-xl overflow-hidden relative"
          >
            <div className="w-full h-full ">
              <GraphView graphData={graphData} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GraphContent;
