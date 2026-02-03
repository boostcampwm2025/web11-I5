import { hasAccessToken } from "@/app/(auth)/_utils/auth";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LogoutButton from "./logout-button";
import MobileNav from "./mobile-nav";
import { Button } from "@/components/button/button";

/**
 * Render the top navigation header containing the brand, primary navigation, and account controls.
 *
 * The rendered header shows a logo linked to the homepage, a primary navigation area (hidden on small screens),
 * and a mobile navigation component. Account controls in the navigation change depending on the user's authentication state.
 *
 * @returns The header JSX element with logo, navigation links, and authentication-specific controls
 */
async function Header() {
  const isLoggedIn = await hasAccessToken();

  return (
    <header className="sticky top-0 z-40 w-full h-16 flex justify-center items-center bg-white border-slate-200 border-b">
      <div className="w-full h-full max-w-5xl px-4 md:px-8 flex justify-between items-center">
        <Link href={"/"} className="flex gap-2 items-center">
          <Image
            width={32}
            height={32}
            src={"/mmh-logo.svg"}
            alt="말만해 로고"
          />
          <div className="font-bold text-xl text-slate-700">말만해</div>
        </Link>
        <nav className="hidden md:flex gap-2.5 items-center">
          <Button
            variant="ghost"
            className="py-2 px-3.5 font-medium text-base text-slate-500 hover:bg-teal-50 hover:text-teal-500 hover:font-semibold"
            asChild
          >
            <Link href={"/daily/questions"}>문제 리스트</Link>
          </Button>
          {isLoggedIn ? (
            <>
              <LogoutButton />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-teal-50 hover:bg-teal-100"
                asChild
              >
                <Link href="/mypage" aria-label="마이페이지">
                  <User
                    stroke="#14B8A6"
                    className="w-6 h-6"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">로그인</Link>
            </Button>
          )}
        </nav>
        <MobileNav isLoggedIn={isLoggedIn} />
      </div>
    </header>
  );
}

export default Header;