import type { Metadata } from "next";
import InnerForceClient from "./InnerForceClient";

export const metadata: Metadata = { title: "MIR4 Inner Force Calculator" };

export default function InnerForcePage() {
  return <InnerForceClient />;
}
