import type { Metadata } from "next";
import GalleryPreview from "@/src/components/gallery/GalleryPreview";
export const metadata: Metadata = {
  title: "The gallery — AZANIA",
  description: "Explore the first AZANIA 3D room preview.",
};
export default function GalleryPage() {
  return <GalleryPreview />;
}
