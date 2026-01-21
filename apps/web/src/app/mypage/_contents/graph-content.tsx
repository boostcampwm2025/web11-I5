"use client";
import { BarChart3, Maximize2 } from "lucide-react";
import * as React from "react";
import GraphView from "../_components/graph-view/graph-view";
import NodeMap from "../_components/graph-view/node-map";
import { GraphData } from "../_types/graph-view";

function GraphContent({ graphData }: { graphData: GraphData }) {
  const [openModalStatus, setOpenModalStatus] = React.useState(false);
  const [nodeMap, setNodeMap] = React.useState<NodeMap>();

  const handleModalOpen = React.useCallback(() => {
    setOpenModalStatus(true);
  }, []);

  const handleModalClose = React.useCallback(() => {
    setOpenModalStatus(false);
  }, []);

  const changeNodeMap = React.useCallback((map: NodeMap) => {
    setNodeMap(map);
  }, []);

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
          disabled={graphData.nodes.length === 0}
          className="flex justify-center items-center w-10 h-10 border border-slate-200 bg-white rounded-xl disabled:cursor-not-allowed"
        >
          <Maximize2 className="w-5 h-5" stroke="#94A3B8" />
        </button>
      </div>
      {graphData.nodes.length === 0 ? (
        <div className="flex flex-col h-full w-full items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            아직 학습 데이터가 없습니다
          </h3>
          <p className="text-sm text-gray-500">
            문제를 풀면 학습 그래프가 생성됩니다
          </p>
        </div>
      ) : (
        <GraphView graphData={graphData} changeNodeMap={changeNodeMap} />
      )}
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
              <GraphView graphData={graphData} nodeMap={nodeMap} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GraphContent;
