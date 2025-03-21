import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface CartItem {
  id: number;
  quantity: number;
  book: {
    id: number;
    title: string;
    author: string;
    price: number;
    discountedPrice?: number;
    coverImage: string;
  };
}

interface CartResponse {
  items: CartItem[];
  total: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const { toast } = useToast();

  const { data: cart, isLoading } = useQuery<CartResponse>({
    queryKey: ["/api/cart"],
    enabled: isOpen,
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({id, quantity}: {id: number, quantity: number}) => {
      await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      return { id, quantity };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update cart: ${error}`,
        variant: "destructive",
      });
    }
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Item removed from cart",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove item: ${error}`,
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    // Handle body scroll lock when cart is open
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

  const handleIncreaseQuantity = (item: CartItem) => {
    updateCartMutation.mutate({ id: item.id, quantity: item.quantity + 1 });
  };

  const handleDecreaseQuantity = (item: CartItem) => {
    if (item.quantity > 1) {
      updateCartMutation.mutate({ id: item.id, quantity: item.quantity - 1 });
    } else {
      removeFromCartMutation.mutate(item.id);
    }
  };

  const handleRemoveItem = (id: number) => {
    removeFromCartMutation.mutate(id);
  };

  return (
    <div 
      className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="font-serif text-xl font-bold">Your Cart ({cart?.items.length || 0})</h2>
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a4d2e]"></div>
            </div>
          ) : cart?.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300 mb-4">
                <circle cx="8" cy="21" r="1"></circle>
                <circle cx="19" cy="21" r="1"></circle>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
              </svg>
              <p className="text-neutral-500">Your cart is empty</p>
              <Button 
                onClick={onClose}
                className="mt-4 bg-[#1a4d2e] hover:bg-[#2a5d3e]"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {cart.items.map((item) => (
                <div key={item.id} className="flex border-b border-neutral-200 pb-4 mb-4">
                  <img 
                    src={item.book.coverImage} 
                    alt={item.book.title} 
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-neutral-800">{item.book.title}</h3>
                        <p className="text-sm text-neutral-500">{item.book.author}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-neutral-400 hover:text-neutral-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border border-neutral-200 rounded-md">
                        <button 
                          onClick={() => handleDecreaseQuantity(item)}
                          className="px-2 py-1 text-neutral-500 hover:text-neutral-800"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border-x border-neutral-200">{item.quantity}</span>
                        <button 
                          onClick={() => handleIncreaseQuantity(item)}
                          className="px-2 py-1 text-neutral-500 hover:text-neutral-800"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-medium">
                        ${(item.book.discountedPrice || item.book.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        
        {cart?.items.length > 0 && (
          <div className="border-t border-neutral-200 p-4">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium">${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Shipping</span>
                <span className="font-medium">$4.99</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Tax</span>
                <span className="font-medium">${(cart.total * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-200">
                <span>Total</span>
                <span>${(cart.total + 4.99 + cart.total * 0.1).toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout">
              <Button
                onClick={onClose} 
                className="w-full bg-[#1a4d2e] hover:bg-[#2a5d3e] text-white py-3 rounded-lg font-medium transition-colors"
              >
                Proceed to Checkout
              </Button>
            </Link>
            <Button
              onClick={onClose}
              variant="outline" 
              className="w-full mt-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2 rounded-lg transition-colors"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
