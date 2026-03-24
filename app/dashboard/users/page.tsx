'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DataTable, Column } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { AdminUser, AdminUsersResponse } from '@/lib/types';
import { listUsers } from '@/lib/api';
import { formatDate, formatPhoneNumber, capitalize } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await listUsers<AdminUsersResponse>({ page, page_size: 50 });
      setUsers(response.results);
      setTotalPages(Math.ceil(response.count / 50));
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
      host: 'secondary',
      guest: 'outline',
    };
    return colors[role] || 'outline';
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'username',
      label: 'Username',
      render: (username) => username || '—',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (phone) => (phone ? formatPhoneNumber(phone) : '—'),
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
      key: 'is_active',
      label: 'Status',
      render: (is_active) => (
        <Badge variant={is_active ? 'default' : 'destructive'}>
          {is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'is_email_verified',
      label: 'Email Verified',
      render: (is_email_verified) => (
        <Badge variant={is_email_verified ? 'default' : 'outline'}>
          {is_email_verified ? '✓ Verified' : 'Not Verified'}
        </Badge>
      ),
    },
    {
      key: 'is_phone_verified',
      label: 'Phone Verified',
      render: (is_phone_verified) => (
        <Badge variant={is_phone_verified ? 'default' : 'outline'}>
          {is_phone_verified ? '✓ Verified' : 'Not Verified'}
        </Badge>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (rating, row) => {
        const user = row as AdminUser;
        return `${(rating || 0).toFixed(1)}/5 (${user.rating_count} reviews)`;
      },
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (date) => formatDate(date),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage platform users (guests, hosts, admins)</p>
        </div>

        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          emptyMessage="No users found"
          pagination={{
            current: page,
            total: totalPages,
            onChange: setPage,
          }}
        />
      </div>
    </DashboardLayout>
  );
}
