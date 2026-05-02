import { task } from "@trigger.dev/sdk/v3";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export const cropTask = task({
  id: "crop-image",
  run: async (payload: {
    imageUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    const input = "input.jpg";
    const output = "output.jpg";

    // download image
    const res = await fetch(payload.imageUrl);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(input, Buffer.from(buffer));

    // FFmpeg crop
    const command = `ffmpeg -i ${input} -vf "crop=${payload.width}:${payload.height}:${payload.x}:${payload.y}" ${output}`;

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