"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Trash2, ShieldBan, ShieldCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, SortableHeader } from "@/components/admin/data-table";
import { formatDate } from "@/lib/formatters";
import {
  updateUserRole,
  deleteUser,
  toggleUserDisabled,
} from "@/app/admin/actions";
import type { Profile } from "@/types/user";

function RoleCell({ user }: { user: Profile }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(role: string) {
    startTransition(async () => {
      const result = await updateUserRole(
        user.id,
        role as "customer" | "admin"
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Role updated to ${role}`);
        router.refresh();
      }
    });
  }

  return (
    <Select
      value={user.role}
      onValueChange={handleRoleChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-30">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="customer">Customer</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}

function ActionsCell({
  user,
  isBanned,
  isCurrentUser,
}: {
  user: Profile;
  isBanned: boolean;
  isCurrentUser: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleToggleDisabled() {
    startTransition(async () => {
      const result = await toggleUserDisabled(user.id, !isBanned);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isBanned ? "User enabled" : "User disabled");
        router.refresh();
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUser(user.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User deleted");
        setDeleteOpen(false);
        router.refresh();
      }
    });
  }

  if (isCurrentUser) {
    return <span className="text-xs text-muted-foreground">You</span>;
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleDisabled}
        disabled={isPending}
        title={isBanned ? "Enable user" : "Disable user"}
      >
        {isBanned ? (
          <ShieldBan className="h-4 w-4 text-yellow-600" />
        ) : (
          <ShieldCheck className="h-4 w-4 text-green-600" />
        )}
      </Button>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            title="Delete user"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold">
                {user.full_name || user.email}
              </span>
              &apos;s account and all associated data (profile, addresses, cart,
              wishlist). Order history will be preserved. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function createColumns(
  bannedUserIds: string[],
  currentUserId?: string
): ColumnDef<Profile>[] {
  const bannedSet = new Set(bannedUserIds);

  return [
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <SortableHeader column={column}>Name</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.full_name || "No name"}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <SortableHeader column={column}>Email</SortableHeader>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <RoleCell user={row.original} />,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const isBanned = bannedSet.has(row.original.id);
        return isBanned ? (
          <Badge variant="destructive">Disabled</Badge>
        ) : (
          <Badge variant="secondary">Active</Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <SortableHeader column={column}>Joined</SortableHeader>
      ),
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionsCell
          user={row.original}
          isBanned={bannedSet.has(row.original.id)}
          isCurrentUser={row.original.id === currentUserId}
        />
      ),
    },
  ];
}

function UserMobileCard({
  user,
  bannedSet,
  currentUserId,
}: {
  user: Profile;
  bannedSet: Set<string>;
  currentUserId?: string;
}) {
  const isBanned = bannedSet.has(user.id);

  return (
    <div className="rounded-md border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {user.full_name || "No name"}
        </span>
        {isBanned ? (
          <Badge variant="destructive">Disabled</Badge>
        ) : (
          <Badge variant="secondary">Active</Badge>
        )}
      </div>
      <p className="truncate text-sm text-muted-foreground">{user.email}</p>
      <div className="flex items-center justify-between">
        <RoleCell user={user} />
        <ActionsCell
          user={user}
          isBanned={isBanned}
          isCurrentUser={user.id === currentUserId}
        />
      </div>
    </div>
  );
}

interface UsersTableProps {
  users: Profile[];
  bannedUserIds: string[];
  currentUserId?: string;
}

export function UsersTable({
  users,
  bannedUserIds,
  currentUserId,
}: UsersTableProps) {
  const columns = createColumns(bannedUserIds, currentUserId);
  const bannedSet = new Set(bannedUserIds);

  return (
    <DataTable
      columns={columns}
      data={users}
      mobileCard={(user) => (
        <UserMobileCard
          user={user}
          bannedSet={bannedSet}
          currentUserId={currentUserId}
        />
      )}
    />
  );
}
