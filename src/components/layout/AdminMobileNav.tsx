"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home } from "lucide-react";
import { signOut } from "next-auth/react";

export default function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-600 to-accent-700 rounded-lg flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-display font-bold bg-gradient-to-r from-accent-600 to-accent-700 bg-clip-text text-transparent">
              Hood Admin
            </span>
          </div>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-neutral-100"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-neutral-700" />
          ) : (
            <Menu className="w-6 h-6 text-neutral-700" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-neutral-200 py-4 px-4 space-y-2">
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50"
          >
            Users
          </Link>
          <Link
            href="/admin/services"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50"
          >
            Services
          </Link>
          <Link
            href="/admin/orders"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50"
          >
            Orders
          </Link>
          <Link
            href="/admin/locations"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-50"
          >
            Locations
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-4 py-2 rounded-lg text-red-700 hover:bg-red-50"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}