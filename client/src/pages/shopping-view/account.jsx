import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import accImg from "../../assets/account.jpg";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import RecommendationSection from "@/components/shopping-view/recommendation-section";
import { useSelector } from "react-redux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, History, ShoppingBag, User } from "lucide-react";

function ShoppingAccount() {
  const { user } = useSelector((state) => state.auth);
  
  return (
    <div className="flex flex-col">
      <div className="relative h-[200px] md:h-[300px] w-full overflow-hidden">
        <img
          src={accImg}
          className="h-full w-full object-cover object-center"
          alt="Account background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome, {user?.userName}</h1>
        </div>
      </div>
      
      <div className="container mx-auto grid grid-cols-1 gap-8 py-8">
        {/* Recommendations Dashboard Card */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Your Personalized Recommendations</CardTitle>
            </div>
            <CardDescription>
              Based on your browsing history and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecommendationSection 
              userId={user?.id} 
              limit={4} 
              showHeading={false} 
            />
          </CardContent>
        </Card>
        
        {/* Main Account Tabs */}
        <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
          <Tabs defaultValue="orders">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="orders" className="data-[state=active]:bg-gray-200 data-[state=active]:text-gray-900">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="address" className="data-[state=active]:bg-gray-200 data-[state=active]:text-gray-900">
                <User className="h-4 w-4 mr-2" />
                Address
              </TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
              <ShoppingOrders />
            </TabsContent>
            <TabsContent value="address">
              <Address />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;
