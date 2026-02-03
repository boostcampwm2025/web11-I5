import { Slider } from "@/components/slider/slider";
import { Minus, Plus } from "lucide-react";
import { GRAPH_NUMBER_CONSTANT } from "../../_constants/graph-view-constant";

interface ScaleSliderProps {
  scale: number;
  onScaleChange: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
}

function ScaleSlider({
  scale,
  onScaleChange,
  minScale = GRAPH_NUMBER_CONSTANT.MIN_SCALE,
  maxScale = GRAPH_NUMBER_CONSTANT.MAX_SCALE,
}: ScaleSliderProps) {
  const scaleStep = 0.2;

  const handleZoomIn = () => {
    const newScale = Math.min(maxScale, scale + scaleStep);
    onScaleChange(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(minScale, scale - scaleStep);
    onScaleChange(newScale);
  };

  const handleSliderChange = (value: number[]) => {
    onScaleChange(value[0]);
  };

  return (
    <div className="flex flex-col gap-2 border rounded-md p-1">
      <button
        onClick={handleZoomIn}
        disabled={scale >= maxScale}
        className="p-2 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-700 active:scale-95"
        aria-label="확대"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
      </button>
      <div>
        <Slider
          orientation="vertical"
          value={[scale]}
          onValueChange={handleSliderChange}
          min={minScale}
          max={maxScale}
          step={0.05}
          className="h-28"
        />
      </div>
      <button
        onClick={handleZoomOut}
        disabled={scale <= minScale}
        className="p-2 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-700 active:scale-95"
        aria-label="축소"
      >
        <Minus className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

export default ScaleSlider;
