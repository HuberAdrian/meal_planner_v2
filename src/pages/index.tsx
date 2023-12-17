import { SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import BottomNavBar from "~/components/BottomNavBar";
import { Error, Loading } from "~/components/loading";
import { api } from "~/utils/api";


type Post = {
  id: string;
  createdAt: Date;
  eventDate: Date;
  eventType: string;
  authorId: string;
  topic: string;
  content: string;
  completed: boolean;
};

type GroupedPosts = Record<string, Post[]>;

type DayProps = {
  date: string;
  posts: Post[];
};



export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const { data, isLoading } = api.post.getAll.useQuery();
  
  const user = useUser();

  if (isLoading) return <Loading />;
  if(!data) return <Error />;

  const groupedPosts = groupPostsByDate(data);

  return (
    <>
      <Head>
        <title>Organisation</title>
        <meta name="description" content="Organisationsapp für Vivien" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col sm:flex-row min-h-screen items-center justify-center bg-primary-400 p-4">
        <div className=" w-full sm:max-w-md mx-auto rounded-xl shadow-md overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2">
            {!user && <SignInButton />}{!!user && <SignOutButton />}
          </div>
          <h2 className="text-4xl text-center py-4">Posts</h2>
          <ul className="px-4 py-2">
            {Object.entries(groupedPosts).map(([date, posts], index) => (
              <Day key={index} date={date} posts={posts} />
            ))}
          </ul>
        </div>
        <BottomNavBar activePage="calendar" />  
      </main>
    </>
  );
}


const Day: React.FC<DayProps> = ({ date, posts }) => {
  if (!posts) {
    return <Loading />;
  }
  // get the date 
  const formattedDate = new Date(date).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });
  const [weekday, dayMonth] = formattedDate.split(', ');

  return (
    <div className="flex flex-col items-center px-4">
      <h2 className="text-2xl font-bold">{`${weekday}, ${dayMonth}`}</h2>
      {posts.map((post, index) => (
        <div key={index} className="flex flex-col sm:flex-row items-center justify-between w-full my-4">
          <div className="text-lg text-primary-100 font-bold mb-2 sm:mb-0">{post.eventType}</div>
          <div className="flex items-center mb-2 sm:mb-0">
            <div className="ml-4">
              <h2 className="text-xl font-bold">{post.topic}</h2>
              <p className="text-sm text-gray-500">{post.content}</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded self-start sm:self-auto">Edit</button>
        </div>
      ))}
      <button className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mt-4">
      +
    </button>
    </div>
  );
};



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
