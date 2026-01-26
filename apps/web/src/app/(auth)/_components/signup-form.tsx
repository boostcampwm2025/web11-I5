"use client";

import * as React from "react";
import { Button } from "@/components/button/button";
import { SignupState } from "../_utils/auth";

import { Mail, Lock, ArrowRight, User, AlertCircle } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/input-group/input-group";
import { Checkbox } from "@/components/checkbox/checkbox";
import { SIGNUP_CONSTANTS } from "../_constants/input-condition";

interface SignUpFormProps {
  signupAction: (
    prevState: SignupState | undefined,
    formData: FormData,
  ) => Promise<SignupState | undefined>;
}

const INITIAL_FORM_STATE = {
  nickname: "",
  email: "",
  password: "",
  passwordConfirm: "",
};

function SignUpForm({ signupAction }: SignUpFormProps) {
  const [state, formAction, isPending] = React.useActionState(
    signupAction,
    undefined,
  );

  const [formData, setFormData] = React.useState(INITIAL_FORM_STATE);
  const [agreed, setAgreed] = React.useState(false);

  const lastProcessedStateRef = React.useRef<typeof state>(undefined);

  React.useEffect(() => {
    if (!state || state === lastProcessedStateRef.current) return;

    if (state.errors) {
      const fieldsToClear: Partial<typeof INITIAL_FORM_STATE> = {};

      (Object.keys(state.errors) as Array<keyof typeof state.errors>).forEach(
        (key) => {
          if (key in INITIAL_FORM_STATE) {
            fieldsToClear[key as keyof typeof INITIAL_FORM_STATE] = "";
          }
        },
      );

      if (state.errors.password) {
        fieldsToClear.passwordConfirm = "";
      }

      setFormData((prev) => ({ ...prev, ...fieldsToClear }));
      lastProcessedStateRef.current = state;
    }
  }, [state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validation = {
    nickname:
      formData.nickname.length >= SIGNUP_CONSTANTS.NICKNAME_MIN_LENGTH &&
      formData.nickname.length <= SIGNUP_CONSTANTS.NICKNAME_MAX_LENGTH &&
      !/\s/.test(formData.nickname),
    email:
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.email.length <= SIGNUP_CONSTANTS.EMAIL_MAX_LENGTH,
    password: formData.password.length >= SIGNUP_CONSTANTS.PASSWORD_MIN_LENGTH,
    passwordConfirm:
      formData.password === formData.passwordConfirm &&
      formData.passwordConfirm !== "",
  };

  const isFormValid =
    validation.nickname &&
    validation.email &&
    validation.password &&
    validation.passwordConfirm &&
    agreed;

  const serverErrorMessage = state?.error;

  return (
    <form action={formAction} className="w-full">
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
            value={formData.nickname}
            onChange={handleInputChange}
            required
          />
        </InputGroup>
        <p
          className={`text-[11px] mt-1.5 ml-1 font-medium ${formData.nickname && !validation.nickname ? "text-red-500" : "text-slate-500"}`}
        >
          * {SIGNUP_CONSTANTS.NICKNAME_MIN_LENGTH}~
          {SIGNUP_CONSTANTS.NICKNAME_MAX_LENGTH}자 사이, 공백 없이 입력해주세요.
        </p>
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
            id="email"
            type="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </InputGroup>
        <p
          className={`text-[11px] mt-1.5 ml-1 font-medium ${formData.email && !validation.email ? "text-red-500" : "text-slate-500"}`}
        >
          * 올바른 이메일 형식을 입력해주세요.
        </p>
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
            id="password"
            type="password"
            name="password"
            placeholder="***********"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </InputGroup>
        <p
          className={`text-[11px] mt-1.5 ml-1 font-medium ${formData.password && !validation.password ? "text-red-500" : "text-slate-500"}`}
        >
          * 최소 {SIGNUP_CONSTANTS.PASSWORD_MIN_LENGTH}자 이상 입력해주세요.
        </p>
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
            id="passwordConfirm"
            type="password"
            name="passwordConfirm"
            placeholder="비밀번호를 한 번 더 입력해주세요"
            value={formData.passwordConfirm}
            onChange={handleInputChange}
            required
          />
        </InputGroup>
        <p
          className={`text-[11px] mt-1.5 ml-1 font-medium ${formData.passwordConfirm && !validation.passwordConfirm ? "text-red-500" : "text-slate-500"}`}
        >
          * 비밀번호가 일치하지 않습니다.
        </p>
      </div>

      <div className="flex items-center gap-2 py-2 mb-4">
        <Checkbox
          id="terms"
          name="terms"
          onCheckedChange={(checked: boolean) => setAgreed(checked)}
          required
        />
        <label htmlFor="terms" className="text-xs text-muted-foreground">
          <span className="text-teal-600 font-semibold">서비스 이용약관</span>{" "}
          및{" "}
          <span className="text-teal-600 font-semibold">개인정보 처리방침</span>
          에 동의합니다.
        </label>
      </div>

      {serverErrorMessage && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-md bg-red-50 text-red-600 text-xs font-medium animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverErrorMessage}</span>
        </div>
      )}

      {/* 회원가입 버튼 */}
      <Button
        size="lg"
        type="submit"
        disabled={isPending || !isFormValid}
        className="w-full h-11 text-white font-bold transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
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
