"use client";

import { Button } from "@/components/button/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/input-group/input-group";
import { Mail, X } from "lucide-react";
import * as React from "react";
import { sendVerifyMail, verifyCodeAction } from "../_utils/auth";
import MailTimer from "./mail-timer";

interface MailVerificationModalProps {
  email: string;
  handleModalToggle: () => void;
  onSuccess?: () => void;
}

function MailVerificationModal({
  email,
  handleModalToggle,
  onSuccess,
}: MailVerificationModalProps) {
  const [state, formAction, isPending] = React.useActionState(
    verifyCodeAction,
    undefined,
  );
  const [isSending, setIsSending] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [isError, setIsError] = React.useState(false);
  const [hasSentMail, setHasSentMail] = React.useState(false);
  const [timerKey, setTimerKey] = React.useState(0);

  React.useEffect(() => {
    if (!state) return;
    if (state.success) {
      setTimeout(() => {
        onSuccess?.();
        handleModalToggle();
      }, 1000);
    }
  }, [state, onSuccess, handleModalToggle]);

  const handleSendMail = async () => {
    setMessage("");
    setIsError(false);
    setIsSending(true);

    try {
      const result = await sendVerifyMail(email);

      if (result.success) {
        setMessage(result.message || "인증 코드가 전송되었습니다.");
        setHasSentMail(true);
        setTimerKey((prev) => prev + 1);
      } else {
        setIsError(true);
        setMessage(result.error || "인증 코드 전송에 실패했습니다.");
      }
    } catch {
      setIsError(true);
      setMessage("인증 코드 전송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div
        className="absolute inset-0 backdrop-blur-sm bg-black/50"
        onClick={handleModalToggle}
      />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200">
        <button
          onClick={handleModalToggle}
          className="absolute right-4 top-4 p-1 rounded-md hover:bg-slate-100 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">이메일 인증</h2>
          <p className="text-sm text-slate-600">
            <span className=" text-teal-600">{email}</span>로 인증 코드를
            전송합니다.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="email" value={email} />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="code" className="text-sm ">
                인증 코드
              </label>
              {hasSentMail && <MailTimer key={timerKey} />}
            </div>
            <InputGroup className="h-11">
              <InputGroupAddon>
                <Mail />
              </InputGroupAddon>
              <InputGroupInput
                id="code"
                name="code"
                placeholder="6자리 인증 코드를 입력하세요"
                maxLength={6}
                required
              />
            </InputGroup>
            {!message && state?.error && (
              <p className="text-xs mt-1.5 ml-1  text-red-500">{state.error}</p>
            )}
            {!message && state?.message && (
              <p className="text-xs mt-1.5 ml-1  text-teal-600">
                {state.message}
              </p>
            )}
            {message && (
              <p
                className={`text-xs mt-1.5 ml-1 ${isError ? "text-red-500" : "text-teal-600"}`}
              >
                {message}
              </p>
            )}
            {!state?.error && !state?.message && !message && (
              <p className="text-xs mt-1.5 ml-1  text-slate-500">
                아래 버튼을 눌러 인증 코드를 받으세요.
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleSendMail}
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2"
          >
            <Mail className={`w-4 h-4 ${isSending ? "animate-pulse" : ""}`} />
            <span>
              {isSending
                ? "전송 중..."
                : hasSentMail
                  ? "인증 코드 재전송"
                  : "인증 코드 전송"}
            </span>
          </Button>

          <Button
            type="submit"
            size="lg"
            disabled={isPending || !hasSentMail}
            className="w-full"
          >
            {isPending ? "인증 중..." : "인증 확인"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default MailVerificationModal;
