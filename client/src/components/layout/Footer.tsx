import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = new FormData(form).get('email') as string;
    
    if (email) {
      toast({
        title: "Subscription successful!",
        description: "You have been added to our newsletter.",
      });
      form.reset();
    } else {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
    }
  };

  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-[#d68c45] text-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </span>
              <span className="font-['Playfair_Display'] font-bold text-xl">BookSage</span>
            </div>
            <p className="text-neutral-400 text-sm mb-4">Discover books at the best prices with our AI-powered pricing and inventory management system.</p>
            <div className="flex space-x-4">
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
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/category/new-releases" className="text-neutral-400 hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/category/bestsellers" className="text-neutral-400 hover:text-white transition-colors">Bestsellers</Link></li>
              <li><Link href="/category/fiction" className="text-neutral-400 hover:text-white transition-colors">Fiction</Link></li>
              <li><Link href="/category/non-fiction" className="text-neutral-400 hover:text-white transition-colors">Non-Fiction</Link></li>
              <li><Link href="/category/children" className="text-neutral-400 hover:text-white transition-colors">Children's Books</Link></li>
              <li><Link href="/category/textbooks" className="text-neutral-400 hover:text-white transition-colors">Textbooks</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-neutral-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="text-neutral-400 hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/shipping" className="text-neutral-400 hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/order-status" className="text-neutral-400 hover:text-white transition-colors">Order Status</Link></li>
              <li><Link href="/payment" className="text-neutral-400 hover:text-white transition-colors">Payment Options</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Subscribe</h3>
            <p className="text-neutral-400 text-sm mb-4">Subscribe to our newsletter for exclusive deals and reading recommendations.</p>
            <form onSubmit={handleSubscribe} className="mb-4">
              <div className="flex">
                <Input 
                  type="email" 
                  name="email" 
                  placeholder="Your email address" 
                  className="flex-grow px-4 py-2 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-[#d68c45] text-neutral-800"
                />
                <Button 
                  type="submit" 
                  className="bg-[#d68c45] hover:bg-[#c67c35] px-4 py-2 rounded-r-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z"></path>
                    <path d="M22 2 11 13"></path>
                  </svg>
                </Button>
              </div>
            </form>
            <p className="text-xs text-neutral-500">By subscribing, you agree to our Privacy Policy and consent to receive updates from us.</p>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row md:justify-between">
            <p className="text-sm text-neutral-500 mb-4 md:mb-0">&copy; 2023 BookSage. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy" className="text-sm text-neutral-500 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-neutral-500 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/accessibility" className="text-sm text-neutral-500 hover:text-white transition-colors">Accessibility</Link>
              <Link href="/cookies" className="text-sm text-neutral-500 hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
