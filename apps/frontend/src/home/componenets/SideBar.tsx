import { useState } from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaUserFriends } from "react-icons/fa";
import { CiCalendar } from "react-icons/ci";
import { IoHomeOutline } from "react-icons/io5";
import { MdKeyboardArrowRight } from "react-icons/md";
import { Link } from "react-router-dom";

type IconProps = { className?: string };

const DashboardIcon = () => (
  <LuLayoutDashboard className="text-xl" />
);

const CrmIcon = () => (
<FaUserFriends className="text-xl" />
);

const CalendarIcon = () => (
  <CiCalendar className="text-xl"/>
);

const PropertiesIcon = () => (
  <IoHomeOutline className="text-xl "></IoHomeOutline>
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
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { name: "CRM", href: "/crm", icon: CrmIcon },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon },
  { name: "Properties", href: "/properties", icon: PropertiesIcon },
];

interface SidebarProps {
  activeHref?: string;
  userName?: string;
  userEmail?: string;
}

export const Sidebar = ({
  activeHref = "/dashboard",
  userName ,
  userEmail ,
}: SidebarProps) => {
  const [current, setCurrent] = useState(activeHref);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="px-6 py-6">
        <h3 className="text-xl font-extrabold text-blue-600">Auto Estate</h3>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setCurrent(item.href)}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon  />
              {item.name}
            </a>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="border-t border-slate-200 p-3">
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
      </div>
    </aside>
  );
};