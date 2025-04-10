
import { useState } from "react";
import Header from "@/components/Header";
import PollCard from "@/components/PollCard";
import { usePolls } from "@/context/PollContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PollForm from "@/components/PollForm";
import { Plus, LayoutGrid, LayoutList, History } from "lucide-react";

const Dashboard = () => {
  const { polls, templates } = usePolls();
  const { currentUser } = useAuth();
  const [showNewPollDialog, setShowNewPollDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("active");
  
  const isAdmin = currentUser?.isAdmin || false;
  
  const activePolls = polls.filter(poll => poll.isActive);
  const inactivePolls = polls.filter(poll => !poll.isActive);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Polls Dashboard</h1>
          
          {isAdmin && (
            <Button onClick={() => setShowNewPollDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create Poll
            </Button>
          )}
        </div>

        <Tabs defaultValue="active" className="w-full" onValueChange={(value) => setActiveTab(value)}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="active">Active Polls</TabsTrigger>
              {isAdmin && <TabsTrigger value="inactive">Inactive Polls</TabsTrigger>}
              {isAdmin && <TabsTrigger value="templates">Templates</TabsTrigger>}
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={viewMode === "grid" ? "bg-accent" : ""} 
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={viewMode === "list" ? "bg-accent" : ""} 
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="active">
            {activePolls.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No active polls</h3>
                <p className="text-muted-foreground mt-1">
                  {isAdmin 
                    ? "Create a new poll to get started" 
                    : "There are no active polls at the moment"}
                </p>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowNewPollDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Create Poll
                  </Button>
                )}
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : ""}`}>
                {activePolls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inactive">
            {inactivePolls.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No inactive polls</h3>
                <p className="text-muted-foreground mt-1">
                  Deactivated polls will appear here
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : ""}`}>
                {inactivePolls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates">
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No templates</h3>
                <p className="text-muted-foreground mt-1">
                  Save polls as templates to reuse them
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : ""}`}>
                {templates.map((template) => (
                  <PollCard key={template.id} poll={template} isTemplate={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showNewPollDialog} onOpenChange={setShowNewPollDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Poll</DialogTitle>
          </DialogHeader>
          <PollForm onClose={() => setShowNewPollDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
