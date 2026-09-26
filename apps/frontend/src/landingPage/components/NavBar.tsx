import { useEffect, useRef, useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
];

/* ------------------------------------------------------------------ */
/* Small reusable pieces                                               */
/* ------------------------------------------------------------------ */

interface NavLinkProps {
  href: string;
  label: string;
  onClick?: () => void;
  className?: string;
}

const NavLink = ({ href, label, onClick, className = "" }: NavLinkProps) => (
  <a
    href={href}
    onClick={onClick}
    className={`text-sm font-semibold text-slate-600 transition-colors hover:text-(--color-primary) ${className}`}
  >
    {label}
  </a>
);

const PrimaryButton = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    className={`rounded-lg bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-(--color-primary-hover) ${className}`}
  >
    {children}
  </button>
);

const GhostButton = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    className={`text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900 ${className}`}
  >
    {children}
  </button>
);

const UserAvatar = ({ name = "" }: { name?: string }) => {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-primary-light) text-sm font-semibold text-(--color-primary)">
      {initials}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Auth-aware actions: guest sees Log in / Get started,                 */
/* signed-in users see an avatar with a dropdown                       */
/* ------------------------------------------------------------------ */

interface GuestActionsProps {
  layout: "desktop" | "mobile";
  onNavigate?: () => void;
}

const GuestActions = ({ layout, onNavigate }: GuestActionsProps) => {
  const isMobile = layout === "mobile";

  return (
    <>
      <Link to="/login" onClick={onNavigate}>
        <GhostButton className={isMobile ? "text-left text-slate-700" : ""}>
          Log In
        </GhostButton>
      </Link>

      <Link to="/sign-up" onClick={onNavigate}>
        <PrimaryButton className={isMobile ? "py-3" : ""}>
          Get Started
        </PrimaryButton>
      </Link>
    </>
  );
};

interface UserMenuProps {
  userName: string;
}

const UserMenu = ({ userName }: UserMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const {logout} = useAuth()
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open account menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
      >
        <UserAvatar name={userName} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg">
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Dashboard
          </Link>
          <Link
            to="/me"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Profile
          </Link>
          <div className="my-1 h-px bg-slate-100" />
          <button
            onClick={() => {
              setOpen(false);
              logout()
            }}
            className="block w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* NavBar                                                               */
/* ------------------------------------------------------------------ */

export const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user,logout } = useAuth();
  const closeMobileMenu = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
        {/* Logo */}
        <h1 className="text-2xl font-extrabold text-(--color-primary)">
          Auto Estate
        </h1>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <UserMenu userName={user?.first_name ?? ""}/>
          ) : (
            <GuestActions layout="desktop" />
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <RxCross2 className="text-blue-600" />
          ) : (
            <CiMenuBurger className="text-blue-600" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-slate-200 px-6 py-5 md:hidden">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} onClick={closeMobileMenu} />
            ))}

            <div className="h-px bg-slate-200" />

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                >
                  Dashboard
                </Link>
                <Link
                  to="/me"
                  onClick={closeMobileMenu}
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    logout()
                  }}
                  className="text-left text-sm font-semibold text-red-600"
                >
                  Log out
                </button>
              </>
            ) : (
              <GuestActions layout="mobile" onNavigate={closeMobileMenu} />
            )}
          </div>
        </div>
      )}
    </nav>
  );
};