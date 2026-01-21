"use client";

import * as React from "react";
import { Button } from "@/components/button/button";
import { LoginState } from "../_utils/auth";

import { Mail, Lock, ArrowRight } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/input-group/input-group";

interface LoginFormProps {
  loginAction: (
    prevState: LoginState | undefined,
    formData: FormData,
  ) => Promise<LoginState | undefined>;
}

function LoginForm({ loginAction }: LoginFormProps) {
  const [state, formAction, isPending] = React.useActionState(
    loginAction,
    undefined,
  );

  return (
    <form action={formAction}>
      {state?.error && (
        <div className="text-sm text-red-500 text-center mt-4">
          {state.error}
        </div>
      )}

      {/* 이메일 입력 섹션 */}
      <div className="space-y-2 mb-4">
        <label htmlFor="email" className="text-xs font-medium">
          이메일
        </label>
        <InputGroup className="h-11">
          <InputGroupAddon>
            <Mail />
          </InputGroupAddon>
          <InputGroupInput name="email" placeholder="name@example.com" />
        </InputGroup>
      </div>

      {/* 비밀번호 입력 섹션 */}
      <div className="space-y-2 mb-6">
        <label htmlFor="password" className="text-xs font-medium">
          비밀번호
        </label>
        <InputGroup className="h-11">
          <InputGroupAddon>
            <Lock />
          </InputGroupAddon>
          <InputGroupInput
            type="password"
            name="password"
            placeholder="***********"
          />
        </InputGroup>
      </div>

      {/* 로그인 버튼 */}
      <Button
        size="lg"
        type="submit"
        disabled={isPending}
        className="w-full h-11 text-white font-bold"
      >
        {isPending ? (
          "로그인 중..."
        ) : (
          <div className="flex items-center justify-center gap-2">
            로그인하기 <ArrowRight className="h-5 w-5" />
          </div>
        )}
      </Button>
    </form>
  );
}

export default LoginForm;
