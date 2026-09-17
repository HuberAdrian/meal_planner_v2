import Link from "next/link";
import { type FC } from "react";
import { GiMeal } from "react-icons/gi";
import { BsCalendar2Week, BsBarChartLineFill } from "react-icons/bs";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { FaUser } from "react-icons/fa";

export type NavPage = "meals" | "grocerylist" | "calendar" | "stats" | "user";

interface BottomNavBarProps {
  activePage: NavPage;
}

const items: { page: NavPage; href: string; label: string; Icon: FC<{ className?: string }> }[] = [
  { page: "meals", href: "/deletemeal", label: "Essen", Icon: GiMeal },
  { page: "grocerylist", href: "/grocerylist", label: "Einkauf", Icon: HiOutlineShoppingCart },
  { page: "calendar", href: "/", label: "Kalender", Icon: BsCalendar2Week },
  { page: "stats", href: "/history", label: "Statistik", Icon: BsBarChartLineFill },
  { page: "user", href: "/user-profile", label: "Profil", Icon: FaUser },
];

const BottomNavBar: FC<BottomNavBarProps> = ({ activePage }) => (
  <nav
    className="fixed right-0 bottom-0 left-0 z-20 border-t border-line bg-primary-400/95 backdrop-blur-sm"
    style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
  >
    <div className="mx-auto flex h-16 max-w-md items-stretch justify-around">
      {items.map(({ page, href, label, Icon }) => {
        const active = activePage === page;
        return (
          <Link
            key={page}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors ${
              active ? "text-primary-100" : "text-muted hover:text-white"
            }`}
          >
            <Icon className="text-2xl" />
            <span className={active ? "font-semibold" : ""}>{label}</span>
          </Link>
        );
      })}
    </div>
  </nav>
);

export default BottomNavBar;
