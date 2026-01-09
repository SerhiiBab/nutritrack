
export interface NutritionData {
  itemName: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface FoodEntry extends NutritionData {
  id: string;
  timestamp: number;
  rawInput: string;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}
