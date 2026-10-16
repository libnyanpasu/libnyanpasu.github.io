import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import sharp from "sharp";
import { checkVideoEncoders, encodeVideos, VIDEO_FORMATS } from "./readme-card-video.ts";

test("WebM and animated AVIF retain every sampled frame at 60 fps", async () => {
  await checkVideoEncoders([...VIDEO_FORMATS]);
  const dir = await mkdtemp(join(tmpdir(), "readme-video-test-"));
  try {
    const files = await Promise.all(
      ["#ff0000", "#00ff00", "#0000ff"].map(async (background, index) => {
        const file = join(dir, `${index}.png`);
        await sharp({ create: { width: 66, height: 66, channels: 3, background } })
          .png()
          .toFile(file);
        return file;
      }),
    );
    // Include repeated samples, as a recording can legitimately hold the same source frame.
    const sequence = [files[0], files[0], files[1], files[1], files[2], files[2]];
    const outputs = { webm: join(dir, "sample.webm"), avif: join(dir, "sample.avif") };
    await encodeVideos(sequence, 60, outputs);
    for (const file of Object.values(outputs)) {
      const { stdout } = await promisify(execFile)("ffprobe", [
        "-v",
        "error",
        "-count_frames",
        "-show_streams",
        "-of",
        "json",
        file,
      ]);
      const { streams } = JSON.parse(stdout) as {
        streams: { width: number; height: number; r_frame_rate: string; nb_read_frames: string }[];
      };
      // AVIF also contains a single-frame primary image; verify its animation track.
      const animation = streams.find((stream) => stream.r_frame_rate === "60/1");
      assert.ok(animation, `Missing 60 fps animation in ${file}`);
      assert.equal(Number(animation.nb_read_frames), sequence.length);
      assert.equal(animation.width, 66);
      assert.equal(animation.height, 66);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
