import { task } from "@trigger.dev/sdk/v3";
import { exec } from "child_process";
import fs from "fs";

export const frameTask = task({
  id: "extract-frame",
  run: async (payload: {
    videoUrl: string;
    timestamp: number;
  }) => {
    const input = "video.mp4";
    const output = "frame.jpg";

    // download video
    const res = await fetch(payload.videoUrl);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(input, Buffer.from(buffer));

    const command = `ffmpeg -ss ${payload.timestamp} -i ${input} -frames:v 1 ${output}`;

    await new Promise((resolve, reject) => {
      exec(command, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    const file = fs.readFileSync(output);
    const base64 = file.toString("base64");

    return {
      output: `data:image/jpeg;base64,${base64}`,
    };
  },
});