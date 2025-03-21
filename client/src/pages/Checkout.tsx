import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CheckoutForm from "@/components/checkout/CheckoutForm";

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

const Checkout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: cart, isLoading } = useQuery<CartResponse>({
    queryKey: ["/api/cart"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      setIsProcessing(true);
      try {
        const response = await apiRequest("POST", "/api/orders", orderData);
        return response.json();
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Order completed",
        description: "Your order has been placed successfully!",
      });
      navigate(`/order-confirmation?orderId=${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to place order: ${error}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmitOrder = (formData: any) => {
    createOrderMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-[#1a4d2e] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="text-neutral-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                <circle cx="8" cy="21" r="1"></circle>
                <circle cx="19" cy="21" r="1"></circle>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-neutral-600 mb-6">You need to add items to your cart before checking out.</p>
            <button 
              onClick={() => navigate("/")}
              className="bg-[#1a4d2e] hover:bg-[#2a5d3e] text-white py-2 px-4 rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate totals
  const subtotal = cart.total;
  const shipping = 4.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-neutral-800 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6">
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex">
                      <img 
                        src={item.book.coverImage} 
                        alt={item.book.title} 
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="ml-4">
                        <h3 className="font-medium text-sm">{item.book.title}</h3>
                        <p className="text-neutral-500 text-xs mb-1">{item.book.author}</p>
                        <div className="flex justify-between">
                          <p className="text-sm">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium">
                            ${((item.book.discountedPrice || item.book.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Checkout Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <CheckoutForm onSubmit={handleSubmitOrder} isSubmitting={isProcessing} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
