import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Users, Crown, Shield, User, FileCheck, Briefcase } from 'lucide-react';

const GROUPS = ['GES', 'GDS', 'GTN', 'GTS'];

export default function UserRolesPanel() {
  const { getAllUsers, updateUserRole, isMaster, user: currentUser } = useAuth();

  const allUsers = getAllUsers();

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'master':
        return <Crown className="h-4 w-4 text-primary" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-success" />;
      case 'proposal_head':
        return <FileCheck className="h-4 w-4 text-info" />;
      case 'svp':
        return <Briefcase className="h-4 w-4 text-warning" />;
      case 'basic':
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'master':
        return 'border-primary text-primary';
      case 'admin':
        return 'border-success text-success';
      case 'proposal_head':
        return 'border-info text-info';
      case 'svp':
        return 'border-warning text-warning';
      case 'basic':
        return 'border-muted-foreground text-muted-foreground';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'master': return 'Master';
      case 'admin': return 'Admin';
      case 'proposal_head': return 'Proposal Head';
      case 'svp': return 'SVP';
      case 'basic': return 'Basic';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          User Roles Management
        </CardTitle>
        <CardDescription>
          Assign roles including Proposal Head (Step 1 approval) and SVP per group (Step 2 approval).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted/50 rounded-lg text-sm space-y-1">
          <p className="font-medium">Two-Step Approval Flow:</p>
          <p className="text-muted-foreground text-xs">1. <strong>Proposal Head</strong> reviews and approves first</p>
          <p className="text-muted-foreground text-xs">2. <strong>SVP</strong> (assigned per group) gives final approval</p>
          <p className="text-muted-foreground text-xs">3. <strong>Master</strong> can revert any approval</p>
        </div>
        <div className="space-y-3">
          {allUsers.map((u) => (
            <div 
              key={u.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getRoleIcon(u.role)}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isMaster && u.role !== 'master' ? (
                  <>
                    <Select
                      value={u.role}
                      onValueChange={(value: UserRole) => updateUserRole(u.id, value, value === 'svp' ? u.assignedGroup : undefined)}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="proposal_head">Proposal Head</SelectItem>
                        <SelectItem value="svp">SVP</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                      </SelectContent>
                    </Select>
                    {u.role === 'svp' && (
                      <Select
                        value={u.assignedGroup || ''}
                        onValueChange={(group) => updateUserRole(u.id, 'svp', group)}
                      >
                        <SelectTrigger className="w-[90px] h-8 text-xs">
                          <SelectValue placeholder="Group" />
                        </SelectTrigger>
                        <SelectContent>
                          {GROUPS.map(g => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getRoleBadgeColor(u.role)}>
                      {getRoleLabel(u.role)}
                    </Badge>
                    {u.role === 'svp' && u.assignedGroup && (
                      <Badge variant="secondary" className="text-xs">
                        {u.assignedGroup}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
