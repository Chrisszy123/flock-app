import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Megaphone, Send, Radio } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { Role } from '@/types';

interface BroadcastForm {
  title: string;
  message: string;
  targetRole: Role | '';
}

export function BroadcastPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsApi.getNotifications({ page, limit: 20 }),
  });

  const sendMutation = useMutation({
    mutationFn: notificationsApi.createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setShowCreate(false);
      toast.success('Broadcast sent');
    },
    onError: () => toast.error('Failed to send broadcast'),
  });

  const { register, handleSubmit, reset } = useForm<BroadcastForm>({
    defaultValues: { targetRole: '' },
  });

  const onSubmit = (data: BroadcastForm) => {
    sendMutation.mutate({
      title: data.title,
      message: data.message,
      targetRole: data.targetRole || null,
    });
    reset();
  };

  const notifications = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Admin Broadcast</h1>
          <p className="text-secondary-400 mt-1">Send real-time notifications to users</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Send className="w-4 h-4 mr-2" />
          Send Broadcast
        </Button>
      </div>

      <Card className="p-4 border border-primary-500/20 bg-primary-500/5">
        <div className="flex items-center gap-3">
          <Radio className="w-5 h-5 text-primary-400 animate-pulse" />
          <p className="text-secondary-300 text-sm">
            Broadcasts are delivered in real-time via WebSocket to all connected users.
            Target specific roles or broadcast to everyone.
          </p>
        </div>
      </Card>

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Broadcast History</h2>
        {isLoading ? (
          <p className="text-secondary-400">Loading...</p>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Megaphone className="w-12 h-12" />}
            title="No broadcasts yet"
            description="Send your first broadcast notification"
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <Card key={notif.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{notif.title}</h3>
                      {notif.targetRole ? (
                        <Badge variant="secondary">{notif.targetRole} only</Badge>
                      ) : (
                        <Badge variant="primary">All users</Badge>
                      )}
                    </div>
                    <p className="text-secondary-300 mt-2">{notif.message}</p>
                    <p className="text-secondary-500 text-xs mt-2">
                      Sent by {notif.createdBy?.fullName} on{' '}
                      {format(new Date(notif.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <Pagination page={pagination.page} totalPages={pagination.totalPages} hasNext={pagination.hasNext} hasPrev={pagination.hasPrev} onPageChange={setPage} />
        )}
      </div>

      {/* Send Broadcast Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Send Broadcast">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" {...register('title', { required: true })} placeholder="Notification title" />
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">Message</label>
            <textarea
              {...register('message', { required: true })}
              rows={4}
              className="w-full bg-dark-800 border border-secondary-700 rounded-lg px-4 py-3 text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              placeholder="Write your broadcast message..."
            />
          </div>
          <Select label="Target Role (optional)" {...register('targetRole')}>
            <option value="">All Users</option>
            <option value="MEMBER">Members Only</option>
            <option value="WORKER">Workers Only</option>
            <option value="LEADER">Leaders Only</option>
            <option value="DIRECTORATE">Directorate Only</option>
            <option value="ADMIN">Admins Only</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={sendMutation.isPending} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
