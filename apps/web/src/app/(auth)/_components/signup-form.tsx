"use client";

import * as React from "react";

import { Input } from "@/components/input/input";
import { Button } from "@/components/button/button";

import { Mail, Lock, ArrowRight, User } from "lucide-react";

interface SignUpFormProps {
  signupAction: (
    nickname: string,
    email: string,
    password: string,
  ) => Promise<void>;
}

function SignUpForm({ signupAction }: SignUpFormProps) {
  const [nickname, setNickname] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const isFormValid =
    nickname.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "" &&
    passwordConfirm.trim() !== "" &&
    agreed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isFormValid) return;

    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    setIsLoading(true);

    try {
      await signupAction(nickname, email, password);
    } catch {
      alert("회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 이름(닉네임) 입력 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          이름
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="text"
            placeholder="홍길동"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      {/* 이메일 입력 섹션 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          이메일
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      {/* 비밀번호 입력 섹션 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          비밀번호
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      {/* 비밀번호 확인 입력 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          비밀번호 확인
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="password"
            placeholder="비밀번호를 한 번 더 입력해주세요."
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2 py-2">
        <input
          type="checkbox"
          id="terms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 accent-[#2DD4BF]"
        />
        <label
          htmlFor="terms"
          className="text-sm text-zinc-600 dark:text-zinc-400"
        >
          <span className="text-[#2DD4BF] font-medium">서비스 이용약관</span> 및{" "}
          <span className="text-[#2DD4BF] font-medium">개인정보 처리방침</span>
          에 동의합니다.
        </label>
      </div>

      {/* 회원가입 버튼 */}
      <Button
        type="submit"
        disabled={!isFormValid || isLoading}
        className={`w-full h-12 mt-4 text-white font-medium transition-colors ${
          isFormValid
            ? "bg-[#2DD4BF] hover:bg-[#26bba8]"
            : "bg-slate-400 cursor-not-allowed"
        }`}
      >
        {isLoading ? (
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
