import Head from "next/head";
import { type FC, type ReactNode } from "react";
import BottomNavBar, { type NavPage } from "~/components/BottomNavBar";

interface PageShellProps {
  title: string;
  /** Title shown in the header. Defaults to `title`. */
  heading?: ReactNode;
  activePage: NavPage;
  /** Right-hand side of the header (buttons etc.). */
  actions?: ReactNode;
  /** Row rendered under the title inside the sticky header. */
  subheader?: ReactNode;
  children: ReactNode;
}

const PageShell: FC<PageShellProps> = ({ title, heading, activePage, actions, subheader, children }) => (
  <>
    <Head>
      <title>{`${title} · 11uhr11`}</title>
    </Head>
    <main className="page">
      <div className="page-inner">
        <header className="page-header flex-col items-stretch">
          <div className="flex items-center justify-between gap-3">
            <h1 className="page-title">{heading ?? title}</h1>
            {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
          </div>
          {subheader && <div className="mt-3">{subheader}</div>}
        </header>
        {children}
      </div>
    </main>
    <BottomNavBar activePage={activePage} />
  </>
);

export default PageShell;
