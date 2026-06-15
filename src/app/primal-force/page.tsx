import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import PrimalClient from "./PrimalClient";
import type { PrimalItem } from "./PrimalClient";

export const metadata: Metadata = {
  title: "MIR4 Primal Force",
};

export default function PrimalForcePage() {
  const raw = fs.readFileSync(
    path.join(process.cwd(), "public/primal/data.json"),
    "utf-8"
  );
  const data = JSON.parse(raw) as PrimalItem[];
  return <PrimalClient data={data} />;
}
