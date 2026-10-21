import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { m } from "@/paraglide/messages.js";
import type { Locale } from "@/paraglide/runtime";
import { detectDevice, detectDeviceWithHints } from "@/lib/downloads/device";
import type { DeviceNavigator } from "@/lib/downloads/device";
import {
  initialSelection,
  platformNames,
  resolveSource,
  selectionParams,
} from "@/lib/downloads/selection";
import type { DownloadSelection } from "@/lib/downloads/selection";
import {
  probeCacheKey,
  probeSources,
  readProbeCache,
  writeProbeCache,
} from "@/lib/downloads/probe";
import type { ProbeResult } from "@/lib/downloads/probe";
import type { DownloadAsset, DownloadCatalog } from "@/lib/downloads/types";

export type DownloadIcons = Record<string, { body: string; viewBox: string }>;

function Icon({ name, icons }: { name: string; icons: DownloadIcons }) {
  const icon = icons[name];
  return (
    <svg
      viewBox={icon.viewBox}
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}

function Expandable({ id, open, children }: { id: string; open: boolean; children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      id={id}
      className="download-panel__expansion"
      initial={false}
      animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 420, damping: 38, opacity: { duration: 0.16 } }
      }
      inert={!open}
      aria-hidden={!open}
    >
      <div className="download-panel__expansion-inner">{children}</div>
    </motion.div>
  );
}

function assetLabel(asset: DownloadAsset, locale: Locale) {
  const opts = { locale };
  const arch =
    asset.os === "macos"
      ? asset.arch === "arm64"
        ? m.download_apple_silicon(undefined, opts)
        : m.download_intel(undefined, opts)
      : asset.arch === "arm64"
        ? m.download_arm64(undefined, opts)
        : m.download_x64(undefined, opts);
  const format = asset.format === "appimage" ? "AppImage" : asset.format.toUpperCase();
  const size = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(
    asset.size / 1_000_000,
  );
  const detail = [
    format,
    asset.format === "zip" ? m.download_portable(undefined, opts) : undefined,
    asset.variant === "fixed-webview" ? m.download_fixed_webview(undefined, opts) : undefined,
    `${size} MB`,
  ]
    .filter(Boolean)
    .join(" · ");
  return { arch, detail };
}

