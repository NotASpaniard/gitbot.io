"use client";

import { useCallback, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Đọc một giá trị chỉ tồn tại ở trình duyệt (localStorage, sessionStorage…)
 * mà không phải gọi setState trong useEffect.
 *
 * Lần render đầu (kể cả SSR) trả về `serverValue`, sau khi hydrate xong React
 * tự đọc lại giá trị thật. Chỉ dùng với kiểu nguyên thuỷ, vì useSyncExternalStore
 * so sánh snapshot bằng ===.
 */
export function useClientValue<T extends string | number | boolean | null>(
  read: () => T,
  serverValue: T,
): T {
  const getSnapshot = useCallback(() => {
    try {
      return read();
    } catch {
      return serverValue;
    }
  }, [read, serverValue]);

  return useSyncExternalStore(noopSubscribe, getSnapshot, () => serverValue);
}

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Người dùng có bật "giảm chuyển động" trong hệ điều hành hay không. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

function subscribeToResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

/** Bề rộng khung nhìn, mặc định 1280 khi render phía máy chủ. */
export function useViewportWidth(): number {
  return useSyncExternalStore(
    subscribeToResize,
    () => window.innerWidth,
    () => 1280,
  );
}
