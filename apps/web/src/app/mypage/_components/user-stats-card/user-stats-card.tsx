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
      className="p-8 border border-slate-200 bg-white rounded-[12px] flex flex-col gap-4"
    >
      <div className="flex justify-between items-center">
        <div className="flex justify-between gap-6 h-16">
          <div className="flex flex-col gap-1">
            <div
              className={`relative rounded-full ${profileImagePreview ? "bg-none border-none" : "bg-slate-50 border-neutral-200 border inset-shadow-2xs "}   w-16 h-16 flex items-center justify-center ${isEditing ? "cursor-pointer hover:bg-slate-100" : ""} ${profileImagePreview ? "p-0" : "p-4"}`}
              onClick={handleImageClick}
            >
              {profileImagePreview ? (
                <Image
                  src={profileImagePreview}
                  alt="profileImage"
                  fill={true}
                  className="rounded-full object-cover "
                />
              ) : (
                <User className="w-8 h-8" stroke="#CBD5E1" />
              )}
              {isEditing && (profileImagePreview || selectedFile) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute -bottom-1 -right-2  rounded-full p-1 shadow-md transition-colors"
                  aria-label="이미지 제거"
                >
                  <X className="w-3 h-3 text-slate-600" />
                </button>
              )}
              {isEditing && !profileImagePreview && !selectedFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute -bottom-1 -right-2  rounded-full p-1 shadow-md transition-colors"
                  aria-label="이미지 추가"
                >
                  <Pencil className="w-3 h-3 text-slate-600" />
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

          <div className="flex flex-col gap-1">
            {isEditing ? (
              <>
                <section className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <input
                      name="nickname"
                      placeholder="닉네임 입력"
                      value={nicknameValue}
                      onChange={(e) => setNicknameValue(e.target.value)}
                      className="text-slate-900 font-bold text-2xl w-auto border pl-1 border-teal-500 focus:border-teal-600 focus:outline-none rounded"
                      autoFocus
                      maxLength={20}
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="bg-white border border-slate-200 px-2 h-6 flex items-center justify-center rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-sm text-slate-500 font-medium">
                        {isPending ? "수정 중..." : "수정 완료"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      aria-label="취소"
                      className="bg-white border border-slate-200 px-2 h-6 flex items-center justify-center rounded-sm"
                    >
                      <span className="text-sm text-slate-500 font-medium">
                        취소
                      </span>
                    </button>
                  </div>
                </section>

                <section>
                  <div className="flex gap-4 items-center">
                    <div className="text-slate-900 font-semibold text-base">
                      {email}
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <>
                <section className="flex items-center gap-2">
                  <div className="text-slate-900 font-bold text-2xl">
                    {nicknameValue}
                  </div>
                  <button
                    type="button"
                    onClick={onEditToggle}
                    aria-label="닉네임 편집"
                    className="bg-white border border-slate-200 px-2 h-6 flex items-center justify-center rounded-sm"
                  >
                    <span className="text-sm text-slate-500 font-medium">
                      수정
                    </span>
                  </button>
                </section>

                <section>
                  <div className="flex gap-4 items-center">
                    <div className="text-slate-900 font-semibold text-base">
                      {email}
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
              <span className="font-bold text-teal-600">
                {consecutiveDayCount}
              </span>
              <span className="font-medium text-slate-500">일째</span>
            </div>
          </div>

          <hr className="w-px h-9 bg-slate-200" />

          <div className="flex flex-col items-center p-3">
            <span className="text-sm text-slate-500 font-semibold">
              해결한 문제
            </span>
            <div className="flex gap-1">
              <span className="font-bold text-teal-600">{totalPoint}</span>
              <span className="font-medium text-slate-500">개</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default UserStatsCard;
