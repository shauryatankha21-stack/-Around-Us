import { useState, useRef, useEffect } from 'react';
import { getCollegeSuggestions } from '../data/colleges';

export default function CollegeInput({
  id = 'college-input',
  value = '',
  onChange,
  placeholder = 'Type to search college (e.g. Manipal)...',
  required = false,
  autoFocus = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = value ? getCollegeSuggestions(value, 8) : [];

  // Close dropdown on outside click or blur
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  function handleInputChange(e) {
    onChange(e.target.value);
    setIsOpen(true);
    setActiveIndex(-1);
  }

  function handleSelect(college) {
    onChange(college);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setIsOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className={`college-autocomplete-wrap ${className}`} ref={containerRef}>
      <div className="input-icon-wrap">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          autoComplete="off"
        />
        <span className="field-icon" aria-hidden="true">🏛️</span>
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="college-suggestions-list" role="listbox" id={`${id}-suggestions`}>
          {suggestions.map((item, index) => {
            const isSelected = index === activeIndex;
            return (
              <li
                key={item}
                role="option"
                aria-selected={isSelected}
                className={`college-suggestion-item ${isSelected ? 'active' : ''}`}
                onMouseDown={(e) => {
                  // Prevent input blur before click registers
                  e.preventDefault();
                  handleSelect(item);
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span className="college-item-icon">🎓</span>
                <span className="college-item-text">{item}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
