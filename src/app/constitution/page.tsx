import type { Metadata } from "next";
import ConstitutionClient from "./ConstitutionClient";

export const metadata: Metadata = { title: "MIR4 Constitution Calculator" };

export default function ConstitutionPage() {
  return <ConstitutionClient />;
}
