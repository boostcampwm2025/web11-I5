"use client";

import { Button } from "@/components/button/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/input-group/input-group";
import { Mail, RefreshCw, X } from "lucide-react";
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
  const [isResending, setIsResending] = React.useState(false);
  const [resendMessage, setResendMessage] = React.useState("");
  const hasSentInitialMail = React.useRef(false);
  const timerRenderRef = React.useRef(0);

  React.useEffect(() => {
    if (hasSentInitialMail.current) return;

    async function sendMail() {
      try {
        await sendVerifyMail(email);
        hasSentInitialMail.current = true;
      } catch (error) {
        setResendMessage(
          error instanceof Error
            ? error.message
            : "인증 코드 전송에 실패했습니다.",
        );
      }
    }
    sendMail();
  }, [email]);

  React.useEffect(() => {
    if (!state) return;
    if (state.success) {
      setTimeout(() => {
        onSuccess?.();
        handleModalToggle();
      }, 1000);
    }
  }, [state, onSuccess, handleModalToggle]);

  const handleResend = async () => {
    setResendMessage("");
    setIsResending(true);

    try {
      const result = await sendVerifyMail(email);
      setResendMessage(result.message || "인증 코드가 재전송되었습니다.");
      timerRenderRef.current++;
    } catch (error) {
      setResendMessage(
        error instanceof Error
          ? error.message
          : "인증 코드 재전송에 실패했습니다.",
      );
    } finally {
      setIsResending(false);
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
            <span className="font-medium text-teal-600">{email}</span>로 전송된
            인증 코드를 입력해주세요.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="email" value={email} />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="code" className="text-sm font-medium">
                인증 코드
              </label>
              <MailTimer key={timerRenderRef.current} />
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
            {!resendMessage && state?.error && (
              <p className="text-[11px] mt-1.5 ml-1 font-medium text-red-500">
                {state.error}
              </p>
            )}
            {!resendMessage && state?.message && (
              <p className="text-[11px] mt-1.5 ml-1 font-medium text-teal-600">
                {state.message}
              </p>
            )}
            {resendMessage && (
              <p className="text-[11px] mt-1.5 ml-1 font-medium text-teal-600">
                {resendMessage}
              </p>
            )}
            {!state?.error && !state?.message && !resendMessage && (
              <p className="text-[11px] mt-1.5 ml-1 font-medium text-slate-500">
                * 이메일로 전송된 6자리 인증 코드를 입력해주세요.
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={handleResend}
            disabled={isResending}
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-teal-600"
          >
            <RefreshCw
              className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`}
            />
            <span>{isResending ? "전송 중..." : "인증 코드 재전송"}</span>
          </Button>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "인증 중..." : "인증 확인"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default MailVerificationModal;
