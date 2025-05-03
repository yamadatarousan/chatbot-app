import Image from 'next/image';

export default function Page() {
  return (
    <div>
      <Image src="/icons/globe.svg" alt="Globe" width={180} height={38} priority />
      <Image src="/icons/next.svg" alt="Next.js" width={180} height={38} priority />
      <Image src="/icons/vercel.svg" alt="Vercel" width={180} height={38} priority />
      {/* 他のコンテンツ */}
    </div>
  );
}