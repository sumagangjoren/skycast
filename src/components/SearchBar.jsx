import { searchLocations } from "../services/weatherService";
import { useState, useEffect, useRef } from 'react';

export default function SearchBar({ onSelect }) {

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim()) {
                const locations = await searchLocations(query);
                setResults(locations);
                setIsOpen(true);
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (
        <div className="relative w-full max-w-md mx-auto" ref={dropdownRef}>
            <div className="relative">
                <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-2xl py-3 px-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md transition-all"
                    placeholder="Search for a city..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <svg
                    className="absolute left-4 top-3.5 h-5 w-5 text-white/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl overflow-hidden z-50 shadow-2xl">
                    {results.map((loc, idx) => (
                        <button
                            key={`${loc.latitude}-${loc.longitude}-${idx}`}
                            className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-none"
                            onClick={() => {
                                onSelect(loc);
                                setQuery('');
                                setIsOpen(false);
                            }}
                        >
                            <span className="font-medium text-white">{loc.name}</span>
                            <span className="text-white/50 text-sm block">
                                {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}