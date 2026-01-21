"use client";
import { Pencil, User } from "lucide-react";
import * as React from "react";

interface UserStatsCardProps {
  nickname: string;
  email: string;
  consecutiveDayCount: number;
  totalPoint: number;
  role: string;
}

function UserStatsCard({
  nickname,
  email,
  consecutiveDayCount,
  totalPoint,
  role,
}: UserStatsCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [nicknameValue, setNicknameValue] = React.useState(nickname);
  const [roleValue, setRoleValue] = React.useState(role);

  const onEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsEditing(!isEditing);
  };

  return (
    <div className="p-8 border border-slate-200 bg-white rounded-[12px] flex justify-between items-center">
      <div className="flex justify-between gap-6 h-16 ">
        <div className="rounded-full bg-slate-50 border-neutral-200 p-4 border inset-shadow-2xs">
          <User className="w-8 h-8" stroke="#CBD5E1" />
        </div>
        <div className="flex flex-col gap-1">
          {isEditing ? (
            <form action="" className="flex flex-col gap-1">
              {/*server action 만들어서 연결하기 */}
              <section className="flex items-center gap-2">
                <input
                  name="nickname"
                  placeholder="닉네임 입력"
                  value={nicknameValue}
                  onChange={(e) => setNicknameValue(e.target.value)}
                  className="text-slate-900 font-bold text-2xl w-auto"
                />
                <button
                  onClick={onEditClick}
                  aria-label="수정 완료"
                  className="bg-white border border-slate-200 px-2 h-6 flex items-center justify-center rounded-sm"
                >
                  <span className="text-sm text-slate-500 font-medium">
                    수정 완료
                  </span>
                </button>
              </section>
              <section>
                <div className="flex gap-4 items-center">
                  <div className="text-slate-900 font-semibold text-base">
                    {email}
                  </div>
                  <input
                    name="role"
                    placeholder="역할 입력"
                    value={roleValue}
                    onChange={(e) => setRoleValue(e.target.value)}
                    className="bg-slate-100 rounded-sm p-1 text-slate-500 font-bold text-base w-auto "
                  />
                </div>
              </section>
            </form>
          ) : (
            <>
              <section className="flex items-center gap-2">
                <div className="text-slate-900 font-bold text-2xl">
                  {nicknameValue}
                </div>
                <button
                  onClick={onEditClick}
                  aria-label="닉네임 편집"
                  className="bg-white border border-slate-200 px-2 h-6 flex items-center justify-center rounded-sm"
                >
                  <Pencil className="w-3 h-3" stroke="#94A3B8" />
                </button>
              </section>
              <section>
                <div className="flex gap-4  items-center">
                  <div className="text-slate-900 font-semibold text-base">
                    {email}
                  </div>
                  <div className="bg-slate-100 rounded-sm p-1 text-slate-500 font-bold text-base">
                    {roleValue}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
      <div className="flex px-4 py-2 bg-teal-50 rounded-xl items-center gap-3">
        <div className="flex flex-col items-center p-3">
          <span className="text-sm text-slate-500 font-semibold">
            연속 학습일
          </span>
          <div className="flex gap-1">
            <span className="font-bold text-teal-600 text-base">
              {consecutiveDayCount}
            </span>
            <span className="font-medium text-sm text-slate-500">일째</span>
          </div>
        </div>
        <hr className="w-px h-9 bg-slate-200" />
        <div className="flex flex-col items-center p-3">
          <span className="text-sm text-slate-500 font-semibold">
            해결한 문제
          </span>
          <div className="flex gap-1">
            <span className="font-bold text-teal-600 text-base">
              {totalPoint}
            </span>
            <span className="font-medium text-sm text-slate-500">개</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserStatsCard;
