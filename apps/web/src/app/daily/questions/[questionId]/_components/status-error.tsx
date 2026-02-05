import { AlertCircle, MicOff, ShieldAlert } from "lucide-react";
import { RecorderStatus } from "../_hooks/use-recorder";

interface StatusErrorProps {
  status: RecorderStatus;
}

const ERROR_CONFIG = {
  unsupported: {
    icon: AlertCircle,
    title: "지원되지 않는 브라우저",
    description:
      "이 브라우저는 음성 녹음을 지원하지 않습니다. Chrome, Safari 등 최신 브라우저를 이용해주세요.",
  },
  permission_denied: {
    icon: ShieldAlert,
    title: "마이크 권한 필요",
    description:
      "음성 녹음을 위해 마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.",
  },
  no_device: {
    icon: MicOff,
    title: "마이크를 찾을 수 없음",
    description:
      "연결된 마이크 장치가 없습니다. 마이크를 연결하고 다시 시도해주세요.",
  },
} as const;

function StatusError({ status }: StatusErrorProps) {
  const config = ERROR_CONFIG[status as keyof typeof ERROR_CONFIG];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-6">
      <div className="w-16 h-16 mb-4 rounded-full bg-red-50 flex items-center justify-center">
        <Icon className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {config.title}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm">{config.description}</p>
    </div>
  );
}

export { StatusError };
