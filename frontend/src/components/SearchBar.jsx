import React, { useState } from 'react';

const PERSONAS = [
    { id: 'default', label: "Default User" },
    { id: 'student', label: "Newbie / Student", context: ["eli5", "basic", "visual"] },
    { id: 'expert', label: "Expert / Purist", context: ["academic", "deep dive", "technical"] },
    { id: 'hacker', label: "Hacker / Practical", context: ["quick", "hack", "efficient"] },
];

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query, selectedPersona);
    };

    return (
        <div className="w-full max-w-3xl mx-auto mb-8">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What's your vibe today?"
                    className="w-full bg-gray-800 border-2 border-gray-700 text-white p-4 pl-6 rounded-2xl focus:border-blue-500 focus:outline-none text-xl shadow-lg transition-all"
                />
                <button
                    type="submit"
                    className="absolute right-3 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-bold transition-colors"
                >
                    Go
                </button>
            </form>

            {/* Persona Chips */}
            <div className="flex gap-2 mt-4 justify-center flex-wrap">
                {PERSONAS.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setSelectedPersona(p)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedPersona.id === p.id
                            ? 'bg-purple-600 text-white scale-105 shadow-purple-500/30 shadow-lg'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SearchBar;
