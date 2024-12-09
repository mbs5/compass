"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Education", href: "/education" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">
          Lōkahi Health Compass
        </span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-colors hover:text-foreground/80 ${
              pathname === item.href
                ? "text-foreground"
                : "text-foreground/60"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
} 