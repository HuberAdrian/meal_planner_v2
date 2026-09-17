import Link from "next/link";
import { type FC } from "react";

const MealsSubnav: FC<{ active: "list" | "new" }> = ({ active }) => (
  <div className="segmented">
    <Link href="/deletemeal" className={active === "list" ? "active" : ""}>
      Alle Rezepte
    </Link>
    <Link href="/addmeal" className={active === "new" ? "active" : ""}>
      Neues Rezept
    </Link>
  </div>
);

export default MealsSubnav;
