"use client";

import * as React from "react";
import { Button } from "@/components/button/button";
import { SignupState } from "../_utils/auth";

import { Mail, Lock, ArrowRight, User } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/input-group/input-group";
import { Checkbox } from "@/components/checkbox/checkbox";

interface SignUpFormProps {
  signupAction: (
    prevState: SignupState | undefined,
    formData: FormData,
  ) => Promise<SignupState | undefined>;
}

function SignUpForm({ signupAction }: SignUpFormProps) {
  const [state, formAction, isPending] = React.useActionState(
    signupAction,
    undefined,
  );

  return (
    <form action={formAction} className="w-full">
      {state?.error && (
        <div className="text-sm text-red-500 text-center mb-4">
          {state.error}
        </div>
      )}

      {/* 이름(닉네임) 입력 */}
      <div className="space-y-2 mb-4">
        <label htmlFor="nickname" className="text-xs font-medium">
          이름
        </label>
        <InputGroup className="h-11">
          <InputGroupAddon>
            <User />
          </InputGroupAddon>
          <InputGroupInput
            id="nickname"
            name="nickname"
            placeholder="홍길동"
            required
          />
        </InputGroup>
      </div>

      {/* 이메일 입력 섹션 */}
      <div className="space-y-2 mb-4">
        <label htmlFor="email" className="text-xs font-medium">
          이메일
        </label>
        <InputGroup className="h-11">
          <InputGroupAddon>
            <Mail />
          </InputGroupAddon>
          <InputGroupInput
            type="email"
            name="email"
            placeholder="name@example.com"
            required
          />
        </InputGroup>
      </div>

      {/* 비밀번호 입력 섹션 */}
      <div className="space-y-2 mb-4">
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
            required
          />
        </InputGroup>
      </div>

      {/* 비밀번호 확인 입력 */}
      <div className="space-y-2 mb-4">
        <label htmlFor="passwordConfirm" className="text-xs font-medium">
          비밀번호 확인
        </label>
        <InputGroup className="h-11">
          <InputGroupAddon>
            <Lock />
          </InputGroupAddon>
          <InputGroupInput
            type="password"
            name="passwordConfirm"
            placeholder="비밀번호를 한 번 더 입력해주세요"
            required
          />
        </InputGroup>
      </div>

      <div className="flex items-center gap-2 py-2 mb-4">
        <Checkbox id="terms" name="terms" required />
        <label htmlFor="terms" className="text-xs text-muted-foreground">
          <span className="text-teal-600 font-semibold">서비스 이용약관</span>{" "}
          및{" "}
          <span className="text-teal-600 font-semibold">개인정보 처리방침</span>
          에 동의합니다.
        </label>
      </div>

      {/* 회원가입 버튼 */}
      <Button
        size="lg"
        type="submit"
        disabled={isPending}
        className="w-full h-11 text-white font-bold"
      >
        {isPending ? (
          "처리 중..."
        ) : (
          <div className="flex items-center justify-center gap-2">
            회원가입하기 <ArrowRight className="h-5 w-5" />
          </div>
        )}
      </Button>
    </form>
  );
}

export default SignUpForm;
