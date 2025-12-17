import Image from "next/image";
import backgroundImage from "@/public/background.jpg";

export function BackgroundImage() {
  return (
    <>
      <Image
        src={backgroundImage}
        alt=""
        fill
        priority
        placeholder="blur"
        quality={85}
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="fixed inset-0 z-0 bg-black/70" />
    </>
  );
}
