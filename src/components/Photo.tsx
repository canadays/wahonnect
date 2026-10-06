import Image from "next/image";
import { showGuides } from "@/lib/photos";

/* 写真があれば表示。無ければ本番では何も出さず、開発中だけ「ここに置く」案内を出す。 */
export function Photo({
  src,
  alt,
  className = "",
  sizes = "(min-width: 768px) 50vw, 100vw",
  guide,
  priority,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  guide?: string;
  priority?: boolean;
}) {
  if (!src) {
    if (!showGuides || !guide) return null;
    return (
      <div className={`flex items-center justify-center rounded-3xl border-2 border-dashed border-rule p-6 text-center text-sm text-sub ${className}`}>
        {guide}
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-mist ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
