import React from "react";
import { PiggyBank } from "lucide-react";
import Link from "next/link";
function logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <p className="text-3xl font-bold leading-tight tracking-tighter bg-gradient-to-r from-green-400 to-green-900 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 ease-in-out">
        Zaryan
      </p>
    </Link>
  );
}

export function LogoMobile() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <p className="text-3xl font-bold leading-tight tracking-tighter bg-gradient-to-r from-green-400 to-green-900 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 ease-in-out">
        Zaryan
      </p>
    </Link>
  );
}

export default logo;
