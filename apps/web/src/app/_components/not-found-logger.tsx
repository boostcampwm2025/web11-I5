"use client";

import { logger } from "@/lib/sentry-logger";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface NotFoundLoggerProps {
  pageName: string;
}

export function NotFoundLogger({ pageName }: NotFoundLoggerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  useEffect(() => {
    const context = {
      pathname,
      questionId: params?.questionId,
      attempt: searchParams?.get("attempt"),
      fullUrl: `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`,
    };

    if (process.env.NODE_ENV === "production") {
      logger.warn(`404 Not Found - ${pageName}`, context);
    }
  }, [pathname, searchParams, params, pageName]);

  return null;
}
