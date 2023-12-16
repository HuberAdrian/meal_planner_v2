import { UserProfile } from "@clerk/nextjs";
import BottomNavBar from "~/components/BottomNavBar";
 
const UserProfilePage = () => (
    <>
    <UserProfile path="/user-profile" routing="path" />
    <BottomNavBar activePage="user" />
        </>
);
 
export default UserProfilePage;