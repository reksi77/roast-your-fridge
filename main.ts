// Roast Your Fridge — one line, one laugh.
//
// Writes a single original roast line (195 characters) to
// /output/entry.txt. The line is data this program writes; the program
// itself is a small deterministic writer with a validation gate that
// mirrors the sealed scorer: UTF-8 text, 1-200 characters, a single
// line, not only whitespace. No randomness, no clock, no network, no
// input — the same bytes on every run.
//
// The line roasts a concrete, recognisable fridge detail — the egg
// tray with twelve little thrones for eggs bought in sixes — in a
// deadpan voice, and the twist pays off in the last few words: the
// fridge was apparently designed by someone who trusts my ambitions
// more than my shopping list ever will.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "My fridge still has an egg tray with twelve little thrones for eggs I buy in sixes, because apparently it was designed by someone who trusts my ambitions far more than my shopping list ever will.";

// The gate, in the same terms the sealed scorer checks it.
function validate(line: string): void {
  const chars = [...line]; // code points, so astral characters count once
  if (chars.length < 1 || chars.length > 200) {
    throw new Error(
      `entry must be 1-200 characters, got ${chars.length}`,
    );
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (line.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (Buffer.from(line, "utf8").toString("utf8") !== line) {
    throw new Error("entry must be valid UTF-8 text");
  }
  if (line !== line.trim()) {
    throw new Error("entry must not have surrounding whitespace");
  }
  // On-topic self-check (judge criterion 1): the line must actually
  // roast a fridge or a phone, not just be any funny sentence.
  if (!/\b(fridge|phone)\b/i.test(line)) {
    throw new Error("entry must roast a fridge or a phone");
  }
}

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUT_FILE = join(OUT_DIR, "entry.txt");

validate(LINE);
mkdirSync(OUT_DIR, { recursive: true });
// No trailing newline: the gate counts characters, and the file must
// hold exactly one line of text and nothing else.
writeFileSync(OUT_FILE, LINE, { encoding: "utf8" });
// Read-back verification: what landed on disk must be byte-identical
// to the validated line, or the run fails loudly instead of shipping
// a file the gate would refuse.
const written = readFileSync(OUT_FILE, { encoding: "utf8" });
if (written !== LINE) {
  throw new Error("read-back mismatch: entry.txt differs from the line");
}
process.stdout.write(
  `Wrote ${OUT_FILE} (${[...LINE].length} characters)\n`,
);
