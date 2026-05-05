"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@/entities/user/model/user.model";
import { Switch } from "@/components/ui/switch";
import { 
  useUpdateUserStatus, 
  useDeleteUser 
} from "../api/userApi";
import { toast } from "sonner";
import { MoreHorizontal, Edit, Trash, RotateCcw } from "lucide-react";
import { useState } from "react";
import { ResetPasswordModal } from "@/features/admin/ui/ResetPasswordModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
}

export function UserTable({ users, onEdit }: UserTableProps) {
  const updateStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserIdForDelete, setSelectedUserIdForDelete] = useState<number | null>(null);

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateStatus.mutate({ id, status: newStatus }, {
      onSuccess: () => toast.success("Đã cập nhật trạng thái."),
      onError: () => toast.error("Lỗi khi cập nhật trạng thái.")
    });
  };

  const handleDelete = (id: number) => {
    setSelectedUserIdForDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUserIdForDelete) {
      deleteUser.mutate(selectedUserIdForDelete, {
        onSuccess: () => {
          toast.success("Đã xóa người dùng.");
          setDeleteDialogOpen(false);
        },
        onError: () => toast.error("Lỗi khi xóa người dùng.")
      });
    }
  };

  const handleResetPasswordClick = (user: User) => {
    setSelectedUserForReset(user);
    setResetModalOpen(true);
  };

  return (
    <div className="rounded-md border">
      <Table>
        {/* ... table content stays same until actions */}
        <TableHeader>
          <TableRow>
            <TableHead>Người dùng</TableHead>
            <TableHead>Email / SĐT</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{user.full_name || user.username}</span>
                  <span className="text-xs text-muted-foreground">@{user.username}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span>{user.email || "-"}</span>
                  <span className="text-xs text-muted-foreground">{user.phone || "-"}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' ? "destructive" : "secondary"}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch 
                    aria-label={`Trạng thái của ${user.username}`}
                    checked={user.status === 'active'} 
                    onCheckedChange={() => handleToggleStatus(user.id, user.status || 'active')}
                    disabled={updateStatus.isPending}
                  />
                  <span className="text-xs capitalize">{user.status}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button aria-label={`Sửa người dùng ${user.username}`} variant="ghost" size="icon" onClick={() => onEdit(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button aria-label={`Reset mật khẩu của ${user.username}`} variant="ghost" size="icon" onClick={() => handleResetPasswordClick(user)}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button aria-label={`Xóa người dùng ${user.username}`} variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(user.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Không tìm thấy người dùng nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ResetPasswordModal 
        user={selectedUserForReset} 
        open={resetModalOpen} 
        onOpenChange={setResetModalOpen} 
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa người dùng?"
        description="Hành động này không thể hoàn tác. Toàn bộ dữ liệu của người dùng này sẽ bị gỡ bỏ khỏi hệ thống."
        onConfirm={confirmDelete}
        confirmText="Xóa ngay"
        variant="destructive"
        isLoading={deleteUser.isPending}
      />
    </div>
  );
}
