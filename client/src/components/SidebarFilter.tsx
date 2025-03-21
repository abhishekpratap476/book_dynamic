import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FilterProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  categories: string[];
  minPrice: number;
  maxPrice: number;
  author: string;
  formats: string[];
  minRating: number;
}

interface Category {
  name: string;
  count: number;
}

const categories: Category[] = [
  { name: "Fiction", count: 234 },
  { name: "Non-Fiction", count: 187 },
  { name: "Science Fiction", count: 95 },
  { name: "Mystery & Thriller", count: 124 },
  { name: "Biography", count: 76 }
];

const formats = ["Hardcover", "Paperback", "E-Book", "Audiobook"];

const SidebarFilter = ({ onFilterChange }: FilterProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 100]);
  const [authorName, setAuthorName] = useState("");
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [minimumRating, setMinimumRating] = useState(3);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    // Call onFilterChange whenever filters change
    onFilterChange({
      categories: selectedCategories,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      author: authorName,
      formats: selectedFormats,
      minRating: minimumRating
    });
  }, [selectedCategories, priceRange, authorName, selectedFormats, minimumRating, onFilterChange]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const handleFormatChange = (format: string, checked: boolean) => {
    if (checked) {
      setSelectedFormats([...selectedFormats, format]);
    } else {
      setSelectedFormats(selectedFormats.filter(f => f !== format));
    }
  };

  const handleRatingClick = (rating: number) => {
    setMinimumRating(rating);
  };

  const handleClearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 100]);
    setAuthorName("");
    setSelectedFormats([]);
    setMinimumRating(0);
  };

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
      <h2 className="font-serif text-lg font-bold text-neutral-800 mb-4">Filter By</h2>
      
      {/* Filter Categories */}
      <div className="mb-6">
        <h3 className="font-medium text-neutral-800 mb-2">Categories</h3>
        <div className="space-y-2">
          {visibleCategories.map((category) => (
            <div key={category.name} className="flex items-center space-x-2 text-sm">
              <Checkbox 
                id={`category-${category.name}`}
                checked={selectedCategories.includes(category.name)}
                onCheckedChange={(checked) => handleCategoryChange(category.name, checked === true)}
                className="rounded text-[#d68c45] focus:ring-[#d68c45]"
              />
              <Label htmlFor={`category-${category.name}`} className="flex-grow cursor-pointer">
                <span>{category.name}</span>
                <span className="text-neutral-400 ml-auto float-right">({category.count})</span>
              </Label>
            </div>
          ))}
          {categories.length > 5 && (
            <button 
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-[#1a4d2e] hover:text-[#2a5d3e] text-sm font-medium mt-1"
            >
              {showAllCategories ? "- Show less" : "+ Show more"}
            </button>
          )}
        </div>
      </div>
      
      {/* Price Range */}
      <div className="mb-6">
        <h3 className="font-medium text-neutral-800 mb-2">Price Range</h3>
        <div className="px-2">
          <Slider
            defaultValue={[0, 100]}
            max={100}
            step={1}
            value={priceRange}
            onValueChange={setPriceRange}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#d68c45]"
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-2">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>
      
      {/* Author */}
      <div className="mb-6">
        <h3 className="font-medium text-neutral-800 mb-2">Author</h3>
        <Input
          type="text"
          placeholder="Author name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d68c45]"
        />
      </div>
      
      {/* Format */}
      <div className="mb-6">
        <h3 className="font-medium text-neutral-800 mb-2">Format</h3>
        <div className="space-y-2">
          {formats.map((format) => (
            <div key={format} className="flex items-center space-x-2 text-sm">
              <Checkbox 
                id={`format-${format}`}
                checked={selectedFormats.includes(format)}
                onCheckedChange={(checked) => handleFormatChange(format, checked === true)}
                className="rounded text-[#d68c45] focus:ring-[#d68c45]"
              />
              <Label htmlFor={`format-${format}`}>{format}</Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Ratings */}
      <div className="mb-6">
        <h3 className="font-medium text-neutral-800 mb-2">Minimum Rating</h3>
        <div className="flex space-x-1 text-[#d68c45]">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button 
              key={rating}
              onClick={() => handleRatingClick(rating)}
              className="text-xl"
            >
              {rating <= minimumRating ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-300">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              )}
            </button>
          ))}
          <span className="ml-2 text-sm font-medium">& Up</span>
        </div>
      </div>
      
      {/* Apply/Clear Buttons */}
      <div className="flex space-x-3">
        <Button className="flex-grow bg-[#1a4d2e] hover:bg-[#2a5d3e] text-white rounded-lg py-2 text-sm">
          Apply Filters
        </Button>
        <Button 
          onClick={handleClearAllFilters}
          variant="outline"
          className="flex-grow bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg py-2 text-sm"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default SidebarFilter;
