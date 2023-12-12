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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
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

// how to change color of text in list item using tailwindcss

// <li className="text-[#2e026d]" key={post.id}>