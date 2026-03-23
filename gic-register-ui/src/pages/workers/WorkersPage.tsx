import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Users, 
  Mail,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi, trainingApi } from '@/services/api';
import { handleApiError } from '@/lib/api';
import { 
  Button, 
  Select,
  Card, 
  CardBody,
  Modal,
  Pagination,
  LoadingSpinner,
  EmptyState,
  RoleBadge,
  WorkerStatusBadge,
  ProgressBar
} from '@/components/ui';
import type { WorkerWithProgress, WorkerStatus, TrainingDashboard } from '@/types';

export function WorkersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedWorker, setSelectedWorker] = useState<WorkerWithProgress | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<WorkerStatus>('ACTIVE');
  const [workerTraining, setWorkerTraining] = useState<TrainingDashboard | null>(null);

  // Get workers
  const { data: workers, isLoading } = useQuery({
    queryKey: ['workers', page],
    queryFn: () => usersApi.getWorkers({ page, limit: 10 }),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkerStatus }) =>
      usersApi.updateWorkerStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Worker status updated');
      setIsStatusModalOpen(false);
      setSelectedWorker(null);
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });

  const handleStatusChange = (worker: WorkerWithProgress) => {
    setSelectedWorker(worker);
    setNewStatus(worker.workerStatus);
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = () => {
    if (selectedWorker) {
      updateStatusMutation.mutate({ id: selectedWorker.id, status: newStatus });
    }
  };

  const handleViewTraining = async (worker: WorkerWithProgress) => {
    setSelectedWorker(worker);
    try {
      const response = await trainingApi.getWorkerProgress(worker.id);
      if (response.data) {
        setWorkerTraining(response.data);
        setIsTrainingModalOpen(true);
      }
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'SUSPENDED', label: 'Suspended' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Workers</h1>
        <p className="text-secondary-400 mt-1">Manage workers and their training progress</p>
      </div>

      {/* Workers List */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : !workers?.data?.data.length ? (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="No workers yet"
              description="Workers will appear here once members are promoted to worker status"
            />
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4 p-6">
                {workers.data.data.map((worker: WorkerWithProgress) => (
                  <div
                    key={worker.id}
                    className="bg-dark-800/50 border border-secondary-800/50 rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
                          {worker.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white">{worker.fullName}</div>
                          <div className="flex items-center gap-1 text-sm text-secondary-400">
                            <Mail className="w-3 h-3" />
                            {worker.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <RoleBadge role={worker.role} />
                        <WorkerStatusBadge status={worker.workerStatus} />
                      </div>
                    </div>

                    {worker.primaryServiceUnit && (
                      <div className="flex items-center gap-2 text-sm text-secondary-300 mb-3">
                        <Briefcase className="w-4 h-4 text-secondary-500" />
                        <span>{worker.primaryServiceUnit}</span>
                      </div>
                    )}

                    {/* Training Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-secondary-400">Training Progress</span>
                        <span className="text-primary-400 font-medium">
                          {worker.trainingProgress.completed}/{worker.trainingProgress.total}
                        </span>
                      </div>
                      <ProgressBar value={worker.trainingProgress.percentage} size="sm" />
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-secondary-800/50">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusChange(worker)}
                        className="flex-1"
                      >
                        Update Status
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTraining(worker)}
                      >
                        <GraduationCap className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {workers.data.pagination && (
                <Pagination
                  page={page}
                  totalPages={workers.data.pagination.totalPages}
                  hasNext={workers.data.pagination.hasNext}
                  hasPrev={workers.data.pagination.hasPrev}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Status Change Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedWorker(null);
        }}
        title="Update Worker Status"
      >
        {selectedWorker && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-lg font-semibold">
                {selectedWorker.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-white">{selectedWorker.fullName}</div>
                <div className="text-sm text-secondary-400">{selectedWorker.email}</div>
              </div>
            </div>

            <Select
              label="Worker Status"
              options={statusOptions}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as WorkerStatus)}
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsStatusModalOpen(false);
                  setSelectedWorker(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveStatus}
                isLoading={updateStatusMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Training Progress Modal */}
      <Modal
        isOpen={isTrainingModalOpen}
        onClose={() => {
          setIsTrainingModalOpen(false);
          setWorkerTraining(null);
          setSelectedWorker(null);
        }}
        title="Training Progress"
        size="lg"
      >
        {selectedWorker && workerTraining && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-lg font-semibold">
                {selectedWorker.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-white">{selectedWorker.fullName}</div>
                <div className="text-sm text-secondary-400">
                  {workerTraining.completedModules}/{workerTraining.totalModules} modules completed
                </div>
              </div>
            </div>

            <ProgressBar value={workerTraining.progressPercentage} showLabel size="lg" />

            <div className="max-h-80 overflow-y-auto space-y-2">
              {workerTraining.modules.map((progress) => (
                <div
                  key={progress.trainingModuleId}
                  className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg"
                >
                  {progress.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-secondary-500 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {progress.trainingModule.title}
                    </div>
                    {progress.trainingModule.isMandatory && (
                      <div className="flex items-center gap-1 text-xs text-amber-400">
                        <AlertCircle className="w-3 h-3" />
                        Mandatory
                      </div>
                    )}
                  </div>
                  {progress.completed && progress.completedAt && (
                    <span className="text-xs text-secondary-500">
                      {format(new Date(progress.completedAt), 'MMM d')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
