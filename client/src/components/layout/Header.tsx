import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onCartOpen: () => void;
  onMobileMenuOpen: () => void;
}

const Header = ({ onCartOpen, onMobileMenuOpen }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this would navigate to search results
      // navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      toast({
        title: "Search functionality",
        description: `Searching for "${searchQuery}" - This feature would be implemented in a full application.`,
      });
    }
  };

  return (
    <header className="bg-[#1a4d2e] text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-[#d68c45] text-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </span>
            <span className="font-['Playfair_Display'] font-bold text-xl tracking-tight">BookSage</span>
          </Link>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-grow mx-10 max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search by title, author, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 rounded-full bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#d68c45]"
              />
              <Button 
                type="submit"
                variant="ghost" 
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#2a5d3e] hover:text-[#1a4d2e]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </Button>
            </form>
          </div>
          
          {/* Navigation Icons */}
          <div className="flex items-center space-x-6">
            <Link href="/wishlist" className="text-white hover:text-[#e69c55] transition-colors hidden sm:block">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
                <span className="ml-1 text-sm hidden lg:inline">Wishlist</span>
              </div>
            </Link>
            <Link href="/account" className="text-white hover:text-[#e69c55] transition-colors">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="ml-1 text-sm hidden lg:inline">Account</span>
              </div>
            </Link>
            <button
              onClick={onCartOpen}
              className="text-white hover:text-[#e69c55] transition-colors relative"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="21" r="1"></circle>
                  <circle cx="19" cy="21" r="1"></circle>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                </svg>
                <span className="ml-1 text-sm hidden lg:inline">Cart</span>
                <span className="absolute -top-2 -right-2 bg-[#d68c45] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </div>
            </button>
            <button 
              onClick={onMobileMenuOpen}
              className="md:hidden text-white focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Search Bar - Mobile */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 px-4 rounded-full bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#d68c45]"
            />
            <Button 
              type="submit"
              variant="ghost" 
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#2a5d3e] hover:text-[#1a4d2e]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </Button>
          </form>
        </div>
        
        {/* Category Navigation */}
        <nav className="hidden md:flex space-x-8 py-3 text-sm">
          <Link href="/category/fiction" className="text-white hover:text-[#e69c55] transition-colors font-medium">Fiction</Link>
          <Link href="/category/non-fiction" className="text-white hover:text-[#e69c55] transition-colors font-medium">Non-Fiction</Link>
          <Link href="/category/children" className="text-white hover:text-[#e69c55] transition-colors font-medium">Children's</Link>
          <Link href="/category/bestsellers" className="text-white hover:text-[#e69c55] transition-colors font-medium">Bestsellers</Link>
          <Link href="/category/new-releases" className="text-white hover:text-[#e69c55] transition-colors font-medium">New Releases</Link>
          <Link href="/category/promotions" className="text-white hover:text-[#e69c55] transition-colors font-medium">Promotions</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
