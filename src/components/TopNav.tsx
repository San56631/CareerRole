"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isDashboard = pathname === "/dashboard";

  // close dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function goBack() {
    // If the user opened this page directly (no history), fall back to dashboard
    if (window.history.length > 1) router.back();
    else router.push("/dashboard");
  }

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="border-b border-line bg-gold">
      <div className="container-x flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          {!isDashboard && (
            <button
              onClick={goBack}
              className="text-sm font-semibold text-bg hover:text-maroon transition-colors"
              aria-label="Go back"
            >
              ← Back
            </button>
          )}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="CareerRole logo" width={48} height={48} />
            <span className="font-display text-3xl font-bold text-textPrimary">
              CareerRole
            </span>
          </Link>
        </div>

        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-card px-2 py-1 hover:bg-goldDeep transition-colors"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="w-8 h-8 rounded-full bg-bg text-gold flex items-center justify-center text-sm font-semibold">
                  {initial}
                </span>
              )}
              <span className="hidden sm:block text-sm font-semibold text-bg">
                {user.name}
              </span>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 border border-line rounded-card bg-surface shadow-lg z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-line">
                  <p className="text-sm text-textPrimary font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-textSecondary truncate">{user.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-textPrimary hover:bg-bg"
                  role="menuitem"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-textPrimary hover:bg-bg"
                  role="menuitem"
                >
                  My profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-textPrimary hover:bg-bg border-t border-line"
                  role="menuitem"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
