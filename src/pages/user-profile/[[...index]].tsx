import { SignOutButton, UserProfile, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { FiLogOut } from "react-icons/fi";
import PageShell from "~/components/layout/PageShell";

const UserProfilePage: NextPage = () => {
  const { user } = useUser();

  return (
    <PageShell title="Profil" activePage="user">
      <div className="card mb-4 flex items-center gap-4">
        {user?.imageUrl && <img src={user.imageUrl} alt="" className="h-14 w-14 rounded-full" />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">{user?.fullName ?? user?.username ?? "Angemeldet"}</p>
          <p className="truncate text-sm text-muted">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
        <SignOutButton redirectUrl="/">
          <button className="btn btn-secondary px-3 py-2">
            <FiLogOut /> Abmelden
          </button>
        </SignOutButton>
      </div>
      <UserProfile
        path="/user-profile"
        routing="path"
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none border border-line rounded-2xl",
            navbar: "hidden",
            navbarMobileMenuRow: "hidden",
            scrollBox: "rounded-2xl",
          },
        }}
      />
    </PageShell>
  );
};

export default UserProfilePage;
