import { SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import { Error, Loading } from "~/components/loading";


import { api } from "~/utils/api";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const { data, isLoading } = api.post.getAll.useQuery();
  
  const user = useUser();

  if (isLoading) return <Loading />;
  if(!data) return <Error />;

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
            {data?.map((post) => (
              <li className="text-[#fff] mb-2" key={post.id}>
                  {post.content}
              </li>
            ))}
          </ul>
          <h1 className="text-4xl text-center py-4">Day Component</h1>
          <Day />
        </div>
      </main>
    </>
  );
}


const Day = (/*{ meals }*/) => {
  const meals = [
    {
      time: "Morgens",
      name: "Breakfast",
      image: "https://images.unsplash.com/photo-1581091019743-7aaffed1b6d6?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnJlYWtmYXN0fGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80",
      ingredients: "2 eggs, 2 slices of bread, 1 cup of milk",
    },
    {
      time: "Mittags",
      name: "Lunch",
      image: "https://images.unsplash.com/photo-1581091019743-7aaffed1b6d6?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnJlYWtmYXN0fGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80",
      ingredients: "2 eggs, 2 slices of bread, 1 cup of milk",
    },
    {
      time: "Abends",
      name: "Dinner",
      image: "https://images.unsplash.com/photo-1581091019743-7aaffed1b6d6?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnJlYWtmYXN0fGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80",
      ingredients: "2 eggs, 2 slices of bread, 1 cup of milk",
    },
  ];
  if (!meals) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center px-4">
      <h2 className="text-2xl font-bold">Monday</h2>
      {meals.map((meal, index) => (
        <div key={index} className="flex flex-col sm:flex-row items-center justify-between w-full my-4">
          <div className="text-lg text-primary-100 font-bold mb-2 sm:mb-0">{meal.time}</div>
          <div className="flex items-center mb-2 sm:mb-0">
            <img src={meal.image} alt={meal.name} className="w-16 h-16 rounded-full" />
            <div className="ml-4">
              <h2 className="text-xl font-bold">{meal.name}</h2>
              <p className="text-sm text-gray-500">{meal.ingredients}</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded self-start sm:self-auto">Edit</button>
        </div>
      ))}
    </div>
  );
};