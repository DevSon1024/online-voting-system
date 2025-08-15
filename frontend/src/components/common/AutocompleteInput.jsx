import { useState, useEffect, useRef } from 'react';

export default function AutocompleteInput({ name, value, placeholder, items, onSelect, required = false }) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1); // To track highlighted suggestion
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleChange = (e) => {
    const query = e.target.value;
    setInputValue(query);
    onSelect(query); // Update parent form state on every change
    if (query.length > 0) {
      const filteredSuggestions = items.filter(item =>
        item.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
      setActiveSuggestionIndex(-1); // Reset active suggestion
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    onSelect(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };
  
  const handleKeyDown = (e) => {
    // Arrow Down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
      );
    } 
    // Arrow Up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
      );
    } 
    // Enter
    else if (e.key === 'Enter') {
      if (activeSuggestionIndex > -1) {
        e.preventDefault();
        handleSuggestionClick(suggestions[activeSuggestionIndex]);
      }
    }
    // Escape
    else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        name={name}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown} // Add keydown event handler
        placeholder={placeholder}
        required={required}
        onFocus={() => setShowSuggestions(inputValue.length > 0 && suggestions.length > 0)}
        autoComplete="off"
        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 shadow-soft hover:border-gray-300"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
          {suggestions.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(item)}
              onMouseEnter={() => setActiveSuggestionIndex(index)} // Sync with mouse hover
              className={`px-4 py-2 cursor-pointer ${
                index === activeSuggestionIndex ? 'bg-indigo-100' : 'hover:bg-indigo-50'
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}