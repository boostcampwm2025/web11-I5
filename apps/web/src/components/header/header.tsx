import { hasAccessToken } from "@/app/(auth)/_utils/auth";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LogoutButton from "./logout-button";

async function Header() {
  const isLoggedIn = await hasAccessToken();

  return (
    <div className="sticky top-0 z-40 w-full h-16 flex justify-center items-center bg-white border-slate-200 border-b ">
      <div className="w-full h-full max-w-5xl px-8 flex justify-between items-center ">
        <Link href={"/"} className="flex gap-2 items-center">
          <Image width={32} height={32} src={"/mmh-logo.svg"} alt="logo" />
          <div className="font-bold text-xl text-slate-700">말만해</div>
        </Link>
        <section className="flex gap-2.5 items-center">
          <Link
            className="py-2 px-3.5 font-medium text-base rounded-sm text-slate-500 hover:bg-teal-50 hover:text-teal-500 hover:font-semibold"
            href={"/daily/questions"}
          >
            문제 리스트
          </Link>
          {isLoggedIn ? (
            <>
              <LogoutButton />
              <Link
                href="/mypage"
                className="flex justify-center items-center rounded-full bg-teal-50 w-8 h-8 hover:bg-teal-100 transition-colors"
              >
                <User stroke="#14B8A6" className="w-6 h-6" />
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="text-white bg-teal-400 rounded-sm px-3.5 py-2 font-semibold text-base"
            >
              로그인
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}

export default Header;
