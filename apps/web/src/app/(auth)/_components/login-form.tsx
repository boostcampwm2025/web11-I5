"use client";

import { useRouter } from "next/navigation";
import type { User } from "../_utils/auth";

interface LoginFormProps {
  testUsers: User[];
  loginAction: (email: string, password?: string) => Promise<void>;
}

function LoginForm({ testUsers, loginAction }: LoginFormProps) {
  const router = useRouter();

  const handleLogin = async (email: string) => {
    try {
      await loginAction(email);
      router.push("/");
      router.refresh(); // 서버 컴포넌트 재렌더링을 위해
    } catch {
      alert("로그인에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-2">
      {testUsers.map((testUser) => (
        <button
          key={testUser.id}
          onClick={() => handleLogin(testUser.email ?? "")}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <div className="font-medium text-black dark:text-zinc-50">
            {testUser.nickname || `유저 #${testUser.id}`}
          </div>
        </button>
      ))}
    </div>
  );
}

export default LoginForm;
