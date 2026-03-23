import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Users, 
  Search, 
  Mail,
  Shield,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi } from '@/services/api';
import { handleApiError } from '@/lib/api';
import { 
  Button, 
  Input, 
  Select,
  Card, 
  CardHeader, 
  CardBody, 
  CardTitle,
  Modal,
  Pagination,
  LoadingSpinner,
  EmptyState,
  RoleBadge,
  WorkerStatusBadge
} from '@/components/ui';
import type { User, Role } from '@/types';

export function MembersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<Role>('MEMBER');

  // Get members
  const { data: members, isLoading } = useQuery({
    queryKey: ['members', page, search, roleFilter],
    queryFn: () => usersApi.searchMembers({
      page,
      limit: 10,
      search: search || undefined,
      role: roleFilter || undefined,
    }),
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      usersApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Role updated successfully');
      setIsRoleModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('User deleted');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });

  const handleRoleChange = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = () => {
    if (selectedUser) {
      updateRoleMutation.mutate({ id: selectedUser.id, role: newRole });
    }
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'MEMBER', label: 'Member' },
    { value: 'WORKER', label: 'Worker' },
    { value: 'LEADER', label: 'Leader' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Member Directory</h1>
        <p className="text-secondary-400 mt-1">Manage all church members</p>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={roleOptions}
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as Role | '');
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Members Table */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : !members?.data?.data.length ? (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="No members found"
              description={search ? 'Try adjusting your search criteria' : 'Members will appear here'}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.data.data.map((user: User) => (
                      <tr key={user.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-white">{user.fullName}</div>
                              <div className="flex items-center gap-1 text-sm text-secondary-400">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <RoleBadge role={user.role} />
                        </td>
                        <td>
                          {user.workerStatus !== 'NONE' && (
                            <WorkerStatusBadge status={user.workerStatus} />
                          )}
                        </td>
                        <td className="text-secondary-400">
                          {format(new Date(user.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRoleChange(user)}
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {members.data.pagination && (
                <Pagination
                  page={page}
                  totalPages={members.data.pagination.totalPages}
                  hasNext={members.data.pagination.hasNext}
                  hasPrev={members.data.pagination.hasPrev}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Role Change Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedUser(null);
        }}
        title="Change User Role"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-lg font-semibold">
                {selectedUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-white">{selectedUser.fullName}</div>
                <div className="text-sm text-secondary-400">{selectedUser.email}</div>
              </div>
            </div>

            <Select
              label="New Role"
              options={[
                { value: 'MEMBER', label: 'Member' },
                { value: 'WORKER', label: 'Worker' },
                { value: 'LEADER', label: 'Leader' },
                { value: 'ADMIN', label: 'Admin' },
              ]}
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsRoleModalOpen(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveRole}
                isLoading={updateRoleMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
