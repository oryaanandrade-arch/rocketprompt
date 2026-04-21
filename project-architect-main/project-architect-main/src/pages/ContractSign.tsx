import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle, FileText, AlertCircle } from "lucide-react";

interface ContractData {
  id: string;
  client_name: string;
  client_email: string;
  service_type: string;
  project_description: string;
  deadline: string | null;
  contract_value: number;
  payment_conditions: string | null;
  contract_content: string;
  status: string;
  sign_token: string;
  signed_at: string | null;
  created_at: string;
}

const ContractSign = () => {
  const { token } = useParams<{ token: string }>();
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [notes, setNotes] = useState("");
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchContract();
  }, [token]);

  const fetchContract = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(
        `${supabaseUrl}/functions/v1/sign-contract?token=${token}`,
        {
          headers: {
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setContract(data.contract);
      if (data.contract.status === "signed") setSigned(true);
    } catch (err: any) {
      setError(err.message || "Contrato não encontrado");
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!accepted || !token) return;
    setSigning(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(
        `${supabaseUrl}/functions/v1/sign-contract`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ token, client_notes: notes || undefined }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSigned(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-card border-border">
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-semibold mb-2">Erro</p>
            <p className="text-muted-foreground text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-card border-border">
          <CardContent className="flex flex-col items-center py-12">
            <CheckCircle className="h-16 w-16 text-success mb-4" />
            <p className="text-2xl font-bold mb-2">Contrato Assinado!</p>
            <p className="text-muted-foreground text-center">
              O contrato foi assinado com sucesso. Você receberá uma confirmação em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <FileText className="h-10 w-10 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Contrato de Serviços</h1>
          <p className="text-muted-foreground">
            Revise o contrato abaixo e confirme sua assinatura
          </p>
        </div>

        {/* Contract Info */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <p className="text-muted-foreground">Cliente</p>
                <p className="font-medium">{contract?.client_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Serviço</p>
                <p className="font-medium">{contract?.service_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valor</p>
                <p className="font-medium">
                  R$ {Number(contract?.contract_value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Prazo</p>
                <p className="font-medium">{contract?.deadline || "A combinar"}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">Termos do Contrato</p>
              <ScrollArea className="h-[400px]">
                <div className="text-sm whitespace-pre-wrap leading-relaxed pr-4">
                  {contract?.contract_content}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Signing Section */}
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea
                placeholder="Adicione observações ou comentários..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="accept"
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v === true)}
              />
              <Label htmlFor="accept" className="text-sm leading-relaxed cursor-pointer">
                Li e concordo com todos os termos e condições descritos neste contrato. 
                Confirmo que as informações estão corretas e aceito as obrigações aqui estabelecidas.
              </Label>
            </div>

            <Button
              onClick={handleSign}
              disabled={!accepted || signing}
              className="w-full gap-2"
              size="lg"
            >
              {signing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Assinando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Assinar Contrato
                </>
              )}
            </Button>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractSign;
