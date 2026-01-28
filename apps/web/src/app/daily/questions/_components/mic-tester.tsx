"use client";

import React, { useEffect } from "react";
import useRecorder from "../[questionId]/_hooks/use-recorder";
import Waveform from "@/components/waveform/waveform";
import {
  Mic,
  ShieldAlert,
  AlertCircle,
  MicOff,
  Play,
  Square,
  Pause,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/button/button";
import { Slider } from "@/components/slider/slider";

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function MicrophoneTester() {
  const {
    status,
    historyRef,
    startRecording,
    stopRecording,
    isRecording,
    hasRecorded,
    isPlaying,
    playRecording,
    pausePlayback,
    retryRecording,
    playbackTime,
    duration,
    seekTo,
  } = useRecorder({ maxDurationSeconds: 60 });

  const wasPlayingBeforeSeekRef = React.useRef(false);

  useEffect(() => {
    startRecording();

    return () => {
      stopRecording();
    };
  }, [startRecording, stopRecording]);

  const handleSeekStart = () => {
    wasPlayingBeforeSeekRef.current = isPlaying;
    if (isPlaying) {
      pausePlayback();
    }
  };

  const handleSeekEnd = (value: number[]) => {
    seekTo(value[0]);
    const shouldResume = wasPlayingBeforeSeekRef.current;
    wasPlayingBeforeSeekRef.current = false;
    if (shouldResume) {
      playRecording();
    }
  };

  const handleSeekCancel = () => {
    const shouldResume = wasPlayingBeforeSeekRef.current;
    wasPlayingBeforeSeekRef.current = false;
    if (shouldResume) {
      playRecording();
    }
  };

  const isError =
    status === "permission_denied" ||
    status === "no_device" ||
    status === "unsupported";

  if (isError) {
    let errorContent = {
      icon: ShieldAlert,
      title: "마이크 권한 필요",
      desc: "브라우저 설정에서 마이크 권한을 허용해주세요.",
    };

    if (status === "no_device") {
      errorContent = {
        icon: MicOff,
        title: "마이크 없음",
        desc: "연결된 마이크를 찾을 수 없습니다.",
      };
    } else if (status === "unsupported") {
      errorContent = {
        icon: AlertCircle,
        title: "지원되지 않는 브라우저",
        desc: "이 브라우저는 음성 녹음을 지원하지 않습니다.",
      };
    }

    const ErrorIcon = errorContent.icon;

    return (
      <div className="h-75 w-full bg-red-50 border border-red-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-2">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <ErrorIcon className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-gray-900 font-bold text-lg mb-2">
          {errorContent.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs whitespace-pre-wrap">
          {errorContent.desc}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 bg-white border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => startRecording()}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  if (!isRecording && !hasRecorded) {
    return (
      <div className="h-75 w-full bg-slate-50 border border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-in fade-in">
        <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <Mic className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-gray-900 font-bold text-lg mb-2">마이크 테스트</h3>
        <p className="text-gray-500 text-sm mb-6">
          버튼을 눌러 마이크가 잘 작동하는지 확인하세요.
        </p>
        <Button
          onClick={() => startRecording()}
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-6"
        >
          <Play className="w-4 h-4 mr-2 fill-current" />
          테스트 녹음 시작
        </Button>
      </div>
    );
  }

  if (hasRecorded && !isRecording) {
    return (
      <div className="flex flex-col items-center justify-center h-75 w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-2">
        <div className="w-full max-w-md mb-6 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={isPlaying ? pausePlayback : playRecording}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition-colors shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <div className="flex-1 flex flex-col justify-center h-10">
              <Slider
                value={[playbackTime]}
                min={0}
                max={duration || 0.1}
                step={0.01}
                onPointerDown={handleSeekStart}
                onPointerUp={handleSeekCancel}
                onPointerLeave={handleSeekCancel}
                onValueChange={([value]) => seekTo(value)}
                onValueCommit={handleSeekEnd}
                className="py-2"
              />
            </div>

            <span className="text-xs font-medium text-slate-500 w-20 text-right tabular-nums">
              {formatTime(playbackTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={retryRecording}
            className="border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            다시 테스트
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-75 w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="h-24 flex items-center justify-center mb-6 relative w-full">
        <div className="w-full max-w-xs opacity-70">
          <Waveform historyRef={historyRef} />
        </div>
      </div>

      <div className="flex items-center justify-between w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0 animate-pulse">
            <Mic className="w-5 h-5 text-teal-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">녹음 중...</p>
            <p className="text-xs text-gray-500">마이크 테스트 원 투 쓰리</p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => stopRecording()}
          className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 h-9 gap-2"
        >
          <Square className="w-3 h-3 fill-current" />
          중지
        </Button>
      </div>
    </div>
  );
}
