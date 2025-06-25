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
import { useOrganization } from "@clerk/nextjs"
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
import { Loader2, Plus, Mail, Users, UserPlus, Trash2 } from "lucide-react"
import { api } from "~/trpc/react"
import { Separator } from "~/components/ui/separator"

const roleConfig = {
  [ROLES.ADMIN]: {
    label: "Admin",
    description: "Full access to all features including team management",
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    icon: IconCrown,
  },
  [ROLES.MEMBER]: {
    label: "Member",
    description: "Can process transactions and manage inventory",
    color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    icon: IconUserCheck,
  },
}

export default function TeamPage() {
  const router = useRouter()
  const { organization } = useOrganization()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role | "all">("all")
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    role: ROLES.MEMBER,
  })
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)

  // Fetch team data
  const { data: teamData, refetch: refetchTeam, error: teamError } = api.team.getMembers.useQuery({
    search: searchQuery || undefined,
    role: selectedRole !== "all" ? selectedRole : undefined,
  }, {
    enabled: !!organization, // Only run query if user has organization context
    retry: false, // Don't retry on failure
  })

  // Fetch current user's role and permissions
  const { data: userRoleData, error: roleError } = api.team.getCurrentUserRole.useQuery(undefined, {
    enabled: !!organization, // Only run query if user has organization context
    retry: false, // Don't retry on failure
  })

  // Invite member mutation
  const inviteMember = api.team.inviteMember.useMutation({
    onSuccess: () => {
      toast.success("Invitation sent successfully!")
      setInviteEmail("")
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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    try {
      await inviteMember.mutateAsync({
        email: inviteEmail.trim(),
        role: ROLES.MEMBER,
      })
    } finally {
      setIsInviting(false)
    }
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

  if (!organization) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Team Management</h1>
            <p className="text-muted-foreground">
              You need to be part of an organization to manage team members.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show error if user doesn't have admin permissions
  if (roleError?.data?.code === "FORBIDDEN" || teamError?.data?.code === "FORBIDDEN") {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Team Management</h1>
            <p className="text-muted-foreground">
              Admin privileges required to manage team members.
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view or manage team members.
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

  // Show error if there are other issues
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
              {roleError?.message || teamError?.message || "An unexpected error occurred."}
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
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your team members and send invitations.
          </p>
        </div>
      </div>

      {/* Invite New Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </CardTitle>
          <CardDescription>
            Send an invitation to join your team. The user will receive an email with a link to accept the invitation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex gap-4">
            <Input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={isInviting || !inviteEmail.trim()}>
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
          </form>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            Current members of your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamData && teamData.members.length > 0 ? (
            <div className="space-y-4">
              {teamData.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {member.name?.charAt(0) ?? member.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.name ?? "No name"}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Member</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No team members yet.</p>
              <p className="text-sm text-muted-foreground">
                Invite someone to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How Invitations Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">For New Users (No Account):</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• User receives invitation email</li>
              <li>• Clicks invitation link</li>
              <li>• Clerk creates account automatically</li>
              <li>• User is immediately added to your team</li>
              <li>• No manual sign-up step needed</li>
            </ul>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              💡 <strong>Recommended:</strong> Accept invitation first, then account is created automatically
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-semibold">For Existing Users (Has Account):</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• User receives invitation email</li>
              <li>• Clicks invitation link</li>
              <li>• Signs in to their existing account</li>
              <li>• User is added to your team</li>
              <li>• Can access your shop dashboard immediately</li>
            </ul>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              💡 <strong>Recommended:</strong> Accept invitation, then sign in to existing account
            </p>
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