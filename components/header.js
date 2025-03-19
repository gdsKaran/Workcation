"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/events" },
  { name: "About", href: "/about" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="absolute inset-x-0 top-0 z-10">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 relative">
            <span className="sr-only">Your Company</span>

            {/* Background Shape */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-14 w-34 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full shadow-lg"></div>{" "}
              {/* Black Circle */}
            </div>

            {/* Logo */}
            <Image
              priority
              width={0}
              height={0}
              sizes="(max-width: 768px) 100vw, 33vw"
              alt="Company Logo"
              src="https://tailwindcss.com/plus-assets/img/logos/workcation-logo-white.svg"
              className="h-3 lg:h-8 w-auto relative z-10"
            />
          </Link>
        </div>

        <div className="flex gap-x-6 lg:gap-x-12">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`relative text-lg font-medium text-gray-900 antialiased transition-all 
              ${
                pathname === item.href
                  ? "text-indigo-600 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[3px] after:w-full after:bg-indigo-600 after:rounded-full after:animate-glow"
                  : "hover:text-indigo-500"
              }`}
            >
              {item.name}
            </a>
          ))}
        </div>

        <div className="flex lg:flex-1 justify-end">
          <a href="#" className="text-sm/6 font-semibold text-gray-900 sr-only">
            Log in <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
