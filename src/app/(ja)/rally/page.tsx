import type { Metadata } from "next";
import RallyLoader from "./RallyLoader";

export const metadata: Metadata = {
  title: "Photo Rally | WAHONNECT",
  description: "WAHONNECTのフォトラリー。チーム名を入れて、ミッションごとに写真を撮って集めよう。",
  robots: { index: false, follow: false },
};

export default function RallyPage() {
  return <RallyLoader />;
}
