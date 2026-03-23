import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  MapPin, 
  Plus,
  Trash2,
  CheckCircle2,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { locationsApi, type CreateChurchLocationInput } from '@/services/api';
import { handleApiError } from '@/lib/api';
import { 
  Button, 
  Input, 
  Card, 
  CardBody,
  Modal,
  LoadingSpinner,
  EmptyState,
  Badge
} from '@/components/ui';
import type { ChurchLocation } from '@/types';

export function LocationsPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Get locations
  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsApi.getLocations(),
  });

  // Create location mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateChurchLocationInput) => locationsApi.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location created successfully');
      setIsCreateModalOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });

  // Update location mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateChurchLocationInput> }) =>
      locationsApi.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location updated');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });

  // Delete location mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => locationsApi.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateChurchLocationInput>({
    defaultValues: {
      radiusMeters: 100,
      latitude: 6.5244,
      longitude: 3.3792,
      isDefault: false,
    },
  });

  const onSubmit = (data: CreateChurchLocationInput) => {
    createMutation.mutate(data);
  };

  const handleSetDefault = (location: ChurchLocation) => {
    if (!location.isDefault) {
      updateMutation.mutate({
        id: location.id,
        data: { isDefault: true },
      });
    }
  };

  const handleDelete = (location: ChurchLocation) => {
    if (location.isDefault) {
      toast.error('Cannot delete the default location');
      return;
    }
    if (confirm(`Delete "${location.name}"?`)) {
      deleteMutation.mutate(location.id);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude);
          setValue('longitude', position.coords.longitude);
          toast.success('Location updated');
        },
        () => {
          toast.error('Could not get your location');
        }
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Church Locations</h1>
          <p className="text-secondary-400 mt-1">Manage check-in locations and geofences</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Add Location
        </Button>
      </div>

      {/* Locations List */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : !locations?.data?.length ? (
            <EmptyState
              icon={<MapPin className="w-8 h-8" />}
              title="No locations yet"
              description="Add your first church location to enable geofenced check-ins"
              action={
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Add First Location
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-secondary-800/50">
              {locations.data.map((location: ChurchLocation) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-6 hover:bg-secondary-800/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${location.isDefault ? 'bg-primary-500/20' : 'bg-secondary-800/50'}`}>
                      <MapPin className={`w-6 h-6 ${location.isDefault ? 'text-primary-400' : 'text-secondary-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{location.name}</span>
                        {location.isDefault && (
                          <Badge variant="primary">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      {location.address && (
                        <div className="text-sm text-secondary-400 mt-1">{location.address}</div>
                      )}
                      <div className="text-xs text-secondary-500 mt-1">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} • {location.radiusMeters}m radius
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!location.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(location)}
                        disabled={updateMutation.isPending}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(location)}
                      disabled={location.isDefault || deleteMutation.isPending}
                    >
                      <Trash2 className={`w-4 h-4 ${location.isDefault ? 'text-secondary-600' : 'text-red-400'}`} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create Location Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          reset();
        }}
        title="Add Church Location"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Location Name"
            placeholder="Main Campus"
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />

          <Input
            label="Address (Optional)"
            placeholder="123 Faith Avenue"
            {...register('address')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              error={errors.latitude?.message}
              {...register('latitude', {
                required: 'Required',
                valueAsNumber: true,
                min: { value: -90, message: 'Invalid' },
                max: { value: 90, message: 'Invalid' },
              })}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              error={errors.longitude?.message}
              {...register('longitude', {
                required: 'Required',
                valueAsNumber: true,
                min: { value: -180, message: 'Invalid' },
                max: { value: 180, message: 'Invalid' },
              })}
            />
          </div>

          <Button type="button" variant="secondary" onClick={handleUseCurrentLocation}>
            <MapPin className="w-4 h-4" />
            Use Current Location
          </Button>

          <Input
            label="Check-in Radius (meters)"
            type="number"
            error={errors.radiusMeters?.message}
            {...register('radiusMeters', {
              valueAsNumber: true,
              min: { value: 10, message: 'Min 10m' },
              max: { value: 10000, message: 'Max 10km' },
            })}
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isDefault"
              className="w-4 h-4 rounded border-secondary-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
              {...register('isDefault')}
            />
            <label htmlFor="isDefault" className="text-sm text-secondary-300">
              Set as default location
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Location
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
