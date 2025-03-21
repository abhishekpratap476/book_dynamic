import { useEffect } from "react";
import { Link } from "wouter";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  useEffect(() => {
    // Handle body scroll lock when menu is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div 
      className={`fixed inset-0 bg-neutral-800/95 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-[#d68c45] text-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </span>
            <span className="font-['Playfair_Display'] font-bold text-xl text-white">BookSage</span>
          </div>
          <button 
            onClick={onClose}
            className="text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4">
          <nav className="space-y-6">
            <div>
              <h3 className="text-neutral-400 text-sm font-medium uppercase mb-3">Shop By Category</h3>
              <ul className="space-y-3">
                <li><Link href="/category/fiction" onClick={onClose} className="text-white text-lg">Fiction</Link></li>
                <li><Link href="/category/non-fiction" onClick={onClose} className="text-white text-lg">Non-Fiction</Link></li>
                <li><Link href="/category/children" onClick={onClose} className="text-white text-lg">Children's</Link></li>
                <li><Link href="/category/science-fiction" onClick={onClose} className="text-white text-lg">Science Fiction</Link></li>
                <li><Link href="/category/mystery" onClick={onClose} className="text-white text-lg">Mystery & Thriller</Link></li>
                <li><Link href="/category/biography" onClick={onClose} className="text-white text-lg">Biography</Link></li>
                <li><Link href="/category/romance" onClick={onClose} className="text-white text-lg">Romance</Link></li>
                <li><Link href="/category/history" onClick={onClose} className="text-white text-lg">History</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-neutral-400 text-sm font-medium uppercase mb-3">Special Collections</h3>
              <ul className="space-y-3">
                <li><Link href="/category/bestsellers" onClick={onClose} className="text-white text-lg">Bestsellers</Link></li>
                <li><Link href="/category/new-releases" onClick={onClose} className="text-white text-lg">New Releases</Link></li>
                <li><Link href="/category/award-winners" onClick={onClose} className="text-white text-lg">Award Winners</Link></li>
                <li><Link href="/category/book-club" onClick={onClose} className="text-white text-lg">Book Club Picks</Link></li>
                <li><Link href="/category/signed" onClick={onClose} className="text-white text-lg">Signed Editions</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-neutral-400 text-sm font-medium uppercase mb-3">Account</h3>
              <ul className="space-y-3">
                <li><Link href="/signin" onClick={onClose} className="text-white text-lg">Sign In</Link></li>
                <li><Link href="/register" onClick={onClose} className="text-white text-lg">Create Account</Link></li>
                <li><Link href="/orders" onClick={onClose} className="text-white text-lg">My Orders</Link></li>
                <li><Link href="/wishlist" onClick={onClose} className="text-white text-lg">Wishlist</Link></li>
              </ul>
            </div>
          </nav>
        </div>
        
        <div className="p-4 border-t border-neutral-700">
          <div className="flex space-x-4 mb-4">
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" x2="12" y1="8" y2="16"></line>
                <line x1="8" x2="16" y1="12" y2="12"></line>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </a>
          </div>
          <p className="text-sm text-neutral-500">&copy; 2023 BookSage. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
