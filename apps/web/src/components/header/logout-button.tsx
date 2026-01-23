"use client";

import { logoutAction } from "@/app/(auth)/_utils/auth";
import { Button } from "../button/button";

function LogoutButton() {
  return (
    <Button
      size="lg"
      className="text-base py-2 px-3.5 text-slate-500"
      variant="ghost"
      onClick={() => logoutAction()}
    >
      로그아웃
    </Button>
  );
}

export default LogoutButton;
