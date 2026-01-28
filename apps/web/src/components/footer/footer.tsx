import Image from "next/image";

async function Footer() {
  return (
    <div className="w-full bg-white flex flex-col justify-center items-center h-60 gap-6 border-t border-slate-200">
      <div className="flex flex-col">
        <div className="flex gap-2 items-center">
          <Image width={32} height={32} src={"/mmh-logo.svg"} alt="logo" />
          <div className="font-bold text-xl text-slate-700">말만해</div>
        </div>
      </div>
      <div className="flex flex-col gap-3 text-slate-400 text-center text-sm">
        <span>© 2026 Malmanhae. All rights reserved.</span>
        <span>AI 기반 CS 지식 구조화 플랫폼</span>
      </div>
    </div>
  );
}

export default Footer;
