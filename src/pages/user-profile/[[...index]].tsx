import { UserProfile, SignOutButton } from "@clerk/nextjs";
import BottomNavBar from "~/components/BottomNavBar";
 
const UserProfilePage = () => (
    <>
    <div className="flex flex-col items-center justify-center border border-white bg-primary-400 p-4">
    <SignOutButton >Log out</SignOutButton>
    </div>
    <UserProfile path="/user-profile" routing="path" />
    <BottomNavBar activePage="user" />
    <div className="h-16" />
    </>
);
 
export default UserProfilePage;

