"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { useUnifiedShop } from "~/hooks/use-unified-shop"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar"
import { ROLES, type Role } from "~/lib/roles"
import { 
  Loader2, 
  Plus, 
  Mail, 
  Users, 
  UserPlus, 
  Trash2, 
  MoreHorizontal,
  Crown,
  User,
  Search,
  Shield,
  Settings,
  Calendar,
  Mail as MailIcon,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import { api } from "~/trpc/react"
import { Separator } from "~/components/ui/separator"

const roleConfig = {
  [ROLES.ADMIN]: {
    label: "Admin",
    description: "Full access to all features including team management",
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    icon: Crown,
    bgColor: "bg-red-100 dark:bg-red-900/20",
    badgeVariant: "destructive" as const,
  },
  [ROLES.MEMBER]: {
    label: "Member",
    description: "Can process transactions and manage inventory",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    icon: User,
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    badgeVariant: "secondary" as const,
  },
}

interface TeamMember {
  id: string
  name: string | null
  email: string
  role: Role
  databaseId: number
  joinedAt: Date
  membershipId: string | null
  avatarUrl: string | null
  firstName: string | null
  lastName: string | null
  isCurrentUser: boolean
}

export default function TeamPage() {
  const router = useRouter()
  const { user: currentUser } = useUser()
  const { hasShop, shopName, isLoaded: shopLoaded } = useUnifiedShop()
  
  // Call all hooks first - they must be called in the same order every time
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role | "all">("all")
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    role: ROLES.MEMBER as Role,
  })
  const [isInviting, setIsInviting] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [roleUpdateDialogOpen, setRoleUpdateDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)

  // Fetch team data - enable when user has shop membership (database or Clerk)
  const { data: teamData, refetch: refetchTeam, error: teamError, isLoading: teamLoading } = api.team.getMembers.useQuery({
    search: searchQuery || undefined,
    role: selectedRole !== "all" ? selectedRole : undefined,
  }, {
    enabled: hasShop, // Enable when user has shop membership
    retry: false,
  })

  // Fetch current user's role and permissions - enable when user has shop membership
  const { data: userRoleData, error: roleError } = api.team.getCurrentUserRole.useQuery(undefined, {
    enabled: hasShop, // Enable when user has shop membership
    retry: false,
  })

  // Mutations
  const inviteMember = api.team.inviteMember.useMutation({
    onSuccess: () => {
      toast.success("Invitation sent successfully!")
      setInviteForm({ email: "", name: "", role: ROLES.MEMBER })
      setInviteDialogOpen(false)
      void refetchTeam()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateMemberRole = api.team.updateMemberRole.useMutation({
    onSuccess: () => {
      toast.success("Role updated successfully")
      setRoleUpdateDialogOpen(false)
      setSelectedMember(null)
      void refetchTeam()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const removeMember = api.team.removeMember.useMutation({
    onSuccess: () => {
      toast.success("Member removed successfully")
      setRemoveDialogOpen(false)
      setSelectedMember(null)
      void refetchTeam()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Filtered and sorted members
  const filteredMembers = useMemo(() => {
    if (!teamData?.members) return []
    
    let members = teamData.members as TeamMember[]
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      members = members.filter(member => 
        member.name?.toLowerCase().includes(query) ??
        member.email.toLowerCase().includes(query)
      )
    }
    
    // Filter by role
    if (selectedRole !== "all") {
      members = members.filter(member => member.role === selectedRole)
    }
    
    // Sort: admins first, then by name
    return members.sort((a, b) => {
      if (a.role === ROLES.ADMIN && b.role !== ROLES.ADMIN) return -1
      if (a.role !== ROLES.ADMIN && b.role === ROLES.ADMIN) return 1
      return (a.name ?? a.email).localeCompare(b.name ?? b.email)
    })
  }, [teamData?.members, searchQuery, selectedRole])

  // Now handle conditional rendering after all hooks are called
  // Show loading while shop membership is being determined
  if (!shopLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading team management...</p>
        </div>
      </div>
    );
  }

  // Show error if user has no shop membership
  if (!hasShop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need to be a member of a shop to access team management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You don&apos;t have access to any shops. Please contact your shop administrator for access.
            </p>
            <Button 
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handlers
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteForm.email.trim()) return

    setIsInviting(true)
    try {
      await inviteMember.mutateAsync({
        email: inviteForm.email.trim(),
        name: inviteForm.name.trim() || undefined,
        role: inviteForm.role,
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleRoleUpdate = (member: TeamMember, newRole: Role) => {
    setSelectedMember(member)
    setRoleUpdateDialogOpen(true)
  }

  const confirmRoleUpdate = () => {
    if (!selectedMember) return
    updateMemberRole.mutate({ 
      userId: selectedMember.id, 
      role: selectedMember.role === ROLES.ADMIN ? ROLES.MEMBER : ROLES.ADMIN 
    })
  }

  const handleRemoveMember = (member: TeamMember) => {
    setSelectedMember(member)
    setRemoveDialogOpen(true)
  }

  const confirmRemoveMember = () => {
    if (!selectedMember) return
    removeMember.mutate({ userId: selectedMember.id })
  }

  const getInitials = (member: TeamMember) => {
    if (member.firstName && member.lastName) {
      return `${member.firstName[0]}${member.lastName[0]}`
    }
    if (member.name) {
      return member.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    }
    return member.email?.[0]?.toUpperCase() ?? ''
  }

  const getDisplayName = (member: TeamMember) => {
    if (member.firstName && member.lastName) {
      return `${member.firstName} ${member.lastName}`
    }
    return member.name ?? member.email
  }

  // Permissions
  const canInvite = userRoleData?.permissions.canInviteMembers
  const canManageRoles = userRoleData?.permissions.canManageRoles
  const canRemoveMembers = userRoleData?.permissions.canRemoveMembers

  // Error states
  if (roleError?.data?.code === "FORBIDDEN" || teamError?.data?.code === "FORBIDDEN") {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Team Management</h1>
            <p className="text-muted-foreground">
              Team management requires admin privileges. Please contact your shop administrator if you need access.
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don&apos;t have permission to view or manage team members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Team management requires admin privileges. Please contact your shop administrator if you need access.
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (roleError || teamError) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Team Management</h1>
            <p className="text-muted-foreground">
              Error loading team information.
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              Unable to load team information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {roleError?.message ?? teamError?.message ?? "An unexpected error occurred."}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members, roles, and permissions.
          </p>
        </div>
        {canInvite && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team. They&apos;ll receive an email with a link to accept.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name (Optional)
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Full name"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    Role
                  </label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value: Role) => setInviteForm(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ROLES.MEMBER}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Member
                        </div>
                      </SelectItem>
                      <SelectItem value={ROLES.ADMIN}>
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isInviting || !inviteForm.email.trim()}>
                    {isInviting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search members by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={(value: Role | "all") => setSelectedRole(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value={ROLES.ADMIN}>Admins</SelectItem>
                <SelectItem value={ROLES.MEMBER}>Members</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} in your team
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Crown className="h-4 w-4" />
                {filteredMembers.filter(m => m.role === ROLES.ADMIN).length} Admin{filteredMembers.filter(m => m.role === ROLES.ADMIN).length !== 1 ? 's' : ''}
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {filteredMembers.filter(m => m.role === ROLES.MEMBER).length} Member{filteredMembers.filter(m => m.role === ROLES.MEMBER).length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {teamLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="space-y-3">
              {filteredMembers.map((member) => {
                const roleInfo = roleConfig[member.role]
                const RoleIcon = roleInfo.icon
                
                // Ensure roleInfo exists
                if (!roleInfo) {
                  console.warn(`Unknown role: ${member.role} for member ${member.email}`)
                  return null
                }
                
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatarUrl ?? undefined} alt={getDisplayName(member)} />
                        <AvatarFallback className={`${roleInfo.bgColor}`}>
                          {getInitials(member)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{getDisplayName(member)}</h3>
                          {member.isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={roleInfo.badgeVariant} className="text-xs">
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {roleInfo.label}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Joined {member.joinedAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {member.isCurrentUser ? (
                        <Badge variant="outline" className="text-xs">
                          Current User
                        </Badge>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {canManageRoles && (
                              <DropdownMenuItem
                                onClick={() => handleRoleUpdate(member, member.role === ROLES.ADMIN ? ROLES.MEMBER : ROLES.ADMIN)}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                {member.role === ROLES.ADMIN ? 'Remove Admin' : 'Make Admin'}
                              </DropdownMenuItem>
                            )}
                            {canRemoveMembers && (
                              <DropdownMenuItem
                                onClick={() => handleRemoveMember(member)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove from Team
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No team members found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedRole !== "all" 
                  ? "Try adjusting your search or filters."
                  : "Get started by inviting your first team member."
                }
              </p>
              {canInvite && !searchQuery && selectedRole === "all" && (
                <Button onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite First Member
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Update Dialog */}
      <AlertDialog open={roleUpdateDialogOpen} onOpenChange={setRoleUpdateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Member Role</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedMember && (
                <>
                  Are you sure you want to change <strong>{getDisplayName(selectedMember)}</strong>&apos;s role from{' '}
                  <strong>{roleConfig[selectedMember.role].label}</strong> to{' '}
                  <strong>{roleConfig[selectedMember.role === ROLES.ADMIN ? ROLES.MEMBER : ROLES.ADMIN].label}</strong>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleUpdate}>
              Update Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedMember && (
                <>
                  Are you sure you want to remove <strong>{getDisplayName(selectedMember)}</strong> from your team?
                  This action cannot be undone and they will lose access to all shop features.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Debug Section - Remove in production */}
      {process.env.NODE_ENV === 'development' && teamData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug: Role Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <p><strong>Current User Role:</strong> {userRoleData?.role}</p>
              <p><strong>Total Members:</strong> {teamData.members.length}</p>
              <div className="space-y-1">
                <p><strong>Role Breakdown:</strong></p>
                {Object.entries(ROLES).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Badge variant={roleConfig[value].badgeVariant} className="text-xs">
                      {roleConfig[value].label}
                    </Badge>
                    <span>: {filteredMembers.filter(m => m.role === value).length} members</span>
                  </div>
                ))}
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer">Raw Member Data</summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                  {JSON.stringify(filteredMembers.map(m => ({
                    email: m.email,
                    role: m.role,
                    isCurrentUser: m.isCurrentUser,
                    hasAvatar: !!m.avatarUrl
                  })), null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How Invitations Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                For New Users (No Account)
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• User receives invitation email</li>
                <li>• Clicks invitation link</li>
                <li>• Clerk creates account automatically</li>
                <li>• User is immediately added to your team</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                For Existing Users (Has Account)
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• User receives invitation email</li>
                <li>• Clicks invitation link</li>
                <li>• Signs in to their existing account</li>
                <li>• User is added to your team</li>
              </ul>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-semibold">Important Notes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Users can only be in one shop at a time</li>
              <li>• If user is in another shop, they&apos;ll be moved automatically</li>
              <li>• Invitations expire after 7 days</li>
              <li>• Users must use the same email address that was invited</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 