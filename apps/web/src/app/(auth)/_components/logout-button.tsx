"use client";

import { useRouter } from "next/navigation";
import { logoutAction } from "../_utils/auth";

function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutAction();
      // logout Server Action에서 redirect를 처리하므로 여기서는 필요 없음
    } catch {
      // 에러 발생 시 홈으로 이동
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      로그아웃
    </button>
  );
}

export default LogoutButton;
