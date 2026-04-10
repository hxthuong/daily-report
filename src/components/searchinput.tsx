// components/SearchInput.tsx
import { Search } from "lucide-react";

interface SearchProps {
  placeholder?: string;
  searchValue?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchInput({
  placeholder = "Tìm kiếm...",
  searchValue,
  className = "mx-4",
  onChange,
}: SearchProps) {
  return (
    <div className={` md:flex relative flex-1 max-w-xl ${className}`}>
      <input
        type="search"
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2 rounded-md text-black`}
        value={searchValue}
        onChange={onChange}
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
    </div>
  );
}
