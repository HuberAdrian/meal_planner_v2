import { SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";


import { api } from "~/utils/api";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const { data } = api.post.getAll.useQuery();
  
  const user = useUser();

  return (
    <>
      <Head>
        <title>Organisation</title>
        <meta name="description" content="Organisationsapp für Vivien" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-primary-400 from-[#2e026d] to-[#15162c]">
        <div>
          <h1 color="grey" > Site test </h1>
          <p color="grey">This iis a p element </p>
          <div>
            {!user && <SignInButton />}{!!user && <SignOutButton />}
          </div>
          <div>
            <h2 className="text-4xl" >Posts</h2>
            <ul>
              {data?.map((post) => (
                <li className="text-[#fff]" key={post.id}>
                    {post.content}
                </li>
              ))}
            </ul>
            </div>
        </div>
      </main>
    </>
  );
}


const Day = (/*{ meals }*/) => {
  const meals = [
    {
      time: "8:00",
      name: "Breakfast",
      image: "https://images.unsplash.com/photo-1581091019743-7aaffed1b6d6?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnJlYWtmYXN0fGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80",
      ingredients: "2 eggs, 2 slices of bread, 1 cup of milk",
    },
    {
      time: "12:00",
      name: "Lunch",
      image: "https://images.unsplash.com/photo-1581091019743-7aaffed1b6d6?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnJlYWtmYXN0fGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80",
      ingredients: "2 eggs, 2 slices of bread, 1 cup of milk",
    },
    {
      time: "18:00",
      name: "Dinner",
      image: "https://images.unsplash.com/photo-1581091019743-7aaffed1b6d6?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnJlYWtmYXN0fGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80",
      ingredients: "2 eggs, 2 slices of bread, 1 cup of milk",
    },
  ];
  if (!meals) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      {meals.map((meal, index) => (
        <div key={index} className="flex items-center justify-between w-full my-4">
          <div className="text-lg font-bold">{meal.time}</div>
          <div className="flex items-center">
            <img src={meal.image} alt={meal.name} className="w-16 h-16 rounded-full" />
            <div className="ml-4">
              <h2 className="text-xl font-bold">{meal.name}</h2>
              <p className="text-sm text-gray-500">{meal.ingredients}</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">Edit</button>
        </div>
      ))}
    </div>
  );
};