import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import PotentialClient from "./PotentialClient";
import type { PotentialData } from "./PotentialClient";

export const metadata: Metadata = {
  title: "MIR4 Potential — Skill Tree",
};

export default function PotentialPage() {
  const raw = fs.readFileSync(
    path.join(process.cwd(), "public/potential/data.json"),
    "utf-8"
  );
  const data = JSON.parse(raw) as PotentialData;
  return <PotentialClient data={data} />;
}
