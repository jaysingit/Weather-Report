import { useState, type FormEvent } from "react";

interface SearchBarProps {
  onSearch: (city: string) => void;
  onReset: () => void;
}

function SearchBar({ onSearch, onReset }: SearchBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  const handleReset = () => {
    setValue("");
    onReset();
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search for a city..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="City name"
        required
      />
      <button type="submit" disabled={!value.trim()}>
        Search
      </button>
      <button type="button" className="reset-button" onClick={handleReset}>
        Reset
      </button>
    </form>
  );
}

export default SearchBar;
