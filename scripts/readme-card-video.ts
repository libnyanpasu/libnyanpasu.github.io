import { execFile } from "node:child_process";
import { link, mkdtemp, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";

export const VIDEO_FORMATS = ["webm", "avif"] as const;
export type VideoFormat = (typeof VIDEO_FORMATS)[number];
const exec = promisify(execFile);

const encoders: Record<VideoFormat, string[]> = {
  webm: [
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "0",
    "-crf",
    "20",
    "-deadline",
    "good",
    "-cpu-used",
    "4",
    "-row-mt",
    "1",
    "-threads",
    "4",
  ],
  avif: [
    "-c:v",
    "libsvtav1",
    "-preset",
    "8",
    "-crf",
    "20",
    "-svtav1-params",
    "lp=4",
    "-loop",
    "0",
    "-f",
    "avif",
  ],
};

/** Fail before a lengthy recording if a required encoder is missing. */
export async function checkVideoEncoders(formats: VideoFormat[]) {
  if (!formats.length) return;
  const { stdout } = await exec("ffmpeg", ["-hide_banner", "-encoders"]);
  for (const format of formats) {
    const encoder = encoders[format][1];
    if (!stdout.split("\n").some((line) => line.trim().split(/\s+/)[1] === encoder))
      throw new Error(`FFmpeg encoder ${encoder} is required for ${format}`);
  }
}

/** The same numbered, opaque PNG sequence drives every video format. Hard links also
 * preserve repeated samples without copying frame data or building a huge command line. */
export async function encodeVideos(
  files: string[],
  fps: number,
  outputs: Partial<Record<VideoFormat, string>>,
) {
  if (!Object.keys(outputs).length) return;
  const dir = await mkdtemp(join(dirname(files[0]), "video-"));
  try {
    await Promise.all(
      files.map((file, index) => link(file, join(dir, `${String(index).padStart(6, "0")}.png`))),
    );
    const results = await Promise.allSettled(
      VIDEO_FORMATS.filter((format) => outputs[format]).map((format) =>
        exec(
          "ffmpeg",
          [
            "-hide_banner",
            "-loglevel",
            "error",
            "-nostdin",
            "-y",
            "-framerate",
            String(fps),
            "-i",
            join(dir, "%06d.png"),
            "-an",
            "-pix_fmt",
            "yuv420p",
            ...encoders[format],
            resolve(outputs[format]!),
          ],
          { maxBuffer: 64 * 1024 * 1024 },
        ),
      ),
    );
    const failures = results.filter((result) => result.status === "rejected");
    if (failures.length)
      throw new AggregateError(
        failures.map((result) => result.reason),
        "Video encoding failed",
      );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
