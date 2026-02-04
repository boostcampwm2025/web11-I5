"use client";

import Image from "next/image";
import Link from "next/link";

function StaticHeader() {
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
      </div>
    </header>
  );
}

export default StaticHeader;
