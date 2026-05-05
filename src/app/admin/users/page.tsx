"use client";

import { useState } from "react";
import { useUsers } from "@/features/user/api/userApi";
import { UserTable } from "@/features/user/ui/UserTable";
import { CreateUserModal } from "@/features/user/ui/CreateUserModal";
import { EditUserModal } from "@/features/user/ui/EditUserModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, ShieldAlert } from "lucide-react";
import { User } from "@/entities/user/model/user.model";
import { useAuthStore } from "@/features/auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const { data: users, isLoading, error } = useUsers();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  // Guard: Đợi cho đến khi có thông tin user hoặc hết loading
  if (isLoading && !currentUser) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Truy cập bị từ chối</h1>
        <p className="text-muted-foreground">Bạn không có quyền quản trị để xem trang này.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân sự hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-destructive">
              Lỗi khi tải danh sách người dùng.
            </div>
          ) : (
            <UserTable users={users || []} onEdit={handleEdit} />
          )}
        </CardContent>
      </Card>

      <CreateUserModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />
      
      <EditUserModal 
        user={selectedUser} 
        open={editModalOpen} 
        onOpenChange={setEditModalOpen} 
      />
    </div>
  );
}
