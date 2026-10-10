import { motion } from "motion/react";
import { PreviewIcon } from "./icon";
import { getFrameSeries, Sparkline } from "./sparkline";
import type { PreviewIcons } from "./types";

export type MetricPreviewData = {
  id: string;
  icon: string;
  label?: string;
  labelKey?: "download" | "upload" | "memory" | "activeConnections";
  value: string;
  valueFormat?: "bytes-per-second" | "mebibytes" | "integer";
  total?: string;
  series?: number[];
};

const formatMetricValue = (metric: MetricPreviewData, value: number) => {
  if (metric.valueFormat === "bytes-per-second") {
    return value >= 1024 * 1024
      ? `${(value / (1024 * 1024)).toFixed(2)} MiB/s`
      : `${(value / 1024).toFixed(2)} KiB/s`;
  }
  if (metric.valueFormat === "mebibytes") {
    return `${(value / (1024 * 1024)).toFixed(2)} MiB`;
  }
  if (metric.valueFormat === "integer") return `${Math.round(value)}`;
  return metric.value;
};

const kib = (values: number[]) => values.map((value) => value * 1024);
const mib = (values: number[]) => values.map((value) => value * 1024 * 1024);

export const DEMO_METRICS: MetricPreviewData[] = [
  {
    id: "download",
    icon: "arrow-down",
    labelKey: "download",
    value: "0 B/s",
    valueFormat: "bytes-per-second",
    total: "29.14 MiB",
    series: kib([12, 30, 18, 95, 22, 14, 60, 18, 240, 36, 20, 310]),
  },
  {
    id: "upload",
    icon: "arrow-up",
    labelKey: "upload",
    value: "0 B/s",
    valueFormat: "bytes-per-second",
    total: "3.95 MiB",
    series: kib([4, 10, 6, 28, 8, 5, 18, 6, 70, 10, 7, 96]),
  },
  {
    id: "memory",
    icon: "cpu",
    labelKey: "memory",
    value: "73.05 MiB",
    valueFormat: "mebibytes",
    series: mib([71.2, 71.8, 72.4, 72.1, 72.9, 73.2, 72.8, 73.05]),
  },
  {
    id: "connections",
    icon: "unplug",
    labelKey: "activeConnections",
    value: "27",
    valueFormat: "integer",
    series: [24, 26, 25, 27, 26, 28, 27, 27],
  },
];

export function MetricCard({
  metric,
  index,
  frame,
  icons,
  reduceMotion,
  totalLabel,
  labels,
}: {
  metric: MetricPreviewData;
  index: number;
  frame: number;
  icons: PreviewIcons;
  reduceMotion: boolean;
  totalLabel: string;
  labels: Record<string, string>;
}) {
  const label = metric.labelKey ? labels[metric.labelKey] : metric.label;
  const latest = metric.series && getFrameSeries(metric.series, frame).at(-1);
  const value =
    metric.valueFormat && latest !== undefined ? formatMetricValue(metric, latest) : metric.value;
  return (
    <motion.article
      className="cp-card cp-metric-card"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, delay: index * 0.035 }}
    >
      <Sparkline series={metric.series ?? []} frame={frame} paused={reduceMotion} />
      <div className="cp-metric-heading">
        <PreviewIcon icons={icons} name={metric.icon} />
        <span>{label}</span>
      </div>
      <strong className="cp-metric-value">{value}</strong>
      <span className="cp-metric-total" aria-hidden={metric.total ? undefined : true}>
        {metric.total ? `${totalLabel}: ${metric.total}` : ""}
      </span>
    </motion.article>
  );
}
