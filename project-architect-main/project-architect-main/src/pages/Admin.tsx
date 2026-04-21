import { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Shield, Users, Crown, UserCheck, UserX, Loader2, Edit2, Search, Filter, 
  ArrowUpDown, Phone, Mail, MailCheck, MailX, Ban, CheckCircle, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useAdminUsers, useUpdateUserSubscription, useUpdateUserRole, useBlockUser, AdminUser } from "@/hooks/useAdminData";
import type { SubscriptionPlan, SubscriptionStatus } from "@/hooks/useSubscription";

type SortField = "name" | "email" | "created_at" | "status";
type SortOrder = "asc" | "desc";
type FilterStatus = "all" | "active" | "inactive" | "blocked" | "unverified";

export default function Admin() {
  const { isAdmin, isLoading: isRoleLoading } = useIsAdmin();
  const { data: users, isLoading: isUsersLoading } = useAdminUsers();
  const updateSubscription = useUpdateUserSubscription();
  const updateRole = useUpdateUserRole();
  const blockUser = useBlockUser();

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | "">("");
  const [selectedStatus, setSelectedStatus] = useState<SubscriptionStatus | "">("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "moderator" | "user" | "">("");
  const [blockReason, setBlockReason] = useState("");

  // Filters and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  if (isRoleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setSelectedPlan(user.subscription?.plan || "");
    setSelectedStatus(user.subscription?.status || "");
    setSelectedRole(user.role?.role || "");
    setBlockReason(user.profile?.blocked_reason || "");
  };

  const handleSaveChanges = async () => {
    if (!editingUser) return;

    if (selectedPlan && selectedStatus) {
      await updateSubscription.mutateAsync({
        userId: editingUser.id,
        plan: selectedPlan as SubscriptionPlan,
        status: selectedStatus as SubscriptionStatus,
      });
    }

    if (selectedRole) {
      await updateRole.mutateAsync({
        userId: editingUser.id,
        role: selectedRole as "admin" | "moderator" | "user",
      });
    }

    setEditingUser(null);
  };

  const handleToggleBlock = async (user: AdminUser) => {
    const isBlocked = user.profile?.is_blocked || false;
    await blockUser.mutateAsync({
      userId: user.id,
      blocked: !isBlocked,
      blockedReason: !isBlocked ? blockReason : undefined,
    });
    setEditingUser(null);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return [];

    let filtered = [...users];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email?.toLowerCase().includes(query) ||
          user.profile?.full_name?.toLowerCase().includes(query) ||
          user.profile?.phone_number?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((user) => {
        switch (filterStatus) {
          case "active":
            return user.subscription?.status === "active" || user.subscription?.status === "trialing";
          case "inactive":
            return !user.subscription || user.subscription.status === "cancelled" || user.subscription.status === "expired";
          case "blocked":
            return user.profile?.is_blocked === true;
          case "unverified":
            return !user.email_verified;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "name":
          comparison = (a.profile?.full_name || "").localeCompare(b.profile?.full_name || "");
          break;
        case "email":
          comparison = (a.email || "").localeCompare(b.email || "");
          break;
        case "created_at":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "status":
          const aActive = a.subscription?.status === "active" ? 1 : 0;
          const bActive = b.subscription?.status === "active" ? 1 : 0;
          comparison = aActive - bActive;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [users, searchQuery, filterStatus, sortField, sortOrder]);

  const activeSubscriptions = users?.filter(u => u.subscription?.status === "active").length || 0;
  const blockedUsers = users?.filter(u => u.profile?.is_blocked).length || 0;
  const unverifiedEmails = users?.filter(u => !u.email_verified).length || 0;
  const totalUsers = users?.length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Painel de Administração</h1>
          <p className="text-muted-foreground">Gerencie usuários, assinaturas e permissões</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Não Verificados</CardTitle>
            <MailX className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{unverifiedEmails}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Bloqueados</CardTitle>
            <Ban className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{blockedUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
          <CardDescription>Gerencie as assinaturas, permissões e bloqueios dos usuários</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Plano Ativo</SelectItem>
                  <SelectItem value="inactive">Sem Plano</SelectItem>
                  <SelectItem value="unverified">Email Não Verificado</SelectItem>
                  <SelectItem value="blocked">Bloqueados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Exibindo {filteredAndSortedUsers.length} de {totalUsers} usuários
          </div>

          {isUsersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-1 -ml-3"
                        onClick={() => handleSort("name")}
                      >
                        Usuário
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Verificação</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-1 -ml-3"
                        onClick={() => handleSort("status")}
                      >
                        Status
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>Permissão</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-1 -ml-3"
                        onClick={() => handleSort("created_at")}
                      >
                        Cadastro
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className={user.profile?.is_blocked ? "bg-destructive/5" : ""}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.profile?.is_blocked && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Ban className="h-4 w-4 text-destructive" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Usuário bloqueado</p>
                                {user.profile.blocked_reason && (
                                  <p className="text-xs text-muted-foreground">{user.profile.blocked_reason}</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <div>
                            <p className="font-medium">{user.profile?.full_name || "Sem nome"}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[120px]">{user.email}</span>
                          </div>
                          {user.profile?.phone_number && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{user.profile.phone_number}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger>
                            {user.email_verified ? (
                              <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                                <MailCheck className="h-3 w-3" />
                                Verificado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-600">
                                <MailX className="h-3 w-3" />
                                Pendente
                              </Badge>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {user.email_verified 
                              ? `Verificado em ${user.email_confirmed_at ? format(new Date(user.email_confirmed_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "—"}`
                              : "Email ainda não foi verificado"
                            }
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {user.subscription ? (
                          <Badge variant="outline" className="capitalize">
                            {user.subscription.plan === "monthly" && "Mensal"}
                            {user.subscription.plan === "quarterly" && "Trimestral"}
                            {user.subscription.plan === "lifetime" && "Vitalício"}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Nenhum</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.profile?.is_blocked ? (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="h-3 w-3" />
                            Bloqueado
                          </Badge>
                        ) : (
                          <Badge
                            variant={user.subscription?.status === "active" ? "default" : "secondary"}
                            className={user.subscription?.status === "active" ? "bg-primary" : ""}
                          >
                            {user.subscription?.status === "active" && "Ativo"}
                            {user.subscription?.status === "cancelled" && "Cancelado"}
                            {user.subscription?.status === "expired" && "Expirado"}
                            {user.subscription?.status === "trialing" && "Trial"}
                            {!user.subscription && "Inativo"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role?.role === "admin" ? "default" : "outline"}
                          className={user.role?.role === "admin" ? "bg-accent" : ""}
                        >
                          {user.role?.role === "admin" && (
                            <>
                              <Crown className="h-3 w-3 mr-1" />
                              Admin
                            </>
                          )}
                          {user.role?.role === "moderator" && "Moderador"}
                          {(!user.role || user.role.role === "user") && "Usuário"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(user)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAndSortedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere o plano, status ou permissões de {editingUser?.profile?.full_name || editingUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* User Info Summary */}
            <div className="rounded-lg bg-muted p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{editingUser?.email}</span>
                {editingUser?.email_verified ? (
                  <MailCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <MailX className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              {editingUser?.profile?.phone_number && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{editingUser.profile.phone_number}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as SubscriptionPlan)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="lifetime">Vitalício</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status da Assinatura</Label>
              <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as SubscriptionStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="trialing">Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Permissão</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as "admin" | "moderator" | "user")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a permissão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="moderator">Moderador</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Block User Section */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-2">
                {editingUser?.profile?.is_blocked ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : (
                  <Ban className="h-4 w-4 text-muted-foreground" />
                )}
                <Label>Bloqueio de Acesso</Label>
              </div>
              
              {!editingUser?.profile?.is_blocked && (
                <Textarea
                  placeholder="Motivo do bloqueio (opcional)"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="min-h-[60px]"
                />
              )}

              <Button
                variant={editingUser?.profile?.is_blocked ? "outline" : "destructive"}
                className="w-full"
                onClick={() => editingUser && handleToggleBlock(editingUser)}
                disabled={blockUser.isPending}
              >
                {blockUser.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : editingUser?.profile?.is_blocked ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Desbloquear Usuário
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    Bloquear Usuário
                  </>
                )}
              </Button>

              {editingUser?.profile?.is_blocked && editingUser.profile.blocked_reason && (
                <div className="text-sm text-muted-foreground bg-destructive/10 p-2 rounded">
                  <strong>Motivo:</strong> {editingUser.profile.blocked_reason}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={updateSubscription.isPending || updateRole.isPending}
            >
              {(updateSubscription.isPending || updateRole.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}