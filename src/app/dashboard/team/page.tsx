"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  IconPlus,
  IconSearch,
  IconUserPlus,
  IconTrash,
  IconEdit,
  IconShield,
  IconUser,
  IconUsers,
  IconEye,
  IconMail,
  IconCalendar,
  IconCrown,
  IconUserCheck,
  IconUserX,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { api } from "~/trpc/react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
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
import { ROLES, type Role } from "~/lib/roles"

const roleConfig = {
  [ROLES.ADMIN]: {
    label: "Admin",
    description: "Full access to all features including team management",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: IconCrown,
  },
  [ROLES.MEMBER]: {
    label: "Member",
    description: "Can process transactions and manage inventory",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: IconUserCheck,
  },
}

export default function TeamPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role | "all">("all")
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    role: ROLES.MEMBER,
  })

  // Fetch team data
  const { data: teamData, refetch: refetchTeam } = api.team.getMembers.useQuery({
    search: searchQuery || undefined,
    role: selectedRole !== "all" ? selectedRole : undefined,
  })

  // Fetch current user's role and permissions
  const { data: userRoleData } = api.team.getCurrentUserRole.useQuery()

  // Mutations
  const inviteMember = api.team.inviteMember.useMutation({
    onSuccess: () => {
      toast.success("Invitation sent successfully")
      setInviteDialogOpen(false)
      setInviteForm({ email: "", name: "", role: ROLES.MEMBER })
      void refetchTeam()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateMemberRole = api.team.updateMemberRole.useMutation({
    onSuccess: () => {
      toast.success("Role updated successfully")
      void refetchTeam()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const removeMember = api.team.removeMember.useMutation({
    onSuccess: () => {
      toast.success("Member removed successfully")
      void refetchTeam()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleInvite = () => {
    if (!inviteForm.email) {
      toast.error("Email is required")
      return
    }
    inviteMember.mutate(inviteForm)
  }

  const handleRoleUpdate = (userId: string, newRole: Role) => {
    updateMemberRole.mutate({ userId, role: newRole })
  }

  const handleRemoveMember = (userId: string) => {
    removeMember.mutate({ userId })
  }

  const canInvite = userRoleData?.permissions.canInviteMembers
  const canManageRoles = userRoleData?.permissions.canManageRoles
  const canRemoveMembers = userRoleData?.permissions.canRemoveMembers

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your team members and their roles
          </p>
        </div>
        {canInvite && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconUserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team. They&apos;ll receive an email with instructions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Name (Optional)</label>
                  <Input
                    placeholder="Full name"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value) => setInviteForm({ ...inviteForm, role: value as "member" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ROLES.MEMBER}>
                        <div className="flex items-center gap-2">
                          <IconUserCheck className="h-4 w-4" />
                          Member
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleInvite}
                  disabled={inviteMember.isPending}
                >
                  {inviteMember.isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamData?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <IconCrown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamData?.members.filter(m => m.role === ROLES.ADMIN).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <IconUserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamData?.members.filter(m => m.role === ROLES.MEMBER).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team members and their access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role | "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.entries(roleConfig).map(([role, config]) => (
                  <SelectItem key={role} value={role}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Members Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamData?.members.map((member) => {
                  const roleInfo = roleConfig[member.role as keyof typeof roleConfig] || roleConfig[ROLES.MEMBER]
                  const RoleIcon = roleInfo.icon
                  
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <IconUser className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{member.name || "Unnamed User"}</div>
                            <div className="text-sm text-muted-foreground">ID: {member.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleInfo.color}>
                          <RoleIcon className="mr-1 h-3 w-3" />
                          {roleInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconMail className="h-4 w-4 text-muted-foreground" />
                          {member.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconCalendar className="h-4 w-4 text-muted-foreground" />
                          {member.joinedAt.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManageRoles && (
                            <Select
                              value={member.role}
                              onValueChange={(value) => handleRoleUpdate(member.id, value as Role)}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(roleConfig).map(([role, config]) => (
                                  <SelectItem key={role} value={role}>
                                    <div className="flex items-center gap-2">
                                      <config.icon className="h-4 w-4" />
                                      {config.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {canRemoveMembers && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <IconTrash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {member.name || member.email} from the team? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {(!teamData?.members || teamData.members.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <IconUsers className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No team members found</p>
                        {canInvite && (
                          <Button variant="outline" onClick={() => setInviteDialogOpen(true)}>
                            <IconUserPlus className="mr-2 h-4 w-4" />
                            Invite First Member
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding what each role can do in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(roleConfig).map(([role, config]) => {
              const RoleIcon = config.icon
              return (
                <div key={role} className="flex items-start gap-3 p-4 rounded-lg border">
                  <div className={`p-2 rounded-full ${config.color}`}>
                    <RoleIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{config.label}</h4>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 