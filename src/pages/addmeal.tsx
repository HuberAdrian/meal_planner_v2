import { type NextPage } from "next";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import PageShell from "~/components/layout/PageShell";
import MealForm, { emptyMealForm } from "~/components/MealForm";
import MealsSubnav from "~/components/MealsSubnav";
import { api } from "~/utils/api";

const AddMeal: NextPage = () => {
  const router = useRouter();
  const utils = api.useContext();

  const { mutate, isLoading } = api.meal.create.useMutation({
    onSuccess: (meal) => {
      toast.success(`„${meal.name}“ gespeichert`);
      void utils.meal.getAll.invalidate();
      void router.push("/deletemeal");
    },
    onError: (e) => toast.error(e.message || "Fehler beim Speichern"),
  });

  return (
    <PageShell title="Neues Rezept" heading="Essen" activePage="meals" subheader={<MealsSubnav active="new" />}>
      <MealForm
        initial={emptyMealForm()}
        submitLabel="Rezept speichern"
        isSaving={isLoading}
        onSubmit={(value) =>
          mutate({
            name: value.name,
            type: value.type,
            description: value.description || null,
            ingredients: value.ingredients,
          })
        }
      />
    </PageShell>
  );
};

export default AddMeal;
