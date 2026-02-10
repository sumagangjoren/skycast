import { useState, useEffect } from 'react'
import './App.css'
import { fetchWeather, getWeatherIcon } from './services/weatherService';
import WeatherChart from './components/WeatherChart';
import SearchBar from './components/SearchBar';
import { getWeatherInsights } from './services/geminiService';

function App() {
    const [count, setCount] = useState(0);
    const [aiInsight, setAiInsight] = useState(null);
    const [state, setState] = useState({
        currentLocation: null,
        weather: null,
        favorites: JSON.parse(localStorage.getItem('skycast_favorites') || '[]'),
        unit: (localStorage.getItem('skycast_unit')) || 'celsius',
        loading: true,
        error: null,
    });

    const CORDOVA_CEBU = { 
        name: "Cordova, Cebu", 
        latitude: 10.2505, 
        longitude: 123.9492,
        country: "Philippines"
    };

    const handleLocationSelect = (location) => {
        updateWeatherData(location, state.unit);
    };

    const updateWeatherData = async (location, unit) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const weather = await fetchWeather(location.latitude, location.longitude, unit);
            setState(prev => ({ ...prev, weather, currentLocation: location, loading: false }));

            // Fetch AI Insight
            const insight = await getWeatherInsights(weather, location);
            setAiInsight(insight);
        } catch (err) {
            setState(prev => ({ ...prev, error: "Failed to load weather data. Please try again.", loading: false }));
        }
    }

    useEffect(() => {
        const initLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        const defaultLocation = {
                            name: "Current Location",
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude
                        };
                        updateWeatherData(defaultLocation, state.unit);
                        console.log(pos)
                    },
                    () => {
                        // Fallback to London if blocked
                        updateWeatherData(CORDOVA_CEBU, state.unit);
                    }
                );
            } else {
                updateWeatherData(CORDOVA_CEBU, state.unit);
            }
        };

        initLocation();
    }, []);

    const toggleUnit = () => {
        const nextUnit = state.unit === 'celsius' ? 'fahrenheit' : 'celsius';
        setState(prev => ({ ...prev, unit: nextUnit }));
        localStorage.setItem('skycast_unit', nextUnit);
        if (state.currentLocation) {
            updateWeatherData(state.currentLocation, nextUnit);
        }
    };

     const toggleFavorite = () => {
        if (!state.currentLocation) return;
        const isFav = state.favorites.some(f => f.latitude === state.currentLocation?.latitude && f.longitude === state.currentLocation?.longitude);
        let newFavs;
        if (isFav) {
            newFavs = state.favorites.filter(f => f.latitude !== state.currentLocation?.latitude);
        } else {
            newFavs = [...state.favorites, state.currentLocation];
        }
        setState(prev => ({ ...prev, favorites: newFavs }));
        localStorage.setItem('skycast_favorites', JSON.stringify(newFavs));
    };

      if (state.loading && !state.weather) {
        return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/60 font-medium">Predicting the skies...</p>
        </div>
        );
    }

    const isCurrentFavorite = state.currentLocation && state.favorites.some(f => f.latitude === state.currentLocation?.latitude);


    return (
        <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">SkyCast</h1>
                        <p className="text-white/40 text-sm font-medium">Weather Forecast</p>
                    </div>
                </div>

                <div className="flex-1 max-w-lg">
                    <SearchBar onSelect={handleLocationSelect} />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleUnit}
                        className="glass px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition-all border border-white/10"
                    >
                        {state.unit === 'celsius' ? '°C' : '°F'}
                    </button>
                </div>
            </header>

            {state.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-2xl mb-8 flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {state.error}
                </div>
            )}

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Main Weather */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Main Card */}
                    <section className="glass rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <button
                                onClick={toggleFavorite}
                                className={`p-3 rounded-full transition-all ${isCurrentFavorite ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                            >
                                <svg className="w-6 h-6" fill={isCurrentFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-12">
                            <div className="text-8xl md:text-9xl font-extralight tracking-tighter">
                                {Math.round(state.weather?.current.temp || 0)}°
                            </div>
                            <div className="pb-4">
                                <h2 className="text-3xl font-semibold mb-1">{state.currentLocation?.name}</h2>
                                <p className="text-white/60 text-lg">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div className="md:ml-auto text-right pb-4 flex items-center gap-4">
                                <span className="text-7xl">{getWeatherIcon(state.weather?.current.conditionCode || 0, state.weather?.current.isDay)}</span>
                                <span className="text-xl font-medium text-white/80">{state.weather?.current.condition}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 pt-8">
                            <div className="space-y-1">
                                <p className="text-white/40 text-xs uppercase font-bold tracking-widest">Humidity</p>
                                <p className="text-xl font-semibold">{state.weather?.current.humidity}%</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-white/40 text-xs uppercase font-bold tracking-widest">Wind</p>
                                <p className="text-xl font-semibold">{state.weather?.current.windSpeed} km/h</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-white/40 text-xs uppercase font-bold tracking-widest">UV Index</p>
                                <p className="text-xl font-semibold">{state.weather?.current.uvIndex}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-white/40 text-xs uppercase font-bold tracking-widest">Feels Like</p>
                                <p className="text-xl font-semibold">{Math.round((state.weather?.current.temp || 0) - 1)}°</p>
                            </div>
                        </div>
                    </section>

                    {/* AI Insight Section */}
                    <section className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[2rem] p-8 border border-blue-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-500 p-1.5 rounded-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 className="font-bold text-lg">SkyCast AI Insights</h3>
                        </div>
                        <p className="text-white/80 leading-relaxed italic">
                            {aiInsight || "Analyzing the atmosphere for you..."}
                        </p>
                    </section>

                    <section className="glass rounded-[2rem] p-8">
                        <h3 className="font-bold text-xl mb-8 flex items-center gap-3">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Hourly Trend
                        </h3>
                        {state.weather && <WeatherChart weather={state.weather} unit={state.unit} />}
                    </section>
                </div>

                {/* Right Column: Favorites & Weekly */}
                <div className="lg:col-span-4 space-y-8">

                    {/* 7-Day Forecast */}
                    <section className="glass rounded-[2rem] p-8">
                        <h3 className="font-bold text-xl mb-6">7-Day Forecast</h3>
                        <div className="space-y-6">
                            {state.weather?.daily.time.map((date, idx) => (
                                <div key={date} className="flex items-center justify-between group">
                                    <span className="w-12 text-white/50 font-medium">
                                        {idx === 0 ? 'Today' : new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                    <span className="text-2xl">{getWeatherIcon(state.weather?.daily.condition[idx])}</span>
                                    <div className="flex items-center gap-3 font-semibold">
                                        <span>{Math.round(state.weather?.daily.tempMax[idx])}°</span>
                                        <span className="text-white/30">{Math.round(state.weather?.daily.tempMin[idx])}°</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Sunrise/Sunset */}
                    <section className="glass rounded-[2rem] p-8 grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                            <span className="text-3xl block mb-2">🌅</span>
                            <p className="text-white/40 text-xs font-bold uppercase mb-1">Sunrise</p>
                            <p className="font-semibold">{state.weather && new Date(state.weather.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                            <span className="text-3xl block mb-2">🌇</span>
                            <p className="text-white/40 text-xs font-bold uppercase mb-1">Sunset</p>
                            <p className="font-semibold">{state.weather && new Date(state.weather.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </section>

                    {/* Favorites */}
                    <section className="glass rounded-[2rem] p-8">
                        <h3 className="font-bold text-xl mb-6">Saved Locations</h3>
                        {state.favorites.length === 0 ? (
                            <p className="text-white/20 text-center py-4 text-sm">No saved locations yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {state.favorites.map((fav, i) => (
                                    <button
                                        key={`${fav.latitude}-${i}`}
                                        onClick={() => handleLocationSelect(fav)}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-left group"
                                    >
                                        <div>
                                            <span className="font-bold block">{fav.name}</span>
                                            <span className="text-white/40 text-xs">{fav.country}</span>
                                        </div>
                                        <svg className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <footer className="mt-16 pt-8 border-t border-white/5 text-center text-white/20 text-sm">
                <p>&copy; 2024 SkyCast AI Weather. Data provided by Open-Meteo.</p>
            </footer>
        </div>
    );
}

export default App
