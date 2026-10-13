import fs from "node:fs";
import path from "node:path";

// Deterministic, continuous 65-second score. One file avoids browser TTS timing gaps.
const rate = 48000;
const seconds = 65;
const count = rate * seconds;
const output = Buffer.alloc(44 + count * 4);
output.write("RIFF", 0);
output.writeUInt32LE(output.length - 8, 4);
output.write("WAVEfmt ", 8);
output.writeUInt32LE(16, 16);
output.writeUInt16LE(1, 20);
output.writeUInt16LE(2, 22);
output.writeUInt32LE(rate, 24);
output.writeUInt32LE(rate * 4, 28);
output.writeUInt16LE(4, 32);
output.writeUInt16LE(16, 34);
output.write("data", 36);
output.writeUInt32LE(count * 4, 40);

const clamp = (x) => Math.max(0, Math.min(1, x));
const soft = (x) => { const v = clamp(x); return v * v * (3 - 2 * v); };
const beats = [5, 10, 17, 24, 35, 40, 44, 48, 53, 57, 62];
for (let n = 0; n < count; n++) {
  const t = n / rate;
  const master = soft(t / 1.5) * soft((seconds - t) / 1.8);
  const build = .42 + .58 * soft(t / 45);
  const drone = .23 * Math.sin(2 * Math.PI * 55 * t) + .12 * Math.sin(2 * Math.PI * 82.41 * t) + .075 * Math.sin(2 * Math.PI * 110.15 * t);
  const shimmer = .046 * Math.sin(2 * Math.PI * (329.6 * t + 1.2 * Math.sin(t * .18))) * (Math.sin(t * .34) ** 2);
  const heartbeat = Math.exp(-(((t % .94) / .085) ** 2)) * .075 * Math.sin(2 * Math.PI * 93 * t);
  let hits = 0;
  for (const beat of beats) {
    const dt = t - beat;
    if (dt >= 0 && dt < 1.5) hits += Math.exp(-dt * 5.8) * (.18 * Math.sin(2 * Math.PI * (62 - dt * 20) * dt) + .05 * Math.sin(2 * Math.PI * 310 * dt));
  }
  const execute = soft((t - 17) / 5) * soft((53 - t) / 5);
  const rhythm = execute * .038 * Math.sin(2 * Math.PI * 392 * t) * (Math.sin(2 * Math.PI * 2.1 * t) > .78 ? 1 : 0);
  const finalLift = soft((t - 57) / 4) * .065 * Math.sin(2 * Math.PI * 164.8 * t);
  const base = master * (build * drone + shimmer + heartbeat + hits + rhythm + finalLift);
  const left = Math.tanh(base + .02 * Math.sin(2 * Math.PI * 246.9 * t) * Math.sin(t * .31));
  const right = Math.tanh(base + .02 * Math.sin(2 * Math.PI * 247.9 * t) * Math.sin(t * .29 + .7));
  output.writeInt16LE(Math.round(left * 25000), 44 + n * 4);
  output.writeInt16LE(Math.round(right * 25000), 46 + n * 4);
}
const target = path.join(process.cwd(), "public", "showreel", "enterprise-score.wav");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, output);
console.log(`Wrote ${target}`);
