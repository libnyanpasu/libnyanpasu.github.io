import type { DownloadArch, DownloadOs } from "./types";

export interface Device {
  os?: DownloadOs;
  arch?: DownloadArch;
  mobile: boolean;
}

export interface DeviceNavigator {
  userAgent: string;
  platform?: string;
  maxTouchPoints?: number;
  userAgentData?: {
    platform?: string;
    mobile?: boolean;
    getHighEntropyValues?: (
      hints: string[],
    ) => Promise<{ architecture?: string; bitness?: string; platform?: string }>;
  };
}

export function detectDevice(navigator: DeviceNavigator): Device {
  const ua = navigator.userAgent;
  const mobile =
    navigator.userAgentData?.mobile === true ||
    /Android|iPhone|iPad|iPod/i.test(ua) ||
    (/Mac/i.test(navigator.platform || ua) && (navigator.maxTouchPoints || 0) > 1);
  if (mobile || /CrOS/i.test(ua)) return { mobile };

  const platform = navigator.userAgentData?.platform || navigator.platform || ua;
  const os = /win/i.test(platform)
    ? "windows"
    : /mac/i.test(platform)
      ? "macos"
      : /linux/i.test(platform)
        ? "linux"
        : undefined;
  // Intel in a macOS UA also appears on Apple Silicon. Keep that case unknown.
  const arch = /aarch64|arm64/i.test(ua)
    ? "arm64"
    : os !== "macos" && /x86_64|amd64|Win64|x64|WOW64/i.test(ua)
      ? "x64"
      : undefined;
  return { os, arch, mobile: false };
}

export async function detectDeviceWithHints(navigator: DeviceNavigator): Promise<Device> {
  const device = detectDevice(navigator);
  if (device.mobile || !navigator.userAgentData?.getHighEntropyValues) return device;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const hints = await Promise.race([
      navigator.userAgentData.getHighEntropyValues(["architecture", "bitness"]),
      new Promise<undefined>((resolve) => {
        timeout = setTimeout(() => resolve(undefined), 1200);
      }),
    ]);
    if (!hints) return device;
    if (hints.bitness && hints.bitness !== "64") return { ...device, arch: undefined };
    if (hints.bitness !== "64") return device;
    const arch =
      hints.architecture === "arm" ? "arm64" : hints.architecture === "x86" ? "x64" : undefined;
    return { ...device, arch: arch || device.arch };
  } catch {
    return device;
  } finally {
    clearTimeout(timeout);
  }
}
