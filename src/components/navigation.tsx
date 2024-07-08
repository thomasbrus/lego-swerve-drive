"use client";

import Link from "next/link";

export function Navigation() {
  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-4 flex items-center space-x-2 lg:mr-6">
        <span className="hidden font-bold lg:inline-block">LEGO Swerve Drive</span>
      </Link>
    </div>
  );
}
