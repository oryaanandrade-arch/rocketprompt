import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractsDashboard } from "@/components/contracts/ContractsDashboard";
import { CreateContractForm } from "@/components/contracts/CreateContractForm";
import { FileText, Plus } from "lucide-react";

const Contracts = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contratos Inteligentes</h1>
          <p className="text-muted-foreground mt-1">
            Gere, envie e gerencie contratos de forma automática
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="dashboard" className="gap-2">
              <FileText className="h-4 w-4" />
              Meus Contratos
            </TabsTrigger>
            <TabsTrigger value="create" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Contrato
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ContractsDashboard />
          </TabsContent>

          <TabsContent value="create">
            <CreateContractForm onSuccess={() => setActiveTab("dashboard")} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Contracts;
