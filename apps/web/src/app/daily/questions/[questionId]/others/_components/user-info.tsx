import { User } from "lucide-react";
import { maskNickname } from "@/lib/mask-nickname";
import formatSubmittedAt from "../_lib/format-submitted-at";

interface UserInfoProps {
  nickname: string;
  submittedAt: string;
}

function UserInfo({ nickname, submittedAt }: UserInfoProps) {
  return (
    <div className="flex gap-3">
      <div className="rounded-full bg-slate-50 border-neutral-200 w-14 h-14 flex items-center justify-center border inset-shadow-2xs">
        <User className="w-8 h-8" stroke="#CBD5E1" />
      </div>
      <div className="flex flex-col">
        <div className="text-lg font-semibold">{maskNickname(nickname)}</div>
        <div className="text-sm font-medium text-muted-foreground">
          제출 일시: {formatSubmittedAt(submittedAt)}
        </div>
      </div>
    </div>
  );
}

export { UserInfo };
