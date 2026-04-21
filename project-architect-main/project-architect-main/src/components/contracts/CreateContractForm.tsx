import { useState } from "react";
import { useCreateContract, CreateContractInput } from "@/hooks/useContracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";

const serviceTypes = [
  "Criação de Site",
  "Desenvolvimento de App",
  "Landing Page",
  "E-commerce",
  "Sistema Web (SaaS)",
  "Consultoria de Tecnologia",
  "Design UI/UX",
  "Manutenção e Suporte",
  "Automação",
  "Outro",
];

interface Props {
  onSuccess: () => void;
}

export function CreateContractForm({ onSuccess }: Props) {
  const createContract = useCreateContract();
  const [form, setForm] = useState<CreateContractInput>({
    client_name: "",
    client_email: "",
    service_type: "",
    project_description: "",
    deadline: "",
    contract_value: 0,
    payment_conditions: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_name || !form.client_email || !form.service_type || !form.project_description || !form.contract_value) {
      return;
    }
    await createContract.mutateAsync(form);
    onSuccess();
  };

  const update = (field: keyof CreateContractInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-card border-border max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Gerar Contrato com IA
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Preencha as informações e a IA gerará um contrato profissional automaticamente.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Cliente *</Label>
              <Input
                placeholder="João da Silva"
                value={form.client_name}
                onChange={(e) => update("client_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email do Cliente *</Label>
              <Input
                type="email"
                placeholder="joao@email.com"
                value={form.client_email}
                onChange={(e) => update("client_email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Serviço *</Label>
            <Select value={form.service_type} onValueChange={(v) => update("service_type", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de serviço" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descrição do Projeto *</Label>
            <Textarea
              placeholder="Descreva o projeto, funcionalidades e escopo..."
              value={form.project_description}
              onChange={(e) => update("project_description", e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Prazo de Entrega</Label>
              <Input
                placeholder="Ex: 30 dias"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                placeholder="5000"
                value={form.contract_value || ""}
                onChange={(e) => update("contract_value", Number(e.target.value))}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Condições de Pagamento</Label>
              <Input
                placeholder="Ex: 50% entrada + 50% entrega"
                value={form.payment_conditions}
                onChange={(e) => update("payment_conditions", e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={createContract.isPending} className="w-full gap-2" size="lg">
            {createContract.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando contrato com IA...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Gerar Contrato
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
