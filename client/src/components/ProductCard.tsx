import { useState } from "react";
import { Book } from "@shared/schema";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface ProductCardProps {
  book: Book;
}

const ProductCard = ({ book }: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toast } = useToast();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", { 
        bookId: book.id, 
        quantity: 1 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${book.title} has been added to your cart.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add to cart: ${error}`,
        variant: "destructive",
      });
    }
  });

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${book.title} has been ${isWishlisted ? "removed from" : "added to"} your wishlist.`
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`star-${i}`} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#d68c45]">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <svg key="half-star" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" className="text-[#d68c45]">
          <path fill="currentColor" d="M12,2 L15.09,8.26 L22,9.27 L17,14.14 L18.18,21.02 L12,17.77 L12,2 Z"></path>
          <path fill="none" stroke="currentColor" strokeWidth="1" d="M12,2 L8.91,8.26 L2,9.27 L7,14.14 L5.82,21.02 L12,17.77 L18.18,21.02 L17,14.14 L22,9.27 L15.09,8.26 L12,2 Z"></path>
        </svg>
      );
    }
    
    // Add empty stars
    for (let i = stars.length; i < 5; i++) {
      stars.push(
        <svg key={`empty-star-${i}`} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#d68c45]">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      );
    }
    
    return stars;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <Link href={`/book/${book.id}`}>
          <img 
            src={book.coverImage} 
            alt={`${book.title} cover`} 
            className="w-full h-48 object-cover"
          />
        </Link>
        <button 
          onClick={toggleWishlist}
          className="absolute top-2 right-2 bg-white/90 text-neutral-800 rounded-full w-8 h-8 flex items-center justify-center hover:text-[#d68c45] transition-colors"
        >
          {isWishlisted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#d68c45]">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            </svg>
          )}
        </button>
        {book.isNewRelease && (
          <div className="absolute top-0 left-0 bg-[#1a4d2e] text-white text-xs font-bold px-2 py-1">NEW RELEASE</div>
        )}
        {book.isBestseller && (
          <div className="absolute top-0 left-0 bg-[#d68c45] text-white text-xs font-bold px-2 py-1">BESTSELLER</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex text-xs mb-1">
          {renderStars(book.rating)}
          <span className="ml-1 text-neutral-500">({book.reviewCount})</span>
        </div>
        <h3 className="font-medium text-neutral-800 line-clamp-1">{book.title}</h3>
        <p className="text-neutral-500 text-sm mb-2">{book.author}</p>
        <div className="flex justify-between items-center">
          {book.discountedPrice ? (
            <div>
              <span className="font-bold text-neutral-800">${book.discountedPrice.toFixed(2)}</span>
              <span className="text-neutral-400 text-sm line-through ml-1">${book.price.toFixed(2)}</span>
            </div>
          ) : (
            <span className="font-bold text-neutral-800">${book.price.toFixed(2)}</span>
          )}
          <button 
            onClick={() => addToCartMutation.mutate()}
            disabled={addToCartMutation.isPending}
            className="bg-[#1a4d2e] hover:bg-[#2a5d3e] text-white text-sm py-1 px-3 rounded-lg transition-colors flex items-center"
          >
            {addToCartMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
            ) : null}
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
