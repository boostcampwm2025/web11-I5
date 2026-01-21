"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import { Input } from "@/components/input/input";
import { Button } from "@/components/button/button";

import { Mail, Lock, ArrowRight } from "lucide-react";

interface LoginFormProps {
  loginAction: (email: string, password?: string) => Promise<void>;
}

function LoginForm({ loginAction }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 시 새로고침 방지
    setIsLoading(true);

    try {
      await loginAction(email, password);
      router.push("/");
      router.refresh();
    } catch {
      alert("로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
            className="pl-10" // 아이콘 자리를 위해 왼쪽 패딩 추가
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

      {/* 로그인 버튼 */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-7 mt-2 bg-[#2DD4BF] hover:bg-[#26bba8] text-white py-6 font-medium transition-colors"
      >
        {isLoading ? (
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
