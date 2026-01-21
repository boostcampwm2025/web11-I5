import { redirect } from "next/navigation";
import { getCurrentUser, signup } from "../_utils/auth";
import Image from "next/image";
import SignUpForm from "../_components/signup-form";
import Link from "next/link";

async function SignUpPage() {
  const user = await getCurrentUser();
  const mmhLogo = "/mmh-logo.svg";

  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <div className="flex flex-1 items-center justify-center ">
        <div className="flex flex-col justify-center items-center w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex gap-2 justify-center items-center mb-12">
            <Image src={mmhLogo} alt="말만해 로고" width={32} height={32} />
            <p className="text-xl text-slate-700 font-semibold">말만해</p>
          </div>
          <div className="flex flex-col gap-2 justify-center items-center mb-6 ">
            <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
              회원가입
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              나만의 지식지도를 완성할 준비가 되셨나요?
            </p>
          </div>

          <SignUpForm signupAction={signup} />
          <div className="mt-8 text-center text-sm text-zinc-500">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="text-[#2DD4BF] font-semibold hover:underline"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
