import { redirect } from "next/navigation";
import { getCurrentUser, loginAction } from "../_utils/auth";
import LoginForm from "../_components/login-form";
import { GoogleLoginButton } from "../_components/google-login-button";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

async function LoginPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (user) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const savedEmail = cookieStore.get("saved_email")?.value || "";

  return (
    <div className="w-full flex min-h-screen flex-col items-center justify-center py-4 md:py-20 px-4">
      <div className="bg-white border rounded-xl p-6 md:p-12 w-full max-w-100">
        <Link href="/" className="flex gap-2 justify-center items-center mb-9">
          <Image src="/mmh-logo.svg" alt="" width={32} height={32} />
          <span className="text-xl font-bold text-slate-700">말만해</span>
        </Link>
        <div className="flex flex-col gap-3 items-center">
          <h1 className="text-2xl font-bold">로그인</h1>
          <p className="text-sm text-muted-foreground">
            서비스 이용을 위해 로그인이 필요합니다.
          </p>
        </div>

        {params.error === "oauth_failed" && (
          <div className="mt-4 p-3 rounded-md bg-red-50 text-red-600 text-xs">
            소셜 로그인에 실패했습니다. 다시 시도해주세요.
          </div>
        )}

        <div className="py-6">
          <LoginForm loginAction={loginAction} defaultEmail={savedEmail} />
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        <GoogleLoginButton />

        <div className="flex items-center justify-center gap-1 mt-6">
          <span className="text-sm text-muted-foreground">
            계정이 없으신가요?
          </span>
          <Link href="/signup" className="text-sm font-bold text-teal-400">
            3초 만에 회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
