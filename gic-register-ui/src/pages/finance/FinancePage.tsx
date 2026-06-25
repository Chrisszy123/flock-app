import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import { financeApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Wallet, Plus, CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { PaymentMethod } from '@/types';

interface OfferingForm {
  amount: number;
  method: PaymentMethod;
  transactionReference?: string;
  cryptoWalletAddress?: string;
  proofImageUrl?: string;
}

export function FinancePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  // My offerings
  const { data: myData, isLoading: loadingMy } = useQuery({
    queryKey: ['finance', 'my', page],
    queryFn: () => financeApi.getMyOfferings({ page, limit: 10 }),
  });

  // Admin: all offerings
  const { data: allData, isLoading: loadingAll } = useQuery({
    queryKey: ['finance', 'all', page],
    queryFn: () => financeApi.getAllOfferings({ page, limit: 20 }),
    enabled: isAdmin,
  });

  // Admin: stats
  const { data: statsData } = useQuery({
    queryKey: ['finance', 'stats'],
    queryFn: () => financeApi.getStats(),
    enabled: isAdmin,
  });

  const submitMutation = useMutation({
    mutationFn: financeApi.submitOffering,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      setShowCreate(false);
      toast.success('Offering submitted');
    },
    onError: () => toast.error('Failed to submit offering'),
  });

  const confirmMutation = useMutation({
    mutationFn: financeApi.confirmPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      toast.success('Payment confirmed');
    },
  });

  const { register, handleSubmit, reset, watch } = useForm<OfferingForm>({
    defaultValues: { method: 'BANK' },
  });

  const selectedMethod = watch('method');

  const onSubmit = (data: OfferingForm) => {
    submitMutation.mutate({ ...data, amount: Number(data.amount) });
    reset();
  };

  const stats = statsData?.data;
  const myOfferings = myData?.data?.data ?? [];
  const allOfferings = allData?.data?.data ?? [];
  const myPagination = myData?.data?.pagination;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Tithes & Offerings</h1>
          <p className="text-secondary-400 mt-1">Manage your giving</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Submit Offering
        </Button>
      </div>

      {/* Admin Stats */}
      {isAdmin && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-secondary-400 text-xs">Total Confirmed</p>
                <p className="text-white text-lg font-semibold">${stats.totalConfirmedAmount.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <TrendingUp className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-secondary-400 text-xs">Total Records</p>
                <p className="text-white text-lg font-semibold">{stats.totalRecords}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-secondary-400 text-xs">Confirmed</p>
                <p className="text-white text-lg font-semibold">{stats.confirmedCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-secondary-400 text-xs">Pending</p>
                <p className="text-white text-lg font-semibold">{stats.pendingCount}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Admin: All Offerings with Confirm */}
      {isAdmin && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">All Offerings</h2>
          {loadingAll ? (
            <p className="text-secondary-400">Loading...</p>
          ) : allOfferings.length === 0 ? (
            <p className="text-secondary-500">No offerings yet</p>
          ) : (
            <div className="space-y-3">
              {allOfferings.map((offering) => (
                <Card key={offering.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-white font-medium">{offering.user?.fullName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={offering.status === 'CONFIRMED' ? 'success' : 'warning'}>
                            {offering.status}
                          </Badge>
                          <Badge variant="secondary">{offering.method}</Badge>
                          <span className="text-secondary-400 text-sm">
                            ${offering.amount.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-secondary-500 text-xs mt-1">
                          {format(new Date(offering.createdAt), 'MMM d, yyyy h:mm a')}
                          {offering.transactionReference && ` | Ref: ${offering.transactionReference}`}
                        </p>
                      </div>
                    </div>
                    {offering.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => confirmMutation.mutate(offering.id)}
                        isLoading={confirmMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Offerings */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">My Offerings</h2>
        {loadingMy ? (
          <p className="text-secondary-400">Loading...</p>
        ) : myOfferings.length === 0 ? (
          <EmptyState
            icon={<Wallet className="w-12 h-12" />}
            title="No offerings yet"
            description="Submit your first tithe or offering"
          />
        ) : (
          <div className="space-y-3">
            {myOfferings.map((offering) => (
              <Card key={offering.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">${offering.amount.toLocaleString()}</span>
                      <Badge variant={offering.status === 'CONFIRMED' ? 'success' : 'warning'}>
                        {offering.status}
                      </Badge>
                      <Badge variant="secondary">{offering.method}</Badge>
                    </div>
                    <p className="text-secondary-500 text-sm mt-1">
                      {format(new Date(offering.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        {myPagination && myPagination.totalPages > 1 && (
          <Pagination page={myPagination.page} totalPages={myPagination.totalPages} hasNext={myPagination.hasNext} hasPrev={myPagination.hasPrev} onPageChange={setPage} />
        )}
      </div>

      {/* Submit Offering Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Submit Tithe/Offering">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Amount" type="number" step="0.01" {...register('amount', { required: true, min: 0.01 })} placeholder="0.00" />
          <Select label="Payment Method" {...register('method')}>
            <option value="BANK">Bank Transfer</option>
            <option value="CRYPTO">Cryptocurrency</option>
          </Select>
          <Input label="Transaction Reference" {...register('transactionReference')} placeholder="Transaction ID or reference" />
          {selectedMethod === 'CRYPTO' && (
            <Input label="Crypto Wallet Address" {...register('cryptoWalletAddress')} placeholder="Wallet address" />
          )}
          <Input label="Proof Image URL" {...register('proofImageUrl')} placeholder="https://..." />
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
    </div>
  );
}
