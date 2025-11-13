"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Services", href: "/services", icon: Briefcase },
  { name: "Orders", href: "/dashboard", icon: Package },
  { name: "Profile", href: "/profile", icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  // Hide on admin pages
  useEffect(() => {
    setIsVisible(!pathname.startsWith("/admin"));
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 safe-area-pb">
      <nav className="flex items-center justify-around px-2 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all min-w-[70px]",
                isActive
                  ? "text-primary-600 bg-primary-50"
                  : "text-neutral-600 hover:bg-neutral-50 active:scale-95"
              )}
            >
              <item.icon
                className={cn(
                  "w-6 h-6 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}