export default function DownloadPanel({
  catalog,
  locale,
  icons,
}: {
  catalog: DownloadCatalog;
  locale: Locale;
  icons: DownloadIcons;
}) {
  const opts = { locale };
  const [selection, setSelection] = useState<DownloadSelection>({
    source: "auto",
    unavailable: false,
  });
  const [initialized, setInitialized] = useState(false);
  const [expanded, setExpanded] = useState<"device" | "source" | null>(null);
  const [results, setResults] = useState<ProbeResult[]>([]);
  const [probing, setProbing] = useState(false);
  const [probeRun, setProbeRun] = useState(0);
  const [notice, setNotice] = useState("");
  const touchedDevice = useRef(false);
  const deviceTrigger = useRef<HTMLButtonElement>(null);
  const sourceTrigger = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const asset = catalog.assets.find((item) => item.id === selection.assetId);
  const selectedSource = resolveSource(asset, selection.source, results);
  const source = catalog.sources.find((item) => item.id === selectedSource);
  const downloadUrl =
    !selection.unavailable && asset && selectedSource ? asset.urls[selectedSource] : undefined;
  const availableSources = catalog.sources.filter((item) => !asset || asset.urls[item.id]);
  const labels = asset ? assetLabel(asset, locale) : undefined;
  const base = locale === "zh-cn" ? "/zh-cn" : "";

  useEffect(() => {
    let active = true;
    const nav = navigator as DeviceNavigator;
    const params = new URLSearchParams(window.location.search);
    setSelection(initialSelection(catalog, detectDevice(nav), params));
    setInitialized(true);
    void detectDeviceWithHints(nav).then((device) => {
      if (active && !touchedDevice.current) {
        setSelection((current) => ({
          ...initialSelection(catalog, device, new URLSearchParams(window.location.search)),
          source: current.source,
        }));
      }
    });
    return () => {
      active = false;
    };
  }, [catalog]);

  useEffect(() => {
    const controller = new AbortController();
    const key = probeCacheKey(catalog.tag, catalog.sources);
    const cached = probeRun === 0 ? readProbeCache(key) : undefined;
    if (cached) {
      setResults(cached);
      return;
    }
    setProbing(catalog.sources.some((item) => item.probeUrl));
    void probeSources(catalog.sources, controller.signal).then((measured) => {
      if (controller.signal.aborted) return;
      setResults(measured);
      setProbing(false);
      writeProbeCache(key, measured);
    });
    return () => controller.abort();
  }, [catalog, probeRun]);

  function updateSelection(next: DownloadSelection, deviceChanged = false) {
    if (deviceChanged) touchedDevice.current = true;
    setSelection(next);
    setNotice("");
    const selected = catalog.assets.find((item) => item.id === next.assetId);
    const params = selectionParams(selected, next.source);
    if (!selected && next.os) params.set("os", next.os);
    history.replaceState(history.state, "", `${location.pathname}?${params}${location.hash}`);
  }

  function toggle(panel: "device" | "source") {
    if (panel === "device") touchedDevice.current = true;
    setExpanded((current) => (current === panel ? null : panel));
    setNotice("");
  }

  function sourceStatus(id: string) {
    if (probing) return m.download_probing(undefined, opts);
    const result = results.find((item) => item.id === id);
    if (result?.status === "ready") {
      return m.download_probe_elapsed({ elapsed: String(Math.round(result.elapsed!)) }, opts);
    }
    if (result?.status === "timeout") return m.download_probe_timeout(undefined, opts);
    if (!catalog.sources.find((item) => item.id === id)?.probeUrl) {
      return m.download_probe_missing(undefined, opts);
    }
    return m.download_probe_failed(undefined, opts);
  }

  async function copyLink() {
    if (!downloadUrl) return;
    try {
      await navigator.clipboard.writeText(downloadUrl);
      setNotice(m.download_copied(undefined, opts));
    } catch {
      setNotice(m.download_copy_failed(undefined, opts));
    }
  }

  const buttonMotion = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 720, damping: 38 };

  return (
    <div
      className="download-panel"
      data-slot="download-panel"
      data-initialized={initialized}
      onKeyDown={(event) => {
        if (event.key === "Escape" && expanded) {
          (expanded === "device" ? deviceTrigger : sourceTrigger).current?.focus();
          setExpanded(null);
        }
      }}
    >
      <div className="download-panel__package" aria-live="polite">
        <span className="download-panel__device-icon">
          <Icon name={selection.os || "device"} icons={icons} />
        </span>
        <div>
          <h2>
            {selection.os ? platformNames[selection.os] : m.download_choose_device(undefined, opts)}
          </h2>
          <p>
            {labels
              ? `${labels.arch} · ${labels.detail}`
              : !initialized
                ? m.download_checking_device(undefined, opts)
                : selection.os
                  ? m.download_arch_hint(undefined, opts)
                  : m.download_device_hint(undefined, opts)}
          </p>
        </div>
      </div>

      {downloadUrl ? (
        <motion.a
          className="download-panel__download"
          href={downloadUrl}
          data-slot="download-action"
          whileTap={{ scale: reducedMotion ? 1 : 0.975, borderRadius: reducedMotion ? 36 : 20 }}
          transition={buttonMotion}
        >
          <Icon name="download" icons={icons} />
          {m.download_action({ platform: platformNames[asset!.os] }, opts)}
        </motion.a>
      ) : (
        <motion.button
          type="button"
          className="download-panel__download"
          data-slot="download-action"
          onClick={() => {
            if (!asset) touchedDevice.current = true;
            setExpanded(asset ? "source" : "device");
          }}
          whileTap={{ scale: reducedMotion ? 1 : 0.975, borderRadius: reducedMotion ? 36 : 20 }}
          transition={buttonMotion}
        >
          <Icon name="download" icons={icons} />
          {asset
            ? m.download_source(undefined, opts)
            : selection.os
              ? m.download_choose_arch(undefined, opts)
              : m.download_choose_device(undefined, opts)}
        </motion.button>
      )}

      <button
        ref={deviceTrigger}
        type="button"
        className="download-panel__selector"
        data-slot="device-selector"
        aria-expanded={expanded === "device"}
        aria-controls="download-device-options"
        onClick={() => toggle("device")}
      >
        <span className="download-panel__selector-leading">
          <Icon name="device" icons={icons} />
          <span>
            {m.download_change_device(undefined, opts)}
            <small>
              {selection.os
                ? platformNames[selection.os]
                : m.download_choose_device(undefined, opts)}
              {labels ? ` · ${labels.arch}` : ""}
            </small>
          </span>
        </span>
        <span className="download-panel__chevron">
          <Icon name="chevron" icons={icons} />
        </span>
      </button>
      <Expandable id="download-device-options" open={expanded === "device"}>
        <div
          className="download-panel__systems"
          role="group"
          aria-label={m.download_system(undefined, opts)}
        >
          {(["macos", "windows", "linux"] as const).map((os) => (
            <button
              type="button"
              aria-pressed={selection.os === os}
              key={os}
              onClick={() =>
                updateSelection({ ...selection, os, assetId: undefined, unavailable: false }, true)
              }
            >
              {platformNames[os]}
            </button>
          ))}
        </div>
        <div
          className="download-panel__options"
          role="group"
          aria-label={m.download_packages(undefined, opts)}
        >
          {catalog.assets
            .filter((item) => item.os === selection.os)
            .map((item) => {
              const label = assetLabel(item, locale);
              return (
                <button
                  type="button"
                  className="download-panel__option"
                  key={item.id}
                  aria-pressed={asset?.id === item.id}
                  data-asset-id={item.id}
                  onClick={() => {
                    updateSelection({ ...selection, assetId: item.id, unavailable: false }, true);
                    setExpanded(null);
                    deviceTrigger.current?.focus({ preventScroll: true });
                  }}
                >
                  <span>
                    <strong>{label.arch}</strong>
                    <small>{label.detail}</small>
                  </span>
                  {asset?.id === item.id && <Icon name="check" icons={icons} />}
                </button>
              );
            })}
        </div>
      </Expandable>

      <button
        ref={sourceTrigger}
        type="button"
        className="download-panel__selector"
        data-slot="source-selector"
        aria-expanded={expanded === "source"}
        aria-controls="download-source-options"
        onClick={() => toggle("source")}
      >
        <span className="download-panel__selector-leading">
          <Icon name="source" icons={icons} />
          <span>
            {m.download_source(undefined, opts)}
            <small>
              {source?.label ||
                (selection.source !== "auto"
                  ? catalog.sources.find((item) => item.id === selection.source)?.label
                  : "Nyanpasu")}
              {" · "}
              {selection.source === "auto"
                ? m.download_auto(undefined, opts)
                : m.download_manual(undefined, opts)}
            </small>
          </span>
        </span>
        <span className="download-panel__chevron">
          <Icon name="chevron" icons={icons} />
        </span>
      </button>
      <Expandable id="download-source-options" open={expanded === "source"}>
        <div
          className="download-panel__options"
          role="group"
          aria-label={m.download_source(undefined, opts)}
        >
          <button
            type="button"
            className="download-panel__option"
            aria-pressed={selection.source === "auto"}
            data-source="auto"
            onClick={() => {
              updateSelection({ ...selection, source: "auto", unavailable: false });
              setExpanded(null);
              sourceTrigger.current?.focus({ preventScroll: true });
            }}
          >
            <strong>{m.download_auto(undefined, opts)}</strong>
            {selection.source === "auto" && <Icon name="check" icons={icons} />}
          </button>
          {catalog.sources.map((item) => {
            const available = availableSources.some((candidate) => candidate.id === item.id);
            return (
              <button
                type="button"
                className="download-panel__option"
                key={item.id}
                aria-pressed={selection.source === item.id}
                disabled={!available}
                data-source={item.id}
                onClick={() => {
                  updateSelection({ ...selection, source: item.id, unavailable: false });
                  setExpanded(null);
                  sourceTrigger.current?.focus({ preventScroll: true });
                }}
              >
                <span>
                  <strong>{item.label}</strong>
                  <small>
                    {available
                      ? sourceStatus(item.id)
                      : m.download_source_unavailable(undefined, opts)}
                  </small>
                </span>
                {selection.source === item.id && <Icon name="check" icons={icons} />}
              </button>
            );
          })}
        </div>
        <div className="download-panel__source-actions">
          <button type="button" onClick={() => setProbeRun((run) => run + 1)} disabled={probing}>
            {probing ? m.download_probing(undefined, opts) : m.download_retest(undefined, opts)}
          </button>
          {downloadUrl && (
            <button type="button" onClick={copyLink}>
              {m.download_copy(undefined, opts)}
            </button>
          )}
        </div>
        <p className="download-panel__hint">
          {results.some((item) => item.status === "ready")
            ? m.download_probe_disclaimer(undefined, opts)
            : m.download_probe_fallback(undefined, opts)}
        </p>
      </Expandable>

      {(selection.unavailable || (asset && !selectedSource)) && (
        <p className="download-panel__hint" role="status">
          {m.download_unavailable(undefined, opts)}
        </p>
      )}
      {notice && (
        <p className="download-panel__hint" role="status">
          {notice}
        </p>
      )}
      <nav className="download-panel__links" aria-label={m.download_title(undefined, opts)}>
        <a href={`${base}/tutorial/install/${selection.os ? `#${selection.os}` : ""}`}>
          {m.home_install_guide(undefined, opts)}
        </a>
        <a href={catalog.releaseUrl}>{m.download_notes(undefined, opts)}</a>
        <a href="https://github.com/libnyanpasu/clash-nyanpasu/releases">
          {m.download_other_versions(undefined, opts)}
        </a>
      </nav>
    </div>
  );
}
