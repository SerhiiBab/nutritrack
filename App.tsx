
import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Utensils, History, TrendingUp, Trash2, Loader2, Salad } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FoodEntry, DailyTotals } from './types';
import { parseMealDescription } from './services/geminiService';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

const App: React.FC = () => {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nutri_entries');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Fehler beim Laden der Einträge", e);
      }
    }
  }, []);

  // Save data to local storage when entries change
  useEffect(() => {
    localStorage.setItem('nutri_entries', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const parsedData = await parseMealDescription(input);
      const newEntries: FoodEntry[] = parsedData.map((data) => ({
        ...data,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        rawInput: input,
      }));
      
      setEntries(prev => [...newEntries, ...prev]);
      setInput('');
    } catch (err) {
      setError("Die Mahlzeit konnte nicht analysiert werden. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const dailyTotals = useMemo<DailyTotals>(() => {
    return entries.reduce((acc, curr) => ({
      calories: acc.calories + curr.calories,
      protein: acc.protein + curr.protein,
      fat: acc.fat + curr.fat,
      carbs: acc.carbs + curr.carbs,
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
  }, [entries]);

  const chartData = [
    { name: 'Eiweiß', value: dailyTotals.protein },
    { name: 'Fett', value: dailyTotals.fat },
    { name: 'Kohlenhydrate', value: dailyTotals.carbs },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg text-white">
              <Salad size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">NutriTrack KI</h1>
          </div>
          <div className="hidden md:flex gap-4">
             <span className="text-sm font-medium text-slate-500">Verlauf: {entries.length} Einträge</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Section */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Utensils className="text-emerald-500" size={20} />
              Was hast du gegessen?
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="z.B. Ich hatte 2 gekochte Eier, eine mittlere Avocado und eine Scheibe Vollkornbrot"
                  className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none text-slate-700"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`w-full py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isLoading || !input.trim() 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Wird analysiert...
                  </>
                ) : (
                  <>
                    <PlusCircle size={20} />
                    Mahlzeit loggen
                  </>
                )}
              </button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>
          </div>

          {/* History List */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <History className="text-blue-500" size={20} />
              Letzte Einträge
            </h2>
            {entries.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>Noch keine Mahlzeiten erfasst. Fang jetzt an!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="group p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all relative">
                    <button 
                      onClick={() => removeEntry(entry.id)}
                      className="absolute top-4 right-4 p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Eintrag löschen"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex justify-between items-start mb-2 pr-8">
                      <div>
                        <h3 className="font-semibold text-slate-800 capitalize">{entry.itemName}</h3>
                        <p className="text-xs text-slate-400 italic">Aus: "{entry.rawInput}"</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 whitespace-nowrap">{entry.calories} kcal</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center bg-slate-100 rounded-lg py-2">
                        <span className="block text-[9px] uppercase font-bold text-slate-400">Eiweiß</span>
                        <span className="font-semibold text-slate-700 text-sm">{entry.protein}g</span>
                      </div>
                      <div className="text-center bg-slate-100 rounded-lg py-2">
                        <span className="block text-[9px] uppercase font-bold text-slate-400">Fett</span>
                        <span className="font-semibold text-slate-700 text-sm">{entry.fat}g</span>
                      </div>
                      <div className="text-center bg-slate-100 rounded-lg py-2">
                        <span className="block text-[9px] uppercase font-bold text-slate-400">KH</span>
                        <span className="font-semibold text-slate-700 text-sm">{entry.carbs}g</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Dashboard Section */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="text-orange-500" size={20} />
              Tagesübersicht
            </h2>
            
            <div className="mb-8 text-center">
              <div className="text-4xl font-black text-emerald-500 mb-1">{dailyTotals.calories}</div>
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Gesamtkalorien (kcal)</div>
            </div>

            <div className="h-64 w-full mb-6">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-300 italic text-sm text-center px-4">
                  Logge deine erste Mahlzeit, um die Verteilung zu sehen
                </div>
              )}
            </div>

            <div className="space-y-4 border-t border-slate-50 pt-6">
               <MacroProgress label="Eiweiß" value={dailyTotals.protein} color="bg-emerald-500" />
               <MacroProgress label="Fett" value={dailyTotals.fat} color="bg-amber-500" />
               <MacroProgress label="Kohlenhydrate" value={dailyTotals.carbs} color="bg-blue-500" />
            </div>
          </div>
        </aside>
      </main>

      {/* Floating Button for Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <button 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          className="bg-emerald-500 text-white p-4 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
          aria-label="Nach oben scrollen"
        >
          <PlusCircle size={32} />
        </button>
      </div>
    </div>
  );
};

const MacroProgress: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="font-bold text-slate-800">{value}g</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-500 ease-out`} 
        style={{ width: `${Math.min((value / 150) * 100, 100)}%` }}
      />
    </div>
  </div>
);

export default App;
