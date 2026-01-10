
import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, Utensils, History, TrendingUp, Trash2, 
  Loader2, Salad, Zap, PieChart as PieIcon, 
  ChevronRight, Sun, Moon 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FoodEntry, DailyTotals } from './types';
import { parseMealDescription } from './services/geminiService';
import HeroBild from "./components/HeroBild/HeroBild";

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

const App: React.FC = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('nutri_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply dark mode class to root element
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('nutri_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('nutri_theme', 'light');
    }
  }, [darkMode]);

  // Load entries from local storage
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

  // Save entries to local storage
  useEffect(() => {
    localStorage.setItem('nutri_entries', JSON.stringify(entries));
  }, [entries]);

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowDashboard(true);
      setIsTransitioning(false);
      window.scrollTo(0, 0);
    }, 500);
  };

  const handleGoBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowDashboard(false);
      setIsTransitioning(false);
      window.scrollTo(0, 0);
    }, 500);
  };

  const toggleDarkMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDarkMode(prev => !prev);
  };

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

  // Inlined JSX for theme toggle to ensure better performance
  const renderThemeToggle = () => (
    <button
      onClick={toggleDarkMode}
      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all shadow-sm border border-slate-200 dark:border-slate-700 active:scale-90"
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? (
        <Sun size={20} className="animate-in fade-in spin-in-90 duration-500" />
      ) : (
        <Moon size={20} className="animate-in fade-in spin-in-45 duration-500" />
      )}
    </button>
  );

  if (!showDashboard) {
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {/* Landing Page Navigation */}
        <nav className="max-w-5xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg text-white">
              <Salad size={24} />
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white">NutriTrack KI</span>
          </div>
          {renderThemeToggle()}
        </nav>

        {/* Landing Page Hero */}
        <div className="relative flex max-w-screen-lg mx-auto">
          {/* <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,black,rgba(0,0,0,0.6))] -z-10"></div> */}
          <div className="max-w-5xl xl:max-w-[450px] px-4 py-16 text-center mx-auto xl:mx-0">
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-bold mb-8 animate-bounce">
              <Zap size={16} />
              KI-gestütztes Tracking
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
              Essen tracken war <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
                noch nie so einfach.
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Vergiss komplizierte Datenbanken. Schreib einfach auf, was du gegessen hast, und unsere KI erledigt den Rest für dich.
            </p>
            <button 
              onClick={handleStart}
              className="group bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
            >
              Jetzt starten
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className='herobild'>
            <HeroBild />
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Utensils size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Natürliche Sprache</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                Keine Suche nach Artikeln. "Ein halbes Hähnchen mit Reis" reicht völlig aus.
              </p>
            </div>
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <PieIcon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Makro-Analyse</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                Detaillierte Aufschlüsselung von Eiweiß, Fett und Kohlenhydraten in Echtzeit.
              </p>
            </div>
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Tagesübersicht</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                Behalte deine täglichen Kalorienziele mit intuitiven Diagrammen immer im Blick.
              </p>
            </div>
          </div>
        </div>

        <footer className="text-center py-10 border-t border-slate-100 dark:border-slate-800 text-slate-400 text-sm">
          NutriTrack KI &copy; 2025 – Gesund leben leicht gemacht.
        </footer>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-8 transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={handleGoBack}
          >
            <div className="bg-emerald-500 p-2 rounded-lg text-white">
              <Salad size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">NutriTrack KI</h1>
          </button>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex gap-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full uppercase tracking-wider">{entries.length} Einträge</span>
             </div>
             {renderThemeToggle()}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Section */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
              <Utensils className="text-emerald-500" size={20} />
              Was hast du gegessen?
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="z.B. Ich hatte 2 gekochte Eier, eine mittlere Avocado und eine Scheibe Vollkornbrot"
                  className="w-full min-h-[120px] p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isLoading || !input.trim() 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20'
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
              {error && <p className="text-red-500 dark:text-red-400 text-sm font-medium text-center">{error}</p>}
            </form>
          </div>

          {/* History List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
              <History className="text-blue-500" size={20} />
              Letzte Einträge
            </h2>
            {entries.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-600">
                <Utensils size={40} className="mx-auto mb-4 opacity-20" />
                <p>Noch keine Mahlzeiten erfasst. <br />Fang jetzt an!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="group p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all relative">
                    <button 
                      onClick={() => removeEntry(entry.id)}
                      className="absolute top-4 right-4 p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Eintrag löschen"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex justify-between items-start mb-2 pr-8">
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{entry.itemName}</h3>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5">Basierend auf: "{entry.rawInput}"</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{entry.calories} kcal</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg py-2">
                        <span className="block text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">Eiweiß</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{entry.protein}g</span>
                      </div>
                      <div className="text-center bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg py-2">
                        <span className="block text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">Fett</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{entry.fat}g</span>
                      </div>
                      <div className="text-center bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg py-2">
                        <span className="block text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">KH</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{entry.carbs}g</span>
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 sticky top-24">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
              <TrendingUp className="text-orange-500" size={20} />
              Tagesübersicht
            </h2>
            
            <div className="mb-8 text-center bg-slate-50 dark:bg-slate-800/50 py-6 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="text-4xl font-black text-emerald-500 mb-1">{dailyTotals.calories}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Gesamtkalorien (kcal)</div>
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
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                        color: darkMode ? '#f1f5f9' : '#1e293b'
                      }}
                      itemStyle={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 italic text-sm text-center px-4">
                  <PieIcon size={40} className="mb-2 opacity-20" />
                  Logge eine Mahlzeit für Diagramme
                </div>
              )}
            </div>

            <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
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
          className="bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
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
      <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
      <span className="font-bold text-slate-800 dark:text-slate-200">{value}g</span>
    </div>
    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-700 ease-out`} 
        style={{ width: `${Math.min((value / 150) * 100, 100)}%` }}
      />
    </div>
  </div>
);

export default App;
