"use client";

import Link from "next/link";

export function Navigation() {
  return (
    <div className="flex">
      <Link href="/" className="flex items-center space-x-2">
        <span className="font-bold">LEGO Swerve Drive</span>
      </Link>
    </div>
  );
}
