"use client"
import { useEffect, useState } from 'react';
import Link from "next/link";
import BottomNavBar from "~/components/BottomNavBar";
import { Error, Loading } from "~/components/loading";
import { api } from "~/utils/api";
import { type NextPage } from "next";
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { MdOutlineElectricalServices } from 'react-icons/md';



const AddEvent: NextPage = () => {
  const router = useRouter();
  const { date } = router.query;

  // create a state for the post creation form
  const [type, setType] = useState<string>(''); //for eventType
  const [title, setTitle] = useState<string>(''); //for topic
  const [description, setDescription] = useState<string>('');  //for content
  const [eventTime, setEventTime] = useState<string>('');  //for eventDate

  // get meal
  const { data, isLoading } = api.meal.getAll.useQuery();

  const formattedDate = new Date(date as string).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });


  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      toast.success("Posted!");
      void router.push("/");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });


  if (isLoading) return <Loading />;
  if(!data) {
    return <Error />;
  }

  const timeOptions = {
    "Frühstück": "09:00",
    "Mittagessen": "13:00",
    "Abendessen": "19:00",
  };

  // add event
  const handleSubmit = () => {
    console.log(type, title, description, eventTime);
    let eventT = type
    if (!type) {
      eventT = "event"
    }

    // convert the eventTime string to a Date object and print it to the console
    const eventDate = new Date(eventTime);
    console.log(eventDate);

    mutate({ eventType: eventT, topic: title, content: description, eventDate });
  };


  const handleTimeSelection = (option: keyof typeof timeOptions) => {
    if (typeof date === 'string') {
        if (eventTime.includes(option)) {
            setEventTime('');
        } else {
            setEventTime(`${date}T${timeOptions[option]}`)
        }
    }
  };


  if (isLoading) return <Loading />;
  
      
      return (
      <div className="flex flex-col items-center p-4 pt-14 min-h-screen bg-primary-400">
      <h1 className="text-4xl font-bold mb-4 text-white">{formattedDate}</h1>
      <form onSubmit={(e) => e.preventDefault()} className="w-full sm:max-w-md mx-auto rounded-xl overflow-y-scroll overflow-x-hidden p-4">
        <div className="border p-4 rounded-lg ">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="meal">
            Meal
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="meal"
            onChange={(e) => {
              const selectedMeal = data.find(meal => meal.id === e.target.value);
              if (selectedMeal) {
                setType("meal");
                setTitle(selectedMeal.name);
              } else {
                setType('');
                setTitle('');
              }
            }}
          >
            <option value="">Select a meal</option>
            {data.map((meal) => (
              <option key={meal.id} value={meal.id}>
                {meal.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2 " htmlFor="time">
            Uhrzeit auswählen
          </label>
          <div className="flex w-full items-center justify-between">
          {Object.keys(timeOptions).map((option) => (
            <button 
              key={option} 
              onClick={() => handleTimeSelection(option as keyof typeof timeOptions)}
              className={`p-2 rounded ${eventTime.endsWith(timeOptions[option as keyof typeof timeOptions]) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
  >
              {option}
            </button>
          ))}
            </div>
          </div>
        </div>
        <h3 className="text-xl text-center font-bold my-8 text-white">------- oder -------</h3>
        <div className="border p-4 rounded-lg ">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="title">
            Titel Event
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            placeholder="Titel Event"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            readOnly={type === "meal"}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="description">
            Beschreibung
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            placeholder="Beschreibung"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="eventTime">
            Uhrzeit
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="eventTime"
            type="datetime-local"
            placeholder="Uhrzeit"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            required
          />
        </div>
        </div>
        <div className="flex items-center justify-center w-full mt-4">
        <button
             className={`font-bold py-2 w-full rounded-lg focus:outline-none focus:shadow-outline ${!title || !description || !eventTime ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'}`} 
            onClick={handleSubmit}
            disabled={!title || !description || !eventTime}
            >
                Speichern
        </button>
        </div>
      </form>
      <div className="h-16" />
      <BottomNavBar activePage='calendar' />
    </div>
  );
};

export default AddEvent;

/*
Situation: duales Studium während des Bachelors -> Steuern gezahlt. Nach dem Bachelor ein halbes Jahr gearbeitet -> Steuern gezahlt. Danach plane ich ein Masterstudium, was davon kann ich absetzen?


Können Steuern abgesetzt werden, wenn zwischen Bachelor und Master gearbeitet wurde?
*/