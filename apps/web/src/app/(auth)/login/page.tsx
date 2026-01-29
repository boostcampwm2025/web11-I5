import { redirect } from "next/navigation";
import { getCurrentUser, loginAction } from "../_utils/auth";
import LoginForm from "../_components/login-form";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const savedEmail = cookieStore.get("saved_email")?.value || "";

  return (
    <div className="w-full flex min-h-main flex-col items-center justify-center py-4 md:py-20 px-4">
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
        <div className="py-6">
          <LoginForm loginAction={loginAction} defaultEmail={savedEmail} />
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm text-muted-foreground">
            계정이 없으신가요?
          </span>
          <Link href="/signup" className="text-sm font-bold text-teal-500">
            3초 만에 회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
