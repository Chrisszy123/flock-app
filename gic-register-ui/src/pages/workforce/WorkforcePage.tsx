import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import { workforceApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Building2, Plus, Trash2, Users, FolderTree } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface DirectorateForm {
  name: string;
  description?: string;
}

interface UnitForm {
  name: string;
  directorateId: string;
}

export function WorkforcePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';
  const [showCreateDir, setShowCreateDir] = useState(false);
  const [showCreateUnit, setShowCreateUnit] = useState(false);

  const { data: dirData, isLoading: loadingDirs } = useQuery({
    queryKey: ['directorates'],
    queryFn: () => workforceApi.getDirectorates({ limit: 50 }),
  });

  const { data: unitData, isLoading: loadingUnits } = useQuery({
    queryKey: ['units'],
    queryFn: () => workforceApi.getUnits({ limit: 100 }),
  });

  const createDirMutation = useMutation({
    mutationFn: workforceApi.createDirectorate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directorates'] });
      setShowCreateDir(false);
      toast.success('Directorate created');
    },
    onError: () => toast.error('Failed to create directorate'),
  });

  const deleteDirMutation = useMutation({
    mutationFn: workforceApi.deleteDirectorate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directorates'] });
      toast.success('Directorate deleted');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Cannot delete'),
  });

  const createUnitMutation = useMutation({
    mutationFn: workforceApi.createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setShowCreateUnit(false);
      toast.success('Unit created');
    },
    onError: () => toast.error('Failed to create unit'),
  });

  const deleteUnitMutation = useMutation({
    mutationFn: workforceApi.deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unit deleted');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Cannot delete'),
  });

  const dirForm = useForm<DirectorateForm>();
  const unitForm = useForm<UnitForm>();

  const directorates = dirData?.data?.data ?? [];
  const units = unitData?.data?.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Workforce Management</h1>
        <p className="text-secondary-400 mt-1">Manage directorates, units, and worker assignments</p>
      </div>

      {/* Directorates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-400" />
            Directorates
          </h2>
          {isAdmin && (
            <Button size="sm" onClick={() => setShowCreateDir(true)}>
              <Plus className="w-4 h-4 mr-1" />
              New Directorate
            </Button>
          )}
        </div>

        {loadingDirs ? (
          <p className="text-secondary-400">Loading...</p>
        ) : directorates.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-12 h-12" />}
            title="No directorates"
            description="Create your first directorate to organize the workforce"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {directorates.map((dir) => (
              <Card key={dir.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{dir.name}</h3>
                    {dir.description && (
                      <p className="text-secondary-400 text-sm mt-1">{dir.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant="secondary">
                        <Users className="w-3 h-3 mr-1" />
                        {dir._count?.members ?? 0} members
                      </Badge>
                      <Badge variant="secondary">
                        <FolderTree className="w-3 h-3 mr-1" />
                        {dir._count?.units ?? 0} units
                      </Badge>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => deleteDirMutation.mutate(dir.id)}
                      className="p-2 text-secondary-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Units */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-accent-400" />
            Units
          </h2>
          {(isAdmin || user?.role === 'DIRECTORATE') && (
            <Button size="sm" onClick={() => setShowCreateUnit(true)}>
              <Plus className="w-4 h-4 mr-1" />
              New Unit
            </Button>
          )}
        </div>

        {loadingUnits ? (
          <p className="text-secondary-400">Loading...</p>
        ) : units.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="w-12 h-12" />}
            title="No units"
            description="Create units within directorates"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((unit) => (
              <Card key={unit.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{unit.name}</h3>
                    <p className="text-secondary-500 text-sm mt-1">
                      {unit.directorate?.name ?? 'Unknown directorate'}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      <Users className="w-3 h-3 mr-1" />
                      {unit._count?.members ?? 0} members
                    </Badge>
                  </div>
                  {(isAdmin || user?.role === 'DIRECTORATE') && (
                    <button
                      onClick={() => deleteUnitMutation.mutate(unit.id)}
                      className="p-2 text-secondary-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Directorate Modal */}
      <Modal isOpen={showCreateDir} onClose={() => setShowCreateDir(false)} title="Create Directorate">
        <form onSubmit={dirForm.handleSubmit((data) => { createDirMutation.mutate(data); dirForm.reset(); })} className="space-y-4">
          <Input label="Name" {...dirForm.register('name', { required: true })} placeholder="Directorate name" />
          <Input label="Description" {...dirForm.register('description')} placeholder="Optional description" />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreateDir(false)} className="flex-1">Cancel</Button>
            <Button type="submit" isLoading={createDirMutation.isPending} className="flex-1">Create</Button>
          </div>
        </form>
      </Modal>

      {/* Create Unit Modal */}
      <Modal isOpen={showCreateUnit} onClose={() => setShowCreateUnit(false)} title="Create Unit">
        <form onSubmit={unitForm.handleSubmit((data) => { createUnitMutation.mutate(data); unitForm.reset(); })} className="space-y-4">
          <Input label="Name" {...unitForm.register('name', { required: true })} placeholder="Unit name" />
          <Select label="Directorate" {...unitForm.register('directorateId', { required: true })}>
            <option value="">Select directorate</option>
            {directorates.map((dir) => (
              <option key={dir.id} value={dir.id}>{dir.name}</option>
            ))}
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreateUnit(false)} className="flex-1">Cancel</Button>
            <Button type="submit" isLoading={createUnitMutation.isPending} className="flex-1">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
