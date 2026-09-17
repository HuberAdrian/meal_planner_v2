// Single source of truth for meal types, grocery categories and the
// ingredient-slot encoding used by the Meal model (ingredient1..15 columns +
// "ingredientN:Kategorie" strings in Meal.categories, N is 1-based).

export const mealTypes = [
  "Nudelgerichte",
  "Kartoffelgerichte",
  "Reisgerichte",
  "andere Hauptgerichte",
  "Backen",
  "Frühstück",
  "Snacks",
  "Salate",
  "Suppen",
] as const;
export type MealType = (typeof mealTypes)[number];

export const groceryCategories = [
  "Obst & Gemüse",
  "Frühstück",
  "Snacks",
  "Teigwaren",
  "Backen",
  "Milchprodukte",
  "Kühlfach",
  "Sonstiges",
  "Haushalt",
] as const;
export type GroceryCategory = (typeof groceryCategories)[number];
export const DEFAULT_CATEGORY: GroceryCategory = "Sonstiges";

export const MAX_INGREDIENTS = 15;

export const timeOptions = {
  Morgens: "09:00",
  Mittags: "13:00",
  Abends: "19:00",
} as const;

export interface IngredientInput {
  name: string;
  category: string; // "" = none
}

export interface MealIngredient {
  slot: number; // 1-based
  id: string; // "ingredientN"
  name: string;
  category: string | null;
}

type MealSlots = Record<string, unknown> & { categories?: string[] };

export function slotId(slot: number): string {
  return `ingredient${slot}`;
}

/**
 * Parses Meal.categories into a slot → category map (1-based slots).
 *
 * Canonical format is "ingredientN:Kategorie" with N 1-based. Two legacy
 * formats still exist in old rows and are read transparently (a meal becomes
 * canonical as soon as it is saved again):
 *  - 0-based keys ("ingredient0:…"), written by the old edit dialog
 *  - a plain positional list ["Teigwaren", "Kühlfach", …] (index i ↔ slot i+1)
 */
export function categoryBySlot(categories: string[] | undefined): Map<number, string> {
  const map = new Map<number, string>();
  const entries = categories ?? [];
  const prefixed = entries.filter((c) => /^ingredient\d+:/.test(c));

  if (prefixed.length === 0) {
    entries.forEach((cat, index) => {
      const value = cat.trim();
      if (value !== "") map.set(index + 1, value);
    });
    return map;
  }

  const zeroBased = prefixed.some((c) => c.startsWith("ingredient0:"));
  for (const entry of prefixed) {
    const match = /^ingredient(\d+):(.+)$/.exec(entry);
    if (match?.[1] && match[2]) {
      map.set(Number(match[1]) + (zeroBased ? 1 : 0), match[2].trim());
    }
  }
  return map;
}

/** Non-empty ingredients of a meal with their categories. */
export function extractIngredients(meal: MealSlots): MealIngredient[] {
  const cats = categoryBySlot(meal.categories);
  const result: MealIngredient[] = [];
  for (let slot = 1; slot <= MAX_INGREDIENTS; slot++) {
    const value = meal[slotId(slot)];
    if (typeof value === "string" && value.trim() !== "") {
      result.push({
        slot,
        id: slotId(slot),
        name: value.trim(),
        category: cats.get(slot) ?? null,
      });
    }
  }
  return result;
}

export function isGroceryCategory(value: string): value is GroceryCategory {
  return (groceryCategories as readonly string[]).includes(value);
}

/**
 * Turns a compact ingredient list into the column values + category entries
 * stored on the Meal model. Empty names are dropped; slots are packed 1..n.
 */
export function ingredientsToSlots(ingredients: IngredientInput[]): {
  columns: Record<string, string | null>;
  categories: string[];
} {
  const columns: Record<string, string | null> = {};
  for (let slot = 1; slot <= MAX_INGREDIENTS; slot++) columns[slotId(slot)] = null;

  const categories: string[] = [];
  const cleaned = ingredients
    .map((i) => ({ name: i.name.trim(), category: i.category.trim() }))
    .filter((i) => i.name !== "")
    .slice(0, MAX_INGREDIENTS);

  cleaned.forEach((ingredient, index) => {
    const slot = index + 1;
    columns[slotId(slot)] = ingredient.name;
    if (ingredient.category && isGroceryCategory(ingredient.category)) {
      categories.push(`${slotId(slot)}:${ingredient.category}`);
    }
  });

  return { columns, categories };
}

export function sortByCategory<T extends { category: string; name: string }>(items: T[]): T[] {
  const order = groceryCategories as readonly string[];
  return [...items].sort((a, b) => {
    const ia = order.indexOf(a.category);
    const ib = order.indexOf(b.category);
    const ra = ia === -1 ? order.length : ia;
    const rb = ib === -1 ? order.length : ib;
    if (ra !== rb) return ra - rb;
    return a.name.localeCompare(b.name, "de");
  });
}
