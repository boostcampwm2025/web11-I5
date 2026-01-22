import { redirect } from "next/navigation";
import { getCurrentUser, signupAction } from "../_utils/auth";
import Image from "next/image";
import SignUpForm from "../_components/signup-form";
import Link from "next/link";

async function SignUpPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="w-full flex min-h-screen flex-col items-center justify-center py-10 px-5">
      <div className="bg-white border rounded-xl p-12 w-full max-w-100">
        <div className="flex gap-2 justify-center items-center mb-9">
          <Image src="/mmh-logo.svg" alt="" width={32} height={32} />
          <span className="text-xl font-bold text-slate-700">말만해</span>
        </div>
        <div className="flex flex-col gap-3 items-center">
          <h1 className="text-2xl font-bold">회원가입</h1>
          <p className="text-sm text-muted-foreground">
            나만의 지식지도를 완성할 준비가 되셨나요?
          </p>
        </div>
        <div className="py-6">
          <SignUpForm signupAction={signupAction} />
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm text-muted-foreground">
            이미 계정이 있으신가요?
          </span>
          <Link href="/login" className="text-sm font-bold text-teal-500">
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
