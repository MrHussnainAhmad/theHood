"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/services", icon: Briefcase },
    {
      name: "Orders",
      href: session?.user.role === "PROVIDER" ? "/provider/orders" : "/dashboard",
      icon: Package,
    },
    { name: "Profile", href: "/profile", icon: User },
  ];

  if (pathname.startsWith("/admin")) return null;

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
