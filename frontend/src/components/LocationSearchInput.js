import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Building2, Mountain, Waves, Wine, TreePine, Plane } from 'lucide-react';
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

// Get modern icon component based on location type
const getModernLocationIcon = (type) => {
  switch (type) {
    case 'city': 
      return <Building2 className="w-5 h-5 text-cement" />;
    case 'region': 
      return <Mountain className="w-5 h-5 text-cement" />;
    case 'beach': 
      return <Waves className="w-5 h-5 text-cement" />;
    case 'wine': 
      return <Wine className="w-5 h-5 text-cement" />;
    case 'mountain': 
      return <TreePine className="w-5 h-5 text-cement" />;
    case 'airport':
      return <Plane className="w-5 h-5 text-cement" />;
    default: 
      return <MapPin className="w-5 h-5 text-cement" />;
  }
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
        const results = searchLocations(debouncedValue, 8);
        setSuggestions(results);
        setIsLoading(false);
        setIsOpen(results.length > 0);
      }, 150);
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
            className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto border border-coral-reef"
            style={{
              boxShadow: '0 10px 40px rgba(137, 117, 96, 0.15)',
              minWidth: '320px',
              width: 'max-content',
              maxWidth: '400px'
            }}
          >
            <div className="py-2">
              {suggestions.map((location, index) => (
                <motion.button
                  key={`${location.name}-${index}`}
                  onClick={() => selectLocation(location)}
                  className={`w-full text-left px-4 py-3 flex items-start space-x-3 transition-all duration-150 border-l-3 ${
                    index === selectedIndex 
                      ? 'bg-linen border-l-cement shadow-sm' 
                      : 'hover:bg-linen/40 border-l-transparent'
                  }`}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ minWidth: 'max-content' }}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getModernLocationIcon(location.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-millbrook text-sm leading-tight whitespace-nowrap">
                      {location.name}
                    </p>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-napa capitalize whitespace-nowrap">
                        {location.region}
                      </p>
                      <span className="mx-2 text-coral-reef text-xs">•</span>
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap
                        ${location.type === 'city' ? 'bg-cement/10 text-cement' : ''}
                        ${location.type === 'region' ? 'bg-tallow/20 text-kabul' : ''}
                        ${location.type === 'beach' ? 'bg-blue-50 text-blue-700' : ''}
                        ${location.type === 'wine' ? 'bg-purple-50 text-purple-700' : ''}
                        ${location.type === 'mountain' ? 'bg-green-50 text-green-700' : ''}
                      `}>
                        {location.type === 'city' ? 'City' : 
                         location.type === 'region' ? 'Region' :
                         location.type === 'beach' ? 'Beach' :
                         location.type === 'wine' ? 'Wine Region' :
                         location.type === 'mountain' ? 'Mountain' : 'Location'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className="flex-shrink-0 mt-1">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: index === selectedIndex ? 1 : 0 }}
                      className="w-4 h-4 text-cement"
                    >
                      →
                    </motion.div>
                  </div>
                </motion.button>
              ))}
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
            className="absolute top-full left-0 mt-2 bg-white border border-coral-reef rounded-lg shadow-xl z-50"
            style={{
              minWidth: '320px',
              width: 'max-content',
              maxWidth: '400px'
            }}
          >
            <div className="px-4 py-6 text-center">
              <div className="mb-2">
                <Search className="w-8 h-8 text-coral-reef mx-auto" />
              </div>
              <p className="text-sm text-millbrook font-medium">No locations found</p>
              <p className="text-xs text-napa mt-1">
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