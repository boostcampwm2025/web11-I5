import { formatTime } from "../_lib/format-time";

type RecordingState = "idle" | "countdown" | "recording" | "recorded";

interface StatusMessageProps {
  state: RecordingState;
  elapsedSeconds: number;
  maxDurationSeconds: number;
}

function StatusMessage({
  state,
  elapsedSeconds,
  maxDurationSeconds,
}: StatusMessageProps) {
  const showIdle = state === "idle" || state === "countdown";

  return (
    <div className="text-center px-4 flex items-center justify-center">
      {state === "recording" && (
        <div
          key="recording"
          className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3"
        >
          <div className="pt-1">
            <div className="text-4xl md:text-4xl font-semibold tabular-nums text-center tracking-tight flex items-end justify-center gap-1">
              <div>{formatTime(elapsedSeconds)} </div>
              <div className="text-base md:text-lg text-muted-foreground font-normal">
                / {formatTime(maxDurationSeconds)}
              </div>
            </div>
            <p className="text-muted-foreground text-center text-sm mt-1">
              녹음 중...
            </p>
          </div>
        </div>
      )}

      {showIdle && (
        <div key="idle">
          <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">
            답변 시작
          </h3>
          <p className="text-muted-foreground text-sm md:text-base">
            버튼을 눌러 녹음을 시작하세요.
          </p>
        </div>
      )}

      {state === "recorded" && (
        <div
          key="recorded"
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">
            녹음 완료
          </h3>
          <p className="text-muted-foreground text-sm md:text-base">
            답변을 제출하고 채점 결과를 확인해보세요
          </p>
        </div>
      )}
    </div>
  );
}

export { StatusMessage };
export type { RecordingState };
