"use client";
import { logger } from "@/lib/sentry-logger";
import { Pencil, User, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import toast from "react-hot-toast";
import {
  editUserAction,
  EditUserActionState,
} from "../../_lib/action/edit-user-action";
import {
  requestPresignedUrl,
  uploadToStorage,
} from "../../_lib/fetch/image-upload";
import { Button } from "@/components/button/button";
import { Input } from "@/components/input/input";

interface UserStatsCardProps {
  nickname: string;
  email: string;
  consecutiveDayCount: number;
  totalPoint: number;
  profileImage: string | null;
}

const initialState: EditUserActionState = {
  success: false,
  message: "",
  errors: {},
};
function UserStatsCard({
  nickname,
  email,
  consecutiveDayCount,
  totalPoint,
  profileImage,
}: UserStatsCardProps) {
  const [state, formAction, isPending] = React.useActionState(
    editUserAction,
    initialState,
  );

  const [isEditing, setIsEditing] = React.useState(false);
  const [nicknameValue, setNicknameValue] = React.useState(nickname);
  const [profileImagePreview, setProfileImagePreview] = React.useState<
    string | null
  >(profileImage);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [shouldDeleteImage, setShouldDeleteImage] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onEditToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsEditing((prev) => !prev);
  };

  const handleFormAction = async (formData: FormData) => {
    // server action -> 1MB 이하의 파일만 처리가능
    // presignedURL 받고 업로드 -> 클라이언트에서
    // DB 반영 -> server action으로 처리
    if (shouldDeleteImage) {
      formData.set("removeImage", "true");
    } else if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("이미지는 5MB 이하만 업로드 가능합니다.");
        return;
      }

      const uploadPromise = async () => {
        const { uploadUrl, objectKey } = await requestPresignedUrl(
          selectedFile.type,
        );
        await uploadToStorage(uploadUrl, selectedFile);
        return objectKey;
      };

      try {
        const objectKey = await uploadPromise();

        formData.set("objectKey", objectKey);
        formData.delete("profileImage");
      } catch (error) {
        logger.error("이미지 업로드 실패", {
          error: error instanceof Error ? error.message : String(error),
        });
        toast.error("이미지 업로드에 실패하였습니다.");
        return;
      }
    }

    React.startTransition(() => {
      formAction(formData);
    });
  };

  const handleRemoveImage = () => {
    setShouldDeleteImage(true);
    setProfileImagePreview(null);
    setSelectedFile(null);
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNicknameValue(nickname);
    setProfileImagePreview(profileImage);
    setSelectedFile(null);
    setShouldDeleteImage(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShouldDeleteImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        toast.error("이미지를 읽는데 실패하였습니다.");
        setSelectedFile(null);
      };

      reader.readAsDataURL(file);
    }
  };

  React.useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
        setIsEditing(false);
        setSelectedFile(null);
        setShouldDeleteImage(false);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <form
      action={handleFormAction}
      className="border border-slate-200 bg-white rounded-2xl"
    >
      <div className="p-6 md:p-8">
        {/* 모바일: 세로 중앙 정렬 / 데스크탑: 가로 배치 */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* 프로필 섹션 */}
          <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6 md:flex-1">
            {/* 프로필 이미지 */}
            <div className="relative">
              <div
                className={`relative rounded-full w-20 h-20 md:w-16 md:h-16 flex items-center justify-center border border-slate-200 ${
                  profileImagePreview ? "" : "bg-slate-50"
                } ${isEditing ? "cursor-pointer hover:border-slate-300 transition-all" : ""}`}
                onClick={handleImageClick}
              >
                {profileImagePreview ? (
                  <Image
                    src={profileImagePreview}
                    alt="profileImage"
                    fill={true}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 md:w-8 md:h-8 text-slate-300" />
                )}
                {isEditing && (profileImagePreview || selectedFile) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
                    aria-label="이미지 제거"
                  >
                    <X className="w-3 h-3 text-slate-500" />
                  </button>
                )}
                {isEditing && !profileImagePreview && !selectedFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full p-1.5 shadow-md hover:bg-teal-600 transition-colors"
                    aria-label="이미지 추가"
                  >
                    <Pencil className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              name="profileImage"
            />

            {/* 유저 정보 */}
            <div className="flex flex-col items-center md:items-start gap-1 min-w-0">
              {isEditing ? (
                <>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Input
                      name="nickname"
                      placeholder="닉네임 입력"
                      value={nicknameValue}
                      onChange={(e) => setNicknameValue(e.target.value)}
                      autoFocus
                      maxLength={20}
                      className="h-9 w-44 text-center sm:text-left"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={isPending}>
                        {isPending ? "저장 중..." : "저장"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        aria-label="취소"
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                  <span className="text-slate-400 text-sm">{email}</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-slate-900 font-bold text-xl md:text-2xl truncate max-w-48">
                      {nicknameValue}
                    </h2>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={onEditToggle}
                      aria-label="프로필 편집"
                      className="h-8 w-8 shrink-0"
                    >
                      <Pencil className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                  <span className="text-slate-400 text-sm">{email}</span>
                </>
              )}
            </div>
          </div>

          {/* 통계 섹션 */}
          <div className="flex gap-3 justify-center md:justify-end">
            <div className="flex flex-col items-center px-5 py-3 bg-linear-to-br from-teal-50 to-teal-100/50 rounded-xl min-w-24">
              <span className="text-xs text-teal-600 font-medium mb-1">
                연속 학습
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="font-bold text-2xl text-teal-600">
                  {consecutiveDayCount}
                </span>
                <span className="text-sm font-medium text-teal-500">일</span>
              </div>
            </div>
            <div className="flex flex-col items-center px-5 py-3 bg-linear-to-br from-slate-50 to-slate-100/50 rounded-xl min-w-24">
              <span className="text-xs text-slate-500 font-medium mb-1">
                해결한 문제
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="font-bold text-2xl text-slate-700">
                  {totalPoint}
                </span>
                <span className="text-sm font-medium text-slate-400">개</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default UserStatsCard;
