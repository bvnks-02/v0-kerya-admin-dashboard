'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DataTable, Column } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { User } from '@/lib/types';
import { get } from '@/lib/api';
import { formatDate, formatPhoneNumber, capitalize } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await get<User[]>(`/users?page=${page}`);
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      admin: 'default',
      moderator: 'secondary',
      support: 'outline',
      analyst: 'outline',
    };
    return colors[role] || 'outline';
  };

  const columns: Column<User>[] = [
    {
      key: 'firstName',
      label: 'Name',
      render: (_, item) => `${item.firstName} ${item.lastName}`,
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (phone) => formatPhoneNumber(phone),
    },
    {
      key: 'role',
      label: 'Role',
      render: (role) => (
        <Badge variant={getRoleColor(role)}>
          {capitalize(role)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (date) => formatDate(date),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage admin team members</p>
        </div>

        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          emptyMessage="No users found"
          pagination={{
            current: page,
            total: Math.ceil(users.length / 10),
            onChange: setPage,
          }}
        />
      </div>
    </DashboardLayout>
  );
}
