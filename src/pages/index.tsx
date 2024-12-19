import { SignInButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import BottomNavBar from "~/components/BottomNavBar";
import { Error, Loading } from "~/components/loading";
import { api } from "~/utils/api";
import { useState } from "react";
import { FiPlus, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useRouter } from 'next/router';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import toast from "react-hot-toast";
import { GoArrowSwitch } from "react-icons/go";
import { LuRefreshCw } from "react-icons/lu";

type Post = {
  id: string;
  createdAt: Date;
  eventDate: Date;
  eventType: string;
  topic: string;
  content: string;
  deleted: boolean;
};

type MealPopupProps = {
  post: Post;
  onClose: () => void;
};

const MealPopup: React.FC<MealPopupProps> = ({ post, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary-400 rounded-lg p-6 w-11/12 max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300"
        >
          <FiX className="text-2xl" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white pr-8">{post.topic}</h2>
        <div className="text-gray-300 whitespace-pre-wrap">
          {post.content}
        </div>
      </div>
    </div>
  );
};

type GroupedPosts = Record<string, Post[]>;

type DayProps = {
  date: string;
  posts: Post[];
  expandedPostId: string | null;
  setExpandedPostId: (id: string | null) => void;
  selectedMealPost: Post | null;
  setSelectedMealPost: (post: Post | null) => void;
};

const timeOptions: Record<TimeOptionsKeys, string> = {
  "Morgens": "09:00",
  "Mittags": "13:00",
  "Abends": "19:00",
};

type TimeOptionsKeys = "Morgens" | "Mittags" | "Abends";

// ------------------ NOT LOGGED IN ------------------
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

// ------------------ HOME VIEW ------------------

export default function Home() {
  const [dates, setDates] = useState(generateNextTwoWeeks());
  const [view, setView] = useState<'infinite' | 'monthly'>('infinite');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [selectedMealPost, setSelectedMealPost] = useState<Post | null>(null);

  const { data, isLoading, refetch } = api.post.getAllExceptPast.useQuery();
  const { refetch: refetchGroceryList } = api.groceryList.getAllOpen.useQuery();
  const user = useUser();

  const refreshData = () => {
    void refetch();
    void refetchGroceryList();
    toast.success("Data refreshed!");
  };

  // ------------------ INFINITE SCROLL ------------------
  const loadMore = () => {
    if (!dates.every(item => typeof item === 'string')) {
      return;
    }
    const lastDateString = dates[dates.length - 1];
    if (typeof lastDateString !== 'string') {
      return;
    }
    const lastDate = new Date(lastDateString);
    const newDates: string[] = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date(lastDate);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      if (typeof dateString !== 'string') {
        return;
      }
      newDates.push(dateString);
    }
    if (typeof newDates[0] !== 'string') {
      return;
    }
    setDates(prevDates => [...prevDates, ...newDates]);
  };

  const [infiniteRef] = useInfiniteScroll({
    loading: false,
    hasNextPage: true,
    onLoadMore: loadMore,
  });

  if (!user.isSignedIn) return <LandingPage />;
  if (isLoading) return <Loading />;
  if (!data) return <Error />;

  const groupedPosts = groupPostsByDate(data);

  return (
    <>
      <Head>
        <title>Organisation</title>
        <meta name="description" content="11uhr11" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col sm:flex-row min-h-screen items-center bg-primary-400 p-4">
        <div className=" w-full sm:max-w-md mx-auto rounded-xl overflow-y-scroll overflow-x-hidden">
          <div className="sticky top-0 z-10 flex justify-between items-center bg-primary-400 py-4 px-2">
            <h2 className="text-4xl">Kalender</h2>
            <div className="flex items-center">
              <button
                className="p-2 bg-blue-500 text-white rounded mr-2"
                onClick={() => {
                  setView(view === 'infinite' ? 'monthly' : 'infinite');
                  setSelectedDate(null);
                }}
              >
                <GoArrowSwitch className="text-2xl" />
              </button>
              <button
                className="p-2 bg-blue-500 text-white rounded"
                onClick={refreshData}
              >
                <LuRefreshCw className="text-2xl" />
              </button>
            </div>
          </div>
          {view === 'infinite' ? (
            <ul className="px-2 py-2">
              {dates.map((date, index) => (
                <div key={index} >
                  <hr className="border-t border-gray-300 mt-4 mb-2 mx-4" />
                  <Day 
                    date={date} 
                    posts={groupedPosts[date] ?? []}
                    expandedPostId={expandedPostId}
                    setExpandedPostId={setExpandedPostId}
                    selectedMealPost={selectedMealPost}
                    setSelectedMealPost={setSelectedMealPost}
                  />
                </div>
              ))}
            </ul>
          ) : (
            <MonthlyView 
              posts={data} 
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate} 
              groupedPosts={groupedPosts}
              expandedPostId={expandedPostId}
              setExpandedPostId={setExpandedPostId}
              selectedMealPost={selectedMealPost}
              setSelectedMealPost={setSelectedMealPost}
            />
          )}
          {view === 'infinite' && <div ref={infiniteRef}>Laden...</div>}
        </div>
        <div className="h-16" />
        <BottomNavBar activePage="calendar" />
      </main>
      {selectedMealPost && (
        <MealPopup 
          post={selectedMealPost} 
          onClose={() => setSelectedMealPost(null)} 
        />
      )}
    </>
  );
}



// ------------------ DAY COMPONENT ------------------

