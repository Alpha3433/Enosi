import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search } from 'lucide-react';
import { searchLocations, getLocationIcon } from '../utils/locationData';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const LocationSearchInput = ({ 
  value, 
  onChange, 
  onLocationSelect, 
  placeholder = "Search destinations",
  error 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  
  const debouncedValue = useDebounce(value, 300);

  // Search for suggestions when debounced value changes
  useEffect(() => {
    if (debouncedValue && debouncedValue.length >= 2) {
      setIsLoading(true);
      // Simulate API delay for better UX
      setTimeout(() => {
        const results = searchLocations(debouncedValue, 6);
        setSuggestions(results);
        setIsLoading(false);
        setIsOpen(results.length > 0);
      }, 100);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  }, [debouncedValue]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectLocation(suggestions[selectedIndex]);
        }
        break;
        
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const selectLocation = (location) => {
    onChange(location.name);
    onLocationSelect && onLocationSelect(location);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          className={`w-full text-sm outline-none border-0 bg-transparent placeholder-napa font-sans transition-all duration-200 ${
            error ? 'text-red-500' : 'text-kabul'
          }`}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <div className="w-4 h-4 border-2 border-cement border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-coral-reef rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto"
          >
            <div className="py-2">
              {suggestions.map((location, index) => (
                <motion.button
                  key={`${location.name}-${index}`}
                  onClick={() => selectLocation(location)}
                  className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-all duration-150 ${
                    index === selectedIndex 
                      ? 'bg-linen border-l-4 border-cement' 
                      : 'hover:bg-linen/50'
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg flex-shrink-0">
                    {getLocationIcon(location.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-millbrook text-sm truncate">
                      {location.name}
                    </p>
                    <p className="text-xs text-napa capitalize">
                      {location.type} • {location.region}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <MapPin className="w-4 h-4 text-coral-reef" />
                  </div>
                </motion.button>
              ))}
            </div>
            
            {/* Footer */}
            <div className="border-t border-coral-reef px-4 py-2 bg-linen/30">
              <p className="text-xs text-napa text-center">
                Use ↑↓ to navigate, Enter to select, Esc to close
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results */}
      <AnimatePresence>
        {isOpen && suggestions.length === 0 && !isLoading && value.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-coral-reef rounded-xl shadow-xl z-50"
          >
            <div className="px-4 py-3 text-center">
              <p className="text-sm text-napa">No locations found</p>
              <p className="text-xs text-coral-reef mt-1">
                Try searching for a city, region, or area in Australia
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationSearchInput;