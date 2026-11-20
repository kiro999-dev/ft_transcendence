import { useState, useEffect } from "react";
import { FaUserFriends } from "react-icons/fa";
import { CiCalendar, CiClock2 } from "react-icons/ci";
import { IoHomeOutline } from "react-icons/io5";
import { MdKeyboardArrowRight } from "react-icons/md";
import { HiOutlineLogout } from "react-icons/hi";
import { PanelLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { TiGroup } from "react-icons/ti";

type IconProps = { className?: string };

const CrmIcon = () => (
  <FaUserFriends className="text-xl" />
);

const CalendarIcon = () => (
  <CiCalendar className="text-xl"/>
);

const AvailabilityIcon = () => (
  <CiClock2 className="text-xl" />
);

const PropertiesIcon = () => (
  <IoHomeOutline className="text-xl "></IoHomeOutline>
);
const OrganizationIcon = () => (
  <TiGroup className="text-xl "></TiGroup>
);

const ChevronIcon = ({ className = "" }: IconProps) => (
 <MdKeyboardArrowRight  className={className}></MdKeyboardArrowRight>
);

type NavItem = {
  name: string;
  href: string;
  icon: () => React.JSX.Element;
};

const navItems: NavItem[] = [
  { name: "CRM dashboard", href: "/crm-dashboard", icon: CrmIcon },
  { name: "Booking", href: "/booking", icon: CalendarIcon },
  { name: "Availability", href: "/availability", icon: AvailabilityIcon },
  { name: "Properties", href: "/properties", icon: PropertiesIcon },
  {name:"Organization",href:"/organization",icon:OrganizationIcon}
];

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export const Sidebar = ({ userName, userEmail }: SidebarProps) => {
  const location = useLocation();
  const { logout } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Floating button when sidebar is collapsed (ChatGPT style) */}
      {isCollapsed && (
        <button
          type="button"
          onClick={toggleSidebar}
          title="Toggle sidebar (Ctrl+Shift+S)"
          className="fixed top-3.5 left-3.5 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/90 bg-white/95 text-slate-600 shadow-sm backdrop-blur-xs transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95"
        >
          <PanelLeft size={18} />
        </button>
      )}

      {/* Main sidebar */}
      <aside
        className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out ${
          isCollapsed
            ? "w-0 -translate-x-full opacity-0 pointer-events-none border-r-0 overflow-hidden"
            : "w-64 opacity-100"
        }`}
      >
        {/* Brand + Toggle button (ChatGPT style) */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
          <h3 className="text-xl font-extrabold text-blue-600 tracking-tight">Auto Estate</h3>
          <button
            type="button"
            onClick={toggleSidebar}
            title="Toggle sidebar (Ctrl+Shift+S)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95"
          >
            <PanelLeft size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile + logout */}
        <div className="mt-auto shrink-0 border-t border-slate-200 p-3">
          <Link
            to="/me"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
              {userName
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {userName}
              </p>
              <p className="truncate text-xs text-slate-500">{userEmail}</p>
            </div>

            <ChevronIcon className="h-4 w-4 shrink-0 text-slate-400" />
          </Link>

          <button
            onClick={logout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <HiOutlineLogout className="text-xl" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};