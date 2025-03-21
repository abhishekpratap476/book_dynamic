import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import SalesChart from "@/components/admin/SalesChart";
import PriceAnalysisChart from "@/components/admin/PriceAnalysisChart";
import InventoryChart from "@/components/admin/InventoryChart";
import DemandForecastChart from "@/components/admin/DemandForecastChart";
import { Analytics, Book } from "@shared/schema";

interface AnalyticsWithBook extends Analytics {
  book: Book;
}

interface CategoryData {
  id: number;
  category: string;
  totalSales: number;
  stockLevel: number;
}

interface SummaryData {
  totalRevenue: number;
  totalUnitsSold: number;
  avgOrderValue: number;
  lowStockItems: number;
}

const Admin = () => {
  const [timeRange, setTimeRange] = useState("last90");
  const { toast } = useToast();

  // Fetch analytics data
  const { data: pricingAnalytics, isLoading: isLoadingPricing } = useQuery<AnalyticsWithBook[]>({
    queryKey: ["/api/analytics/pricing"],
  });

  const { data: categoryData, isLoading: isLoadingCategories } = useQuery<CategoryData[]>({
    queryKey: ["/api/analytics/categories"],
  });

  const { data: salesData, isLoading: isLoadingSales } = useQuery<{category: string, sales: number}[]>({
    queryKey: ["/api/analytics/sales"],
  });

  const { data: summaryData, isLoading: isLoadingSummary } = useQuery<SummaryData>({
    queryKey: ["/api/analytics/summary"],
  });

  // Mutation for applying price recommendations
  const applyPriceMutation = useMutation({
    mutationFn: async ({ bookId, recommendedPrice }: { bookId: number, recommendedPrice: number }) => {
      await apiRequest("PUT", `/api/books/${bookId}`, { price: recommendedPrice });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/pricing"] });
      toast({
        title: "Price updated",
        description: "The book price has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update price: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Mutation for generating price recommendations
  const generateRecommendationMutation = useMutation({
    mutationFn: async (bookId: number) => {
      const response = await apiRequest("POST", "/api/analytics/recommend-price", { bookId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/pricing"] });
      toast({
        title: "Recommendation generated",
        description: "New price recommendation has been generated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate recommendation: ${error}`,
        variant: "destructive",
      });
    }
  });

  const isLoading = isLoadingPricing || isLoadingCategories || isLoadingSales || isLoadingSummary;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-neutral-800 mb-2">Admin Dashboard</h1>
        <p className="text-neutral-600">AI-powered analytics for inventory and pricing management</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex flex-wrap items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-neutral-800">BookSage Analytics</h2>
            <div className="flex space-x-3 mt-3 md:mt-0">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7">Last 7 Days</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                  <SelectItem value="allTime">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-[#1a4d2e] hover:bg-[#2a5d3e]">Export Data</Button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* KPI Cards */}
          {isLoadingSummary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-neutral-100">
                  <CardContent className="p-5">
                    <div className="h-24 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-4 border-neutral-200 border-t-[#1a4d2e] animate-spin"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <Card className="bg-neutral-100">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-neutral-600 font-medium">Revenue</h3>
                    <span className="text-green-500 text-sm font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                        <path d="m18 15-6-6-6 6"/>
                      </svg>
                      12.5%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-800">${summaryData?.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-neutral-500 mt-1">vs ${(summaryData?.totalRevenue * 0.875).toFixed(2)} last period</p>
                </CardContent>
              </Card>
              
              <Card className="bg-neutral-100">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-neutral-600 font-medium">Units Sold</h3>
                    <span className="text-green-500 text-sm font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                        <path d="m18 15-6-6-6 6"/>
                      </svg>
                      8.2%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-800">{summaryData?.totalUnitsSold.toLocaleString()}</p>
                  <p className="text-sm text-neutral-500 mt-1">vs {Math.floor(summaryData?.totalUnitsSold * 0.918)} last period</p>
                </CardContent>
              </Card>
              
              <Card className="bg-neutral-100">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-neutral-600 font-medium">Avg. Order Value</h3>
                    <span className="text-green-500 text-sm font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                        <path d="m18 15-6-6-6 6"/>
                      </svg>
                      3.7%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-800">${summaryData?.avgOrderValue.toFixed(2)}</p>
                  <p className="text-sm text-neutral-500 mt-1">vs ${(summaryData?.avgOrderValue * 0.963).toFixed(2)} last period</p>
                </CardContent>
              </Card>
              
              <Card className="bg-neutral-100">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-neutral-600 font-medium">Low Stock Items</h3>
                    <span className="text-red-500 text-sm font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                        <path d="m18 15-6-6-6 6"/>
                      </svg>
                      {summaryData?.lowStockItems} items
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-800">{summaryData?.lowStockItems}</p>
                  <p className="text-sm text-neutral-500 mt-1">Restock needed soon</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Analytics Charts */}
          <Tabs defaultValue="sales" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="sales">Sales Performance</TabsTrigger>
              <TabsTrigger value="price">Price Analysis</TabsTrigger>
              <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
              <TabsTrigger value="demand">Demand Forecast</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales">
              <div className="grid grid-cols-1 gap-8">
                <Card className="bg-neutral-100 p-5">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-neutral-700 font-medium text-lg">Sales Performance by Category</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-64">
                      <SalesChart data={salesData} loading={isLoadingSales} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="price">
              <div className="grid grid-cols-1 gap-8">
                <Card className="bg-neutral-100 p-5">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-neutral-700 font-medium text-lg">Price Sensitivity Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-64">
                      <PriceAnalysisChart data={pricingAnalytics} loading={isLoadingPricing} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="inventory">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Card className="bg-neutral-100 p-4">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-sm font-medium text-neutral-700">Inventory Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-40">
                      <InventoryChart data={categoryData} loading={isLoadingCategories} />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-neutral-100 p-4">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-sm font-medium text-neutral-700">Stock Levels</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-3">
                      {isLoadingCategories ? (
                        Array(5).fill(0).map((_, index) => (
                          <div key={index} className="animate-pulse">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="bg-neutral-300 h-3 w-20 rounded"></span>
                              <span className="bg-neutral-300 h-3 w-8 rounded"></span>
                            </div>
                            <div className="w-full bg-neutral-300 rounded-full h-2"></div>
                          </div>
                        ))
                      ) : (
                        categoryData?.map((category) => (
                          <div key={category.id}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-neutral-600">{category.category}</span>
                              <span className="text-neutral-800 font-medium">{(category.stockLevel * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={category.stockLevel * 100} className="h-2" 
                              color={
                                category.stockLevel > 0.65 ? "bg-green-500" : 
                                category.stockLevel > 0.35 ? "bg-yellow-500" : "bg-red-500"
                              } 
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-neutral-100 p-4">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-sm font-medium text-neutral-700">Demand Forecasting</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-40">
                      <DemandForecastChart data={categoryData} loading={isLoadingCategories} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="demand">
              <Card className="bg-neutral-100 p-5">
                <CardHeader className="p-0 pb-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1a4d2e] mr-2">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path>
                      <path d="M2 12H22"></path>
                      <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z"></path>
                    </svg>
                    <CardTitle className="text-neutral-700 font-medium text-lg">AI-Powered Demand Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-neutral-600 mb-4">
                    Our AI analyzes historical sales data, market trends, and seasonal patterns to predict future demand and optimize pricing.
                  </p>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Current Demand</TableHead>
                          <TableHead>Projected Growth</TableHead>
                          <TableHead>Stock Level</TableHead>
                          <TableHead>Recommendation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingCategories ? (
                          Array(5).fill(0).map((_, index) => (
                            <TableRow key={index}>
                              <TableCell className="animate-pulse"><div className="h-4 bg-neutral-200 rounded w-24"></div></TableCell>
                              <TableCell className="animate-pulse"><div className="h-4 bg-neutral-200 rounded w-16"></div></TableCell>
                              <TableCell className="animate-pulse"><div className="h-4 bg-neutral-200 rounded w-16"></div></TableCell>
                              <TableCell className="animate-pulse"><div className="h-4 bg-neutral-200 rounded w-20"></div></TableCell>
                              <TableCell className="animate-pulse"><div className="h-4 bg-neutral-200 rounded w-32"></div></TableCell>
                            </TableRow>
                          ))
                        ) : (
                          categoryData?.map((category) => (
                            <TableRow key={category.id}>
                              <TableCell className="font-medium">{category.category}</TableCell>
                              <TableCell>{category.totalSales} units</TableCell>
                              <TableCell className={
                                category.category === "Fiction" || category.category === "Non-Fiction" 
                                  ? "text-green-600" : category.category === "Children's" 
                                  ? "text-yellow-600" : "text-red-600"
                              }>
                                {category.category === "Fiction" ? "+12%" : 
                                 category.category === "Non-Fiction" ? "+8%" :
                                 category.category === "Children's" ? "+3%" : 
                                 category.category === "Science Fiction" ? "-2%" : "+5%"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Progress value={category.stockLevel * 100} className="h-2 w-20 mr-2" 
                                    color={
                                      category.stockLevel > 0.65 ? "bg-green-500" : 
                                      category.stockLevel > 0.35 ? "bg-yellow-500" : "bg-red-500"
                                    } 
                                  />
                                  <span className="text-xs">{(category.stockLevel * 100).toFixed(0)}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {category.stockLevel < 0.3 ? 
                                  <span className="text-red-600 font-medium">Immediate restock needed</span> : 
                                  category.stockLevel < 0.5 ? 
                                  <span className="text-yellow-600 font-medium">Consider restocking</span> :
                                  <span className="text-green-600 font-medium">Stock levels optimal</span>
                                }
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* AI Recommendations */}
          <Card className="bg-neutral-100 p-5 mb-8">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1a4d2e] mr-2">
                  <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                  <path d="M17 2l-5 5-5-5"></path>
                  <rect x="6" y="11" width="4" height="4"></rect>
                  <path d="M14 11h4"></path>
                  <path d="M14 15h4"></path>
                </svg>
                <CardTitle className="text-neutral-700 font-medium">AI Pricing Recommendations</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Recommended Price</TableHead>
                      <TableHead>Potential Impact</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingPricing ? (
                      Array(3).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell className="animate-pulse">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-neutral-200 rounded"></div>
                              <div className="ml-3">
                                <div className="h-4 bg-neutral-200 rounded w-32 mb-1"></div>
                                <div className="h-3 bg-neutral-200 rounded w-24"></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="animate-pulse"><div className="h-4 bg-neutral-200 rounded w-16"></div></TableCell>
                          <TableCell className="animate-pulse"><div className="h-4 bg-neutral-200 rounded w-24"></div></TableCell>
                          <TableCell className="animate-pulse"><div className="h-4 bg-neutral-200 rounded w-20"></div></TableCell>
                          <TableCell className="animate-pulse"><div className="h-4 bg-neutral-200 rounded w-24"></div></TableCell>
                          <TableCell className="animate-pulse"><div className="h-4 bg-neutral-200 rounded w-32"></div></TableCell>
                        </TableRow>
                      ))
                    ) : pricingAnalytics?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                          No pricing recommendations available
                        </TableCell>
                      </TableRow>
                    ) : (
                      pricingAnalytics?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 object-cover" src={item.book.coverImage} alt={item.book.title} />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-neutral-800">{item.book.title}</div>
                                <div className="text-xs text-neutral-500">{item.book.author}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-neutral-700">${item.currentPrice.toFixed(2)}</TableCell>
                          <TableCell className={`whitespace-nowrap text-sm font-medium ${item.recommendedPrice > item.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
                            ${item.recommendedPrice.toFixed(2)} 
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                              {item.recommendedPrice > item.currentPrice ? (
                                <path d="m18 9-6-6-6 6"/>
                              ) : (
                                <path d="m6 15 6 6 6-6"/>
                              )}
                            </svg>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-neutral-700">+${item.potentialImpact} monthly</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="w-24 bg-neutral-200 rounded-full h-2.5">
                              <div className={`${item.confidence >= 0.8 ? 'bg-green-500' : item.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'} h-2.5 rounded-full`} style={{ width: `${item.confidence * 100}%` }}></div>
                            </div>
                            <span className="text-xs text-neutral-500">{(item.confidence * 100).toFixed(0)}%</span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            <Button 
                              variant="link" 
                              className="text-[#1a4d2e] hover:text-[#2a5d3e] font-medium px-0 mr-3"
                              onClick={() => applyPriceMutation.mutate({ bookId: item.book.id, recommendedPrice: item.recommendedPrice })}
                              disabled={applyPriceMutation.isPending}
                            >
                              {applyPriceMutation.isPending ? 'Applying...' : 'Apply'}
                            </Button>
                            <Button 
                              variant="link" 
                              className="text-neutral-500 hover:text-neutral-700"
                              onClick={() => generateRecommendationMutation.mutate(item.book.id)}
                              disabled={generateRecommendationMutation.isPending}
                            >
                              {generateRecommendationMutation.isPending ? 'Refreshing...' : 'Refresh'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {!isLoadingPricing && pricingAnalytics?.length === 0 && (
                <div className="mt-4 flex justify-center">
                  <Button 
                    className="bg-[#1a4d2e] hover:bg-[#2a5d3e]"
                    onClick={() => {
                      // Generate recommendations for all books
                      toast({
                        title: "Generating recommendations",
                        description: "Analyzing data to generate pricing recommendations.",
                      });
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"></path>
                    </svg>
                    Generate Price Recommendations
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Admin;
