"use client"
import { useState } from 'react';
import BottomNavBar from "~/components/BottomNavBar";
import { Error, Loading } from "~/components/loading";
import { api } from "~/utils/api";
import { type NextPage } from "next";
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";

/*

const AddEvent: NextPage = () => {
  const router = useRouter();
  const { date } = router.query;
  const dateString = typeof date === "string" ? date : new Date().toISOString().slice(0, 10);

  // create a state for the post creation form
  const [type, setType] = useState<string>(''); //for eventType
  const [title, setTitle] = useState<string>(''); //for topic
  const [description, setDescription] = useState<string>('');  //for content
  const [eventTime, setEventTime] = useState<string>(`${dateString}T10:00`);  //for eventDate
  const [mealID, setMealID] = useState<string>(''); //for mealID

  // set states for input lengths
  const [descriptionLength, setDescriptionLength] = useState<number>(0);
  const [titleLength, setTitleLength] = useState<number>(0);


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
        toast.error("Fehler beim Posten");
      }
    },
  });


  if (isLoading) return <Loading />;
  if(!data) {
    return <Error />;
  }

  const timeOptions = {
    "Frühstück": "09:00",
    "Mittags": "13:00",
    "Abends": "19:00",
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

    const mutationData = {
      mealID,
      eventType: eventT,
      topic: title,
      content: "-",
      eventDate
    };
  
    // Conditionally add the description field to the mutationData object
    if (description) {
      mutationData.content = description;
    }
  
    mutate(mutationData);
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
      <h1 className="text-3xl font-bold mb-4 text-white">{formattedDate}</h1>
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
                setMealID(selectedMeal.id);
                if (selectedMeal.description) {
                  setDescription(selectedMeal.description);
                  setDescriptionLength(selectedMeal.description.length);
                }
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
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleLength(e.target.value.length);
            }}
            required
            readOnly={type === "meal"}
          />
        <div className="flex justify-between">
          <p className={titleLength > 256 ? 'text-red-500' : 'text-gray-500'}>
            {titleLength} / 256
          </p>
          <p className="italic text-gray-500">
            z.B. &quot;9e4io1e&quot;
          </p>

      </div>
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
            onChange={(e) => {
              setDescription(e.target.value);
              setDescriptionLength(e.target.value.length);
            }}
          />
           <p className={descriptionLength > 256 ? 'text-red-500' : 'text-gray-500'}>
              {descriptionLength} / 256
            </p>
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
             className={`font-bold py-2 w-full rounded-lg focus:outline-none focus:shadow-outline ${!title || !eventTime ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'}`} 
            onClick={handleSubmit}
            disabled={!title || !eventTime || titleLength > 256 || descriptionLength > 256}
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

*/


interface Ingredient {
  id: string;
  name: string;
}

const extractIngredients = (meal: any): Ingredient[] => {
  const ingredients: Ingredient[] = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = meal[`ingredient${i}`];
    if (ingredient) {
      ingredients.push({ id: `ingredient${i}`, name: ingredient });
    }
  }
  return ingredients;
};

const AddEvent: NextPage = () => {
  const router = useRouter();
  const { date } = router.query;
  const dateString = typeof date === "string" ? date : new Date().toISOString().slice(0, 10);

  const [type, setType] = useState<string>(''); //for eventType
  const [title, setTitle] = useState<string>(''); //for topic
  const [description, setDescription] = useState<string>('');  //for content
  const [eventTime, setEventTime] = useState<string>(`${dateString}T10:00`);  //for eventDate
  const [mealID, setMealID] = useState<string>(''); //for mealID

  const [descriptionLength, setDescriptionLength] = useState<number>(0);
  const [titleLength, setTitleLength] = useState<number>(0);

  const [ingredients, setIngredients] = useState<Ingredient[]>([]); // for ingredients
  const [showIngredients, setShowIngredients] = useState<boolean>(false); // for toggling ingredients list

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
        toast.error("Fehler beim Posten");
      }
    },
  });

  if (isLoading) return <Loading />;
  if(!data) {
    return <Error />;
  }

  const timeOptions = {
    "Frühstück": "09:00",
    "Mittags": "13:00",
    "Abends": "19:00",
  };

  const handleSubmit = () => {
    console.log(type, title, description, eventTime);
    let eventT = type
    if (!type) {
      eventT = "event"
    }

    const eventDate = new Date(eventTime);

    const mutationData = {
      mealID,
      eventType: eventT,
      topic: title,
      content: "-",
      eventDate,
      ingredients
    };
  
    if (description) {
      mutationData.content = description;
    }
  
    mutate(mutationData);
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

  const handleIngredientChange = (id: string, newName: string) => {
    setIngredients(prevIngredients =>
      prevIngredients.map(ingredient =>
        ingredient.id === id ? { ...ingredient, name: newName } : ingredient
      )
    );
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients(prevIngredients =>
      prevIngredients.filter(ingredient => ingredient.id !== id)
    );
  };

  return (
    <div className="flex flex-col items-center p-4 pt-14 min-h-screen bg-primary-400">
      <h1 className="text-3xl font-bold mb-4 text-white">{formattedDate}</h1>
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
                  setMealID(selectedMeal.id);
                  if (selectedMeal.description) {
                    setDescription(selectedMeal.description);
                    setDescriptionLength(selectedMeal.description.length);
                  }
                  const extractedIngredients = extractIngredients(selectedMeal);
                  setIngredients(extractedIngredients);
                } else {
                  setType('');
                  setTitle('');
                  setIngredients([]);
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
          {mealID && (
            <div className="mb-4">
              <button
                type="button"
                className="text-white flex items-center"
                onClick={() => setShowIngredients(!showIngredients)}
              >
                {showIngredients ? "Zutaten anzeigen" : "Zutaten verbergen"}
                {showIngredients ? <GoTriangleUp className="ml-2" /> : <GoTriangleDown className="ml-2" />}
              </button>
              {showIngredients && (
                <div className="mt-2">
                  {ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) => handleIngredientChange(ingredient.id, e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteIngredient(ingredient.id)}
                        className="ml-2 text-red-500"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleLength(e.target.value.length);
              }}
              required
              readOnly={type === "meal"}
            />
            <div className="flex justify-between">
              <p className={titleLength > 256 ? 'text-red-500' : 'text-gray-500'}>
                {titleLength} / 256
              </p>
              <p className="italic text-gray-500">
                z.B. &quot;9e4io1e&quot;
              </p>
            </div>
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
              onChange={(e) => {
                setDescription(e.target.value);
                setDescriptionLength(e.target.value.length);
              }}
            />
            <p className={descriptionLength > 256 ? 'text-red-500' : 'text-gray-500'}>
              {descriptionLength} / 256
            </p>
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
            className={`font-bold py-2 w-full rounded-lg focus:outline-none focus:shadow-outline ${!title || !eventTime ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'}`} 
            onClick={handleSubmit}
            disabled={!title || !eventTime || titleLength > 256 || descriptionLength > 256}
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