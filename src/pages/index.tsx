import { SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import BottomNavBar from "~/components/BottomNavBar";
import { Error, Loading } from "~/components/loading";
import { api } from "~/utils/api";
import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { useRouter } from 'next/router';


type Post = {
  id: string;
  createdAt: Date;
  eventDate: Date;
  eventType: string;
  topic: string;
  content: string;
  deleted: boolean;
};

type GroupedPosts = Record<string, Post[]>;

type DayProps = {
  date: string;
  posts: Post[];
};

// landing page if user is not signed in
const LandingPage: React.FC = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = ["/Vivien.png", "/Adrian.png", "/Benni.png"];

  const handleClick = () => {
    setCurrentImage((currentImage + 1) % images.length);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary-400 p-4">
      <h1 className="text-4xl mb-4">geh weg</h1>
      <img 
        src={images[currentImage]} 
        alt="Welcome" 
        onClick={handleClick} 
        className="object-cover w-auto h-auto max-w-[350px] max-h-[350px]"
      />
      <SignInButton>Login</SignInButton>
    </div>
  );
};




export default function Home() {
  
  const user = useUser();
  if (!user.isSignedIn) return <LandingPage />;

  const { data, isLoading } = api.post.getAll.useQuery();

  if (isLoading) return <Loading />;
  if(!data) return <Error />;

  const groupedPosts = groupPostsByDate(data);

  const nextTwoWeeks = generateNextTwoWeeks();


  return (
    <>
      <Head>
        <title>Organisation</title>
        <meta name="description" content="Organisationsapp für Vivien" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col sm:flex-row min-h-screen items-center bg-primary-400 p-4">
        <div className=" w-full sm:max-w-md mx-auto rounded-xl overflow-y-scroll overflow-x-hidden">
          <h2 className="text-4xl text-center py-4 sticky top-0 z-10">Kalender</h2>
          <ul className="px-4 py-2">
            {nextTwoWeeks.map((date, index) => (
              <Day key={index} date={date} posts={groupedPosts[date] || []} />
            ))}
          </ul>
        </div>
        <BottomNavBar activePage="calendar" />  
      </main>
    </>
  );
}



const Day: React.FC<DayProps> = ({ date, posts }) => {
  const router = useRouter();
  // get the date 
  const formattedDate = new Date(date).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });
  const [weekday, dayMonth] = formattedDate.split(', ');

  return (
    <div className="flex flex-col items-center px-4">
      <h2 className="text-2xl font-bold self-start">{`${weekday}, ${dayMonth}`}</h2>
      {posts.map((post, index) => (
        <div key={index} className="flex items-start rounded-lg justify-between w-full my-1 border p-3">
          <div className="text-lg text-primary-100 font-bold self-center transform -rotate-90 flex-shrink-0 mr-2">{post.eventType}</div>
          <img src={post.eventType === "meal"? "/meal_default.png" : "/event_default.png"} alt="Post" className="w-12 h-12 bg-white flex-shrink-0 mr-5" />
          <div className="flex flex-col flex-grow">
            <h2 className="text-xl font-bold">{post.topic}</h2>
            <p className="text-sm text-gray-500">{post.content}</p>
          </div>
          <button className="pl-4 pr-0 py-2 text-white rounded self-start sm:self-auto flex-shrink-0">
            <FiX className="text-2xl"/>
          </button>
        </div>
      ))}
      <button 
        className="w-10 h-10 border text-white flex rounded-full items-center justify-center mt-4"
        onClick={() => { void( async () => {await router.push(`/addevent/${date}`)})();}}
      >
        <FiPlus className="items-center justify-center" />
      </button>
    </div>
  );
}



// This function groups posts by their eventDate, and returns an object where each key is a date and the value is an array of posts for that date
function groupPostsByDate(posts: Post[]): GroupedPosts {
return posts.reduce((groupedPosts: GroupedPosts, post) => {
  const date = post.eventDate.toISOString().split('T')[0];
  if (date === undefined) {
    return groupedPosts;
  }
  if (!groupedPosts[date]) {
    groupedPosts[date] = [];
  }
  groupedPosts[date]?.push(post);
  return groupedPosts;
}, {} as GroupedPosts);
}

function generateNextTwoWeeks(): string[] {
  let dates: string[] = [];
  for(let i = 0; i <= 14; i++) {
    let date = new Date();
    date.setDate(date.getDate() + i);
    let dateString = date.toISOString().split('T')[0];
    // check if dateString is of type string
    if (typeof dateString == 'string') {
    dates.push(dateString);
    }
  }
  return dates;
}