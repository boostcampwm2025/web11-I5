"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "../button/button";
import { logoutAction } from "@/app/(auth)/_utils/auth";

interface MobileNavProps {
  isLoggedIn: boolean;
}

function MobileNav({ isLoggedIn }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden relative"
        onClick={toggleMenu}
        aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
        type="button"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
          <span
            className={`block h-0.5 w-5 bg-slate-700 rounded-full transition-all duration-300 ease-in-out origin-center ${
              isOpen ? "rotate-45 translate-y-1" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-slate-700 rounded-full transition-all duration-300 ease-in-out origin-center ${
              isOpen ? "-rotate-45 -translate-y-1" : ""
            }`}
          />
        </div>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-x-0 top-16 bottom-0 bg-black/40 z-50 md:hidden"
            onClick={closeMenu}
          />

          <nav className="fixed top-16 left-0 right-0 bg-white z-50 md:hidden border-b border-slate-200 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col p-4 gap-2">
              <Button
                variant="ghost"
                className="justify-start py-3 px-4 text-base text-slate-500 hover:bg-teal-50 hover:text-teal-500"
                asChild
              >
                <Link href="/daily/questions" onClick={closeMenu}>
                  문제 리스트
                </Link>
              </Button>

              {isLoggedIn ? (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start py-3 px-4 text-base text-slate-500 hover:bg-teal-50 hover:text-teal-500"
                    asChild
                  >
                    <Link href="/mypage" onClick={closeMenu}>
                      마이페이지
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start py-3 px-4 text-base text-slate-500 hover:bg-teal-50 hover:text-teal-500"
                    onClick={() => {
                      logoutAction();
                      closeMenu();
                    }}
                    type="button"
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <Button className="py-3 px-4 text-base" asChild>
                  <Link href="/login" onClick={closeMenu}>
                    로그인
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  );
}

export default MobileNav;
