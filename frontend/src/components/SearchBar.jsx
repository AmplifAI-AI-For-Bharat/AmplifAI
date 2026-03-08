import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query, { id: 'default', label: "EVERYONE" });
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute inset-0 bg-devfolio-blue/5 rounded-2xl blur-xl group-focus-within:bg-devfolio-blue/10 transition-all"></div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for niches, technologies, or trends..."
                    className="relative w-full bg-white border-2 border-gray-100 text-devfolio-text-primary p-6 pl-8 rounded-2xl focus:border-devfolio-blue focus:outline-none text-xl shadow-df transition-all placeholder:text-gray-300 font-medium"
                />
                <button
                    type="submit"
                    className="absolute right-4 top-3 bottom-3 df-button-primary px-8 text-xs uppercase tracking-widest"
                >
                    Search
                </button>
            </form>
        </div>
    );
};

export default SearchBar;
