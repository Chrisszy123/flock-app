import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import { permissionsApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ClipboardList, Plus, Check, X as XIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { PermissionStatus } from '@/types';

interface RequestForm {
  reason: string;
  startDate: string;
  endDate: string;
}

interface DecisionForm {
  decisionReason: string;
}

const statusVariant: Record<PermissionStatus, 'warning' | 'success' | 'destructive'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  DECLINED: 'destructive',
};

export function PermissionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [decisionType, setDecisionType] = useState<'APPROVED' | 'DECLINED'>('APPROVED');

  const isWorker = ['WORKER', 'LEADER', 'DIRECTORATE', 'ADMIN'].includes(user?.role ?? '');
  const canDecide = ['LEADER', 'DIRECTORATE', 'ADMIN'].includes(user?.role ?? '');

  // Fetch my requests
  const { data: myRequests } = useQuery({
    queryKey: ['permissions', 'my', page],
    queryFn: () => permissionsApi.getMyRequests({ page, limit: 10 }),
    enabled: isWorker,
  });

  // Fetch pending requests (for approvers)
  const { data: pendingRequests } = useQuery({
    queryKey: ['permissions', 'pending'],
    queryFn: () => permissionsApi.getPendingRequests({ limit: 50 }),
    enabled: canDecide,
  });

  const submitMutation = useMutation({
    mutationFn: permissionsApi.submitRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setShowCreate(false);
      toast.success('Permission request submitted');
    },
    onError: () => toast.error('Failed to submit request'),
  });

  const decideMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: 'APPROVED' | 'DECLINED'; decisionReason: string } }) =>
      permissionsApi.decideRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setDecidingId(null);
      toast.success('Decision recorded');
    },
    onError: () => toast.error('Failed to process decision'),
  });

  const requestForm = useForm<RequestForm>();
  const decisionForm = useForm<DecisionForm>();

  const onSubmitRequest = (data: RequestForm) => {
    submitMutation.mutate(data);
    requestForm.reset();
  };

  const onDecide = (data: DecisionForm) => {
    if (!decidingId) return;
    decideMutation.mutate({
      id: decidingId,
      data: { status: decisionType, decisionReason: data.decisionReason },
    });
    decisionForm.reset();
  };

  const myData = myRequests?.data?.data ?? [];
  const myPagination = myRequests?.data?.pagination;
  const pending = pendingRequests?.data?.data ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Permissions</h1>
          <p className="text-secondary-400 mt-1">Request and manage worker permissions</p>
        </div>
        {isWorker && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        )}
      </div>

      {/* Pending Requests to Decide (for Leaders/Directorate/Admin) */}
      {canDecide && pending.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Pending Approvals ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map((req) => (
              <Card key={req.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{req.user?.fullName}</p>
                    <p className="text-secondary-400 text-sm mt-1">{req.reason}</p>
                    <p className="text-secondary-500 text-xs mt-1">
                      {format(new Date(req.startDate), 'MMM d')} - {format(new Date(req.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => { setDecidingId(req.id); setDecisionType('APPROVED'); }}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => { setDecidingId(req.id); setDecisionType('DECLINED'); }}
                    >
                      <XIcon className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* My Requests */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">My Requests</h2>
        {myData.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="w-12 h-12" />}
            title="No permission requests"
            description="Submit a request when you need time off"
          />
        ) : (
          <div className="space-y-3">
            {myData.map((req) => (
              <Card key={req.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant[req.status]}>{req.status}</Badge>
                      <span className="text-secondary-500 text-sm">
                        {format(new Date(req.startDate), 'MMM d')} - {format(new Date(req.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-secondary-300 mt-2">{req.reason}</p>
                    {req.decisionReason && (
                      <p className="text-secondary-500 text-sm mt-1 italic">
                        Decision: {req.decisionReason}
                        {req.approvedBy && ` (by ${req.approvedBy.fullName})`}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        {myPagination && myPagination.totalPages > 1 && (
          <Pagination currentPage={myPagination.page} totalPages={myPagination.totalPages} onPageChange={setPage} />
        )}
      </div>

      {/* Submit Request Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Submit Permission Request">
        <form onSubmit={requestForm.handleSubmit(onSubmitRequest)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">Reason</label>
            <textarea
              {...requestForm.register('reason', { required: true, minLength: 10 })}
              rows={3}
              className="w-full bg-dark-800 border border-secondary-700 rounded-lg px-4 py-3 text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              placeholder="Explain why you need permission..."
            />
          </div>
          <Input label="Start Date" type="date" {...requestForm.register('startDate', { required: true })} />
          <Input label="End Date" type="date" {...requestForm.register('endDate', { required: true })} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={submitMutation.isPending} className="flex-1">
              Submit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Decision Modal */}
      <Modal
        isOpen={!!decidingId}
        onClose={() => setDecidingId(null)}
        title={decisionType === 'APPROVED' ? 'Approve Request' : 'Decline Request'}
      >
        <form onSubmit={decisionForm.handleSubmit(onDecide)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">Decision Reason</label>
            <textarea
              {...decisionForm.register('decisionReason', { required: true, minLength: 5 })}
              rows={3}
              className="w-full bg-dark-800 border border-secondary-700 rounded-lg px-4 py-3 text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              placeholder="Provide a reason for your decision..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setDecidingId(null)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant={decisionType === 'APPROVED' ? 'primary' : 'destructive'}
              isLoading={decideMutation.isPending}
              className="flex-1"
            >
              {decisionType === 'APPROVED' ? 'Approve' : 'Decline'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
