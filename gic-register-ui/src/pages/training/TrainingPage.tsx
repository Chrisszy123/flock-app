import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  GraduationCap, 
  CheckCircle2, 
  Circle,
  Award,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { trainingApi } from '@/services/api';
import { handleApiError } from '@/lib/api';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  CardTitle,
  CardDescription,
  ProgressBar,
  Badge,
  LoadingSpinner,
  EmptyState
} from '@/components/ui';
import type { TrainingProgress } from '@/types';

export function TrainingPage() {
  const queryClient = useQueryClient();

  // Get training dashboard
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['trainingDashboard'],
    queryFn: () => trainingApi.getMyDashboard(),
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: ({ moduleId, completed }: { moduleId: string; completed: boolean }) =>
      trainingApi.updateMyProgress(moduleId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingDashboard'] });
      toast.success('Progress updated');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });

  const handleToggleComplete = (moduleId: string, currentlyCompleted: boolean) => {
    updateProgressMutation.mutate({ moduleId, completed: !currentlyCompleted });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const dashboardData = dashboard?.data;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Training Dashboard</h1>
        <p className="text-secondary-400 mt-1">Track your training progress and complete modules</p>
      </div>

      {/* Progress Overview */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Card>
          <CardBody className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8 text-primary-400" />
            </div>
            <div className="text-3xl font-bold text-white">{dashboardData?.totalModules || 0}</div>
            <div className="text-sm text-secondary-400">Total Modules</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white">{dashboardData?.completedModules || 0}</div>
            <div className="text-sm text-secondary-400">Completed</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <div className="w-16 h-16 rounded-full bg-accent-500/20 flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8 text-accent-400" />
            </div>
            <div className="text-3xl font-bold text-white">{dashboardData?.progressPercentage || 0}%</div>
            <div className="text-sm text-secondary-400">Progress</div>
          </CardBody>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-medium">Overall Progress</span>
            <span className="text-primary-400 font-bold">{dashboardData?.progressPercentage || 0}%</span>
          </div>
          <ProgressBar value={dashboardData?.progressPercentage || 0} size="lg" />
        </CardBody>
      </Card>

      {/* Training Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary-400" />
            Training Modules
          </CardTitle>
          <CardDescription>Click on a module to mark it as complete</CardDescription>
        </CardHeader>
        <CardBody className="p-0">
          {!dashboardData?.modules || dashboardData.modules.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-8 h-8" />}
              title="No training modules"
              description="Training modules will appear here when available"
            />
          ) : (
            <div className="divide-y divide-secondary-800/50">
              {dashboardData.modules.map((progress: TrainingProgress) => (
                <div
                  key={progress.trainingModuleId}
                  className="flex items-start gap-4 p-6 hover:bg-secondary-800/20 transition-colors cursor-pointer"
                  onClick={() => handleToggleComplete(progress.trainingModuleId, progress.completed)}
                >
                  <button
                    className="mt-1 flex-shrink-0"
                    disabled={updateProgressMutation.isPending}
                  >
                    {progress.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-secondary-500 hover:text-secondary-400" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${progress.completed ? 'text-secondary-400 line-through' : 'text-white'}`}>
                        {progress.trainingModule.title}
                      </h3>
                      {progress.trainingModule.isMandatory && (
                        <Badge variant="warning">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Mandatory
                        </Badge>
                      )}
                    </div>
                    {progress.trainingModule.description && (
                      <p className="text-sm text-secondary-400 mb-2">
                        {progress.trainingModule.description}
                      </p>
                    )}
                    {progress.completed && progress.completedAt && (
                      <p className="text-xs text-secondary-500">
                        Completed on {new Date(progress.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-secondary-500">
                    Module {progress.trainingModule.order}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
