"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  KeyRound,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { useApiKey } from "@/lib/api-key-context";
import { authClient } from "@/lib/auth/client";
import { useLanguage } from "@/lib/i18n/context";
import { LanguageToggle } from "@/components/language-toggle";
import { SettingsDialog } from "./settings-dialog";
import { ThemeToggle } from "./theme-toggle";

const SIDEBAR_STORAGE_KEY = "niseth_sidebar_collapsed";

const subscribeSidebar = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("niseth_sidebar_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("niseth_sidebar_change", callback);
  };
};

function getSidebarSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getServerSidebarSnapshot(): boolean {
  return false;
}

type DashboardSidebarProps = {
  user: {
    name: string | null;
    email: string;
  };
};

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasKey } = useApiKey();
  const { t, isKhmer } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isCollapsed = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getServerSidebarSnapshot
  );

  const displayName = user.name?.trim() || user.email.split("@")[0] || "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  const handleToggleCollapse = () => {
    try {
      const next = !getSidebarSnapshot();
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      window.dispatchEvent(new Event("niseth_sidebar_change"));
    } catch {
      // Ignore localStorage errors
    }
  };

  // Keyboard shortcuts: ⌘, opens settings; ⌘B toggles sidebar
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === ",") {
        event.preventDefault();
        setSettingsOpen(true);
      } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        handleToggleCollapse();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    {
      label: t.nav.dashboard,
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
      badge: null,
    },
    {
      label: t.nav.templates,
      href: "/dashboard/templates",
      icon: LayoutTemplate,
      active: pathname.startsWith("/dashboard/templates"),
      badge: t.dashboard.templatesCountBadge,
    },
    {
      label: t.nav.apiGuide,
      href: "/dashboard/api",
      icon: KeyRound,
      active: pathname.startsWith("/dashboard/api"),
      badge: hasKey ? t.dashboard.connectedBadge : t.dashboard.setupBadge,
      badgeColor: hasKey
        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 dark:border dark:border-emerald-800/60"
        : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 dark:border dark:border-amber-800/60",
    },
  ];

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden flex h-16 w-full items-center justify-between border-b border-hairline bg-card/95 px-4 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="grid size-9 place-items-center rounded-lg border border-hairline bg-card text-muted-foreground hover:text-foreground active:scale-95 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Wordmark />
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle compact />
          <ThemeToggle compact />
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="grid size-9 place-items-center rounded-lg border border-hairline bg-card text-muted-foreground hover:text-foreground cursor-pointer"
            title={t.nav.settings}
          >
            <Settings className="size-4.5" />
          </button>
          <div className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold font-display">
            {userInitial}
          </div>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Persistent Desktop Sidebar & Sliding Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-hairline bg-card transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 overflow-x-hidden ${
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-16" : "lg:w-64"}`}
      >
        {/* Brand Header */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-hairline transition-all ${
            isCollapsed ? "justify-center px-2" : "justify-between px-5"
          }`}
        >
          {isCollapsed ? (
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="hidden lg:grid size-9 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
              title={isKhmer ? "ពង្រីករបារចំហៀង (Ctrl+B)" : "Expand sidebar (Ctrl+B)"}
              aria-label="Expand sidebar"
            >
              <PanelLeft className="size-5 text-primary" />
            </button>
          ) : (
            <>
              <Wordmark />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleToggleCollapse}
                  className="hidden lg:grid size-8 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                  title={isKhmer ? "បង្រួមរបារចំហៀង (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="size-4.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="lg:hidden text-muted-foreground hover:text-foreground cursor-pointer p-1"
                >
                  <X className="size-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation Section */}
        <div className={`flex-1 overflow-y-auto space-y-6 ${isCollapsed ? "px-2 py-5" : "px-3 py-6"}`}>
          {isCollapsed ? (
            /* Collapsed Icon Navigation */
            <nav className="flex flex-col items-center space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={item.label}
                    className={`relative grid size-10 place-items-center rounded-xl transition-all cursor-pointer ${
                      item.active
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-5" />
                    {item.badge && (
                      <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#dda15e] ring-2 ring-card" />
                    )}
                  </Link>
                );
              })}

              <div className="my-2 h-px w-8 bg-hairline" />

              {/* Collapsed AI Status Icon */}
              <Link
                href="/dashboard/api"
                onClick={() => setMobileOpen(false)}
                title={`${t.sidebar.aiEngine}: ${hasKey ? "Connected" : "Free Mode"}`}
                className="relative grid size-10 place-items-center rounded-xl border border-hairline bg-stone-50/70 dark:bg-muted/30 text-primary hover:bg-muted/70 transition-all cursor-pointer"
              >
                <Sparkles className="size-4 text-[#dda15e]" />
                <span
                  className={`absolute top-1.5 right-1.5 size-2 rounded-full ${
                    hasKey ? "bg-emerald-500 ring-2 ring-card" : "bg-amber-400 ring-2 ring-card"
                  }`}
                />
              </Link>
            </nav>
          ) : (
            /* Expanded Full Navigation */
            <>
              <div>
                <p className="px-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  {t.sidebar.mainMenu}
                </p>
                <nav className="mt-2 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                          item.active
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`size-4.5 transition-colors ${
                              item.active
                                ? "text-primary-foreground"
                                : "text-muted-foreground group-hover:text-foreground"
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              item.active
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : item.badgeColor || "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* AI Status Card */}
              <div className="rounded-xl border border-hairline bg-stone-50/70 dark:bg-muted/30 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" />
                    {t.sidebar.aiEngine}
                  </span>
                  <span
                    className={`size-2 rounded-full ${
                      hasKey ? "bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-800" : "bg-amber-400"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  {hasKey ? t.sidebar.aiConnected : t.sidebar.aiFreeMode}
                </p>
                <Link
                  href="/dashboard/api"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex text-[11px] font-semibold text-primary hover:underline"
                >
                  {hasKey ? t.sidebar.manageConnection : t.sidebar.connectKey}
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Bottom Section */}
        {isCollapsed ? (
          /* Collapsed Bottom Controls */
          <div className="flex flex-col items-center gap-2 border-t border-hairline p-2 bg-stone-50/40 dark:bg-muted/20">
            <LanguageToggle compact />
            <ThemeToggle compact />
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title={t.nav.settings}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Settings className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title={displayName}
              className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold font-display cursor-pointer"
            >
              {userInitial}
            </button>
            <button
              type="button"
              onClick={async () => {
                await authClient.signOut();
                router.push("/");
              }}
              title={t.nav.signOut}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          /* Expanded Bottom Controls */
          <div className="border-t border-hairline p-3 space-y-2 bg-stone-50/40 dark:bg-muted/20">
            <div className="flex items-center justify-between px-1 pb-1">
              <LanguageToggle compact />
              <ThemeToggle compact />
            </div>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Settings className="size-4.5" />
                <span>{t.nav.settings}</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground border border-hairline bg-card px-1.5 py-0.5 rounded">
                ⌘,
              </span>
            </button>

            <div className="flex items-center justify-between rounded-xl bg-card p-2.5 border border-hairline">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold font-display">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await authClient.signOut();
                  router.push("/");
                }}
                title={t.nav.signOut}
                className="text-muted-foreground hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Settings Modal */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={user}
      />
    </>
  );
}

export function DashboardSidebarSkeleton() {
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-hairline bg-card h-screen sticky top-0 animate-pulse p-4 justify-between">
      <div className="space-y-6">
        <div className="h-8 w-32 bg-hairline/60 rounded-md" />
        <div className="space-y-2">
          <div className="h-9 w-full bg-hairline/40 rounded-xl" />
          <div className="h-9 w-full bg-hairline/40 rounded-xl" />
          <div className="h-9 w-full bg-hairline/40 rounded-xl" />
        </div>
      </div>
      <div className="h-12 w-full bg-hairline/40 rounded-xl" />
    </aside>
  );
}
