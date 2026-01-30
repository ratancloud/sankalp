import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
    >
      <Image
        src="/Logo.png"
        width={30}
        height={30}
        alt="Logo"
        className="rounded-md"
      />
      <span className="text-xl font-bold tracking-tight">Sankalp</span>
    </Link>
  );
};