const Day: React.FC<DayProps> = ({ date, posts, expandedPostId, setExpandedPostId, selectedMealPost, setSelectedMealPost }) => {
  const router = useRouter();

  const formattedDate = new Date(date).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });
  const [weekday, dayMonth] = formattedDate.split(', ');

  const { mutate } = api.post.delete.useMutation({
    onSuccess: () => {
      toast.success("Gelöscht!");
      void router.reload();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Fehler beim Löschen");
      }
    },
  });

  const handleDelete = (id: string) => () => {
    mutate({ id });
  };

  const handlePostClick = (post: Post) => {
    if (post.eventType === "meal") {
      setSelectedMealPost(post);
    } else {
      setExpandedPostId(expandedPostId === post.id ? null : post.id);
    }
  };

  return (
    <div className="flex flex-col items-center animate-fadeIn">
      <div className="w-full bg-gray-800 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white-100">{weekday}</h2>
          <h2 className="text-xl text-gray-300">{dayMonth}</h2>
        </div>

        <div className="space-y-3">
          {posts.map((post, index) => {
            const isExpanded = expandedPostId === post.id;
            let formattedTime = post.eventDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

            if (post.eventType === "meal") {
              formattedTime = Object.entries(timeOptions).find(([_, time]) => time === formattedTime)?.[0] ?? formattedTime;
            }

            const isSpecialEvent = post.topic === "9e4io1e" || post.topic === "Potentiell 9e4io1e";

            return (
              <div 
                key={post.id}
                className={`relative group transition-all duration-200 ${
                  index !== 0 ? 'mt-3' : ''
                }`}
              >
                <div 
                  className={`flex items-start rounded-lg p-4 cursor-pointer transition-all duration-200 hover:translate-x-1 ${
                    isSpecialEvent
                      ? 'bg-red-900/30 hover:bg-red-900/40'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => handlePostClick(post)}
                >
                  <div className="flex flex-col items-center mr-4 min-w-[60px]">
                    <span className="text-sm text-primary-100 font-medium">{formattedTime}</span>
                    <img 
                      src={post.eventType === "meal" ? "/meal_default.png" : "/event_default.png"} 
                      alt="Icon"
                      className="w-8 h-8 mt-2 rounded"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold mb-1 ${isSpecialEvent ? 'text-red-400' : 'text-white'}`}>
                      {post.topic}
                    </h3>
                    {(!post.eventType || post.eventType !== "meal") && (
                      <p className={`text-sm text-gray-400 transition-all duration-200 ${
                        isExpanded ? 'line-clamp-none' : 'line-clamp-2'
                      }`}>
                        {post.content}
                      </p>
                    )}
                  </div>

                  <button 
                    className="ml-3 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.id)();
                    }}
                  >
                    <FiX className="text-gray-400 hover:text-red-400 transition-colors duration-200" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="mt-4 w-full p-3 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-primary-100 transition-all duration-200 flex items-center justify-center gap-2"
          onClick={() => { void router.push(`/addevent/${date}`); }}
        >
          <FiPlus className="text-lg" />
          <span>Neuer Eintrag</span>
        </button>
      </div>
    </div>
  );
};


// ---------------------------- Monthly View ----------------------------

const MonthlyView: React.FC<{ 
  posts: Post[], 
  selectedDate: string | null, 
  setSelectedDate: (date: string | null) => void, 
  groupedPosts: GroupedPosts, 
  expandedPostId: string | null, 
  setExpandedPostId: (id: string | null) => void,
  selectedMealPost: Post | null,
  setSelectedMealPost: (post: Post | null) => void
}> = ({ 
  posts, 
  selectedDate, 
  setSelectedDate, 
  groupedPosts, 
  expandedPostId, 
  setExpandedPostId,
  selectedMealPost,
  setSelectedMealPost
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Adjust to start from Monday

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  return (
    <div className="rounded-none">
      <div className="flex justify-between items-center mb-4 rounded-none">
        <FiChevronLeft onClick={handlePrevMonth} className="cursor-pointer" />
        <span className="text-xl font-bold">{new Date(currentYear, currentMonth).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</span>
        <FiChevronRight onClick={handleNextMonth} className="cursor-pointer" />
      </div>
      <div className="grid grid-cols-7 rounded-none gap-2">
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
          <div key={day} className="text-center font-bold">{day}</div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={i}></div>
        ))}
        {daysArray.map((day) => {
          const date = new Date(currentYear, currentMonth, day + 1).toISOString().split('T')[0];
          if (date === undefined) return null;
          const postsForDay = groupedPosts[date] ?? [];

          const isSelected = selectedDate === date;

          return (
            <div 
              key={day} 
              className={`border p-2 cursor-pointer ${isSelected ? 'bg-primary-100 text-white' : ''}`}
              onClick={() => setSelectedDate(isSelected ? null : date)}
            >
              <div className={`text-center font-bold ${isSelected ? 'text-white' : ''}`}>{day}</div>
              {postsForDay.length > 0 && (
                <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${postsForDay.some(post => post.topic === '9e4io1e') ? 'bg-red-500' : 'bg-white'}`}></div>
              )}
            </div>
          );
        })}
      </div>
      {selectedDate && (
        <div className="mt-4">
          <Day 
            date={selectedDate} 
            posts={groupedPosts[selectedDate] ?? []} 
            expandedPostId={expandedPostId}
            setExpandedPostId={setExpandedPostId}
            selectedMealPost={selectedMealPost}
            setSelectedMealPost={setSelectedMealPost}
          />
        </div>
      )}
    </div>
  );
};


// ----------------- SUPPORT FUNCTIONS -----------------

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
  const dates: string[] = [];
  for (let i = 0; i <= 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    if (typeof dateString == 'string') {
      dates.push(dateString);
    }
  }
  return dates;
}