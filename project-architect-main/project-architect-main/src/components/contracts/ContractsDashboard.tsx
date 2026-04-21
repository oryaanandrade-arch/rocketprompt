import { useState } from "react";
import { useContracts, useSendContractEmail, useUpdateContractStatus, useDeleteContract, Contract } from "@/hooks/useContracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, Eye, Trash2, Copy, FileText, XCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  viewed: "Visualizado",
  signed: "Assinado",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/10 text-primary",
  viewed: "bg-warning/10 text-warning",
  signed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

export function ContractsDashboard() {
  const { data: contracts, isLoading } = useContracts();
  const sendEmail = useSendContractEmail();
  const updateStatus = useUpdateContractStatus();
  const deleteContract = useDeleteContract();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const filtered = contracts?.filter((c) => {
    const matchSearch =
      c.client_name.toLowerCase().includes(search.toLowerCase()) ||
      c.service_type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: contracts?.length || 0,
    signed: contracts?.filter((c) => c.status === "signed").length || 0,
    pending: contracts?.filter((c) => ["draft", "sent", "viewed"].includes(c.status)).length || 0,
    totalValue: contracts?.filter((c) => c.status === "signed").reduce((sum, c) => sum + Number(c.contract_value), 0) || 0,
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/contract/${token}`);
    toast({ title: "Link copiado!" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.signed}</p>
            <p className="text-xs text-muted-foreground">Assinados</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              R$ {stats.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground">Valor Fechado</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou serviço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
            <SelectItem value="viewed">Visualizado</SelectItem>
            <SelectItem value="signed">Assinado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contract List */}
      {!filtered?.length ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum contrato encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((contract) => (
            <Card key={contract.id} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold truncate">{contract.client_name}</h3>
                      <Badge className={statusColors[contract.status]} variant="secondary">
                        {statusLabels[contract.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{contract.service_type}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>R$ {Number(contract.contract_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      <span>{format(new Date(contract.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                      {contract.signed_at && (
                        <span className="text-success">
                          Assinado em {format(new Date(contract.signed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedContract(contract)} title="Ver contrato">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => copyLink(contract.sign_token)} title="Copiar link">
                      <Copy className="h-4 w-4" />
                    </Button>
                    {contract.status === "draft" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => sendEmail.mutate(contract.id)}
                        disabled={sendEmail.isPending}
                        className="gap-1"
                      >
                        {sendEmail.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                        Enviar
                      </Button>
                    )}
                    {contract.status !== "signed" && (
                      <>
                        {contract.status !== "cancelled" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatus.mutate({ id: contract.id, status: "cancelled" })}
                            title="Cancelar"
                          >
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteContract.mutate(contract.id)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contract Detail Dialog */}
      <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Contrato - {selectedContract?.client_name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedContract?.client_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedContract?.client_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Serviço</p>
                  <p className="font-medium">{selectedContract?.service_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Valor</p>
                  <p className="font-medium">
                    R$ {Number(selectedContract?.contract_value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">Conteúdo do Contrato</p>
                <div className="bg-muted/30 p-4 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedContract?.contract_content}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
