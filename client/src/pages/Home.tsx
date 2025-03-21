import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { Link } from "wouter";
import ProductCard from "@/components/ProductCard";
import SidebarFilter, { FilterOptions } from "@/components/SidebarFilter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Home = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    minPrice: 0,
    maxPrice: 100,
    author: "",
    formats: [],
    minRating: 0
  });
  
  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books/featured"],
  });

  // In a real application, we would use the filters to query the backend
  // Here, we'll just filter the client-side data for demonstration
  const filteredBooks = books?.filter(book => {
    // Apply category filter
    if (filters.categories.length > 0 && !filters.categories.includes(book.category)) {
      return false;
    }
    
    // Apply price filter
    const price = book.discountedPrice || book.price;
    if (price < filters.minPrice || price > filters.maxPrice) {
      return false;
    }
    
    // Apply author filter
    if (filters.author && !book.author.toLowerCase().includes(filters.author.toLowerCase())) {
      return false;
    }
    
    // Apply format filter
    if (filters.formats.length > 0 && !filters.formats.includes(book.format)) {
      return false;
    }
    
    // Apply rating filter
    if (book.rating < filters.minRating) {
      return false;
    }
    
    return true;
  });

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-6 md:py-10">
      {/* Mobile Category Navigation */}
      <div className="md:hidden mb-4 overflow-x-auto">
        <div className="flex space-x-3 pb-2">
          <Link href="/" className="whitespace-nowrap px-3 py-1 bg-[#1a4d2e] text-white rounded-full text-sm">All Books</Link>
          <Link href="/category/fiction" className="whitespace-nowrap px-3 py-1 bg-neutral-100 rounded-full text-sm">Fiction</Link>
          <Link href="/category/non-fiction" className="whitespace-nowrap px-3 py-1 bg-neutral-100 rounded-full text-sm">Non-Fiction</Link>
          <Link href="/category/children" className="whitespace-nowrap px-3 py-1 bg-neutral-100 rounded-full text-sm">Children's</Link>
          <Link href="/category/bestsellers" className="whitespace-nowrap px-3 py-1 bg-neutral-100 rounded-full text-sm">Bestsellers</Link>
          <Link href="/category/new-releases" className="whitespace-nowrap px-3 py-1 bg-neutral-100 rounded-full text-sm">New Releases</Link>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative bg-[#1a4d2e] rounded-xl overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a4d2e] to-transparent opacity-80"></div>
        <div className="relative z-10 px-6 py-10 md:px-12 md:py-16 max-w-2xl">
          <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl lg:text-5xl text-white mb-4">Discover Your Next Great Read</h1>
          <p className="text-[#f9f3e5] text-base md:text-lg mb-6">Smart recommendations based on reading trends and your preferences</p>
          <Link href="/category/bestsellers">
            <Button className="bg-[#d68c45] hover:bg-[#c67c35] text-white py-2 px-6 rounded-full inline-flex items-center transition-colors">
              <span>Browse Bestsellers</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Button>
          </Link>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
          alt="Books collection" 
          className="absolute right-0 top-0 h-full w-1/2 md:w-2/3 object-cover opacity-20 md:opacity-40"
        />
      </div>

      {/* Content Layout - Two Columns on Desktop */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-1/4 lg:w-1/5">
          <SidebarFilter onFilterChange={handleFilterChange} />
        </div>
        
        {/* Product List */}
        <div className="md:w-3/4 lg:w-4/5">
          {/* Results Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-neutral-800">Featured Books</h2>
            <div className="flex items-center mt-3 sm:mt-0">
              <span className="text-sm text-neutral-500 mr-3">Sort by:</span>
              <select className="border-none bg-white rounded-lg py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#d68c45]">
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Customer Rating</option>
                <option>New Arrivals</option>
              </select>
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-5 w-full mb-1" />
                    <Skeleton className="h-4 w-32 mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredBooks?.length === 0 ? (
              <div className="col-span-full py-10 text-center">
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 mb-4">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">No books found</h3>
                  <p className="text-neutral-500 mb-4">Try adjusting your filters to find books.</p>
                  <Button 
                    onClick={() => setFilters({
                      categories: [],
                      minPrice: 0,
                      maxPrice: 100,
                      author: "",
                      formats: [],
                      minRating: 0
                    })}
                    className="bg-[#1a4d2e] hover:bg-[#2a5d3e]"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            ) : (
              filteredBooks?.map(book => (
                <ProductCard key={book.id} book={book} />
              ))
            )}
          </div>
          
          {/* Pagination */}
          {!isLoading && filteredBooks && filteredBooks.length > 0 && (
            <div className="mt-10 flex justify-center">
              <nav className="inline-flex rounded-md shadow-sm">
                <Button variant="outline" size="icon" className="rounded-l-md border border-neutral-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"></path>
                  </svg>
                </Button>
                <Button variant="outline" className="border border-neutral-200">1</Button>
                <Button className="border border-neutral-200 bg-[#1a4d2e] text-white">2</Button>
                <Button variant="outline" className="border border-neutral-200">3</Button>
                <span className="relative inline-flex items-center px-4 py-2 border border-neutral-200 bg-white text-sm font-medium text-neutral-300">...</span>
                <Button variant="outline" className="border border-neutral-200">8</Button>
                <Button variant="outline" size="icon" className="rounded-r-md border border-neutral-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </Button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;
