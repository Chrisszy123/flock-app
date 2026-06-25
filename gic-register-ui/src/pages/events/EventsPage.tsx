import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Plus,
  Users,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/features/auth/AuthContext';
import { eventsApi } from '@/services/api';
import { createEventSchema, type CreateEventFormData } from '@/lib/validators';
import { handleApiError } from '@/lib/api';
import { 
  Button,
  Input,
  Card,
  CardBody,
  Modal,
  Pagination,
  LoadingSpinner,
  EmptyState,
  Badge
} from '@/components/ui';
import type { Event } from '@/types';

export function EventsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const canManageEvents = user?.role === 'ADMIN' || user?.role === 'LEADER';

  // Get events
  const { data: events, isLoading } = useQuery({
    queryKey: ['events', page],
    queryFn: () => eventsApi.getEvents({ page, limit: 10 }),
  });

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateEventFormData) => eventsApi.createEvent({
      ...data,
      date: new Date(data.date).toISOString(),
      startTime: new Date(`${data.date}T${data.startTime}`).toISOString(),
      endTime: new Date(`${data.date}T${data.endTime}`).toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created successfully');
      setIsCreateModalOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted');
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
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      radiusMeters: 100,
      latitude: 6.5244,
      longitude: 3.3792,
    },
  });

  const onSubmit = (data: CreateEventFormData) => {
    createMutation.mutate(data);
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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Events</h1>
          <p className="text-secondary-400 mt-1">View and manage church events</p>
        </div>
        {canManageEvents && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-5 h-5" />
            Create Event
          </Button>
        )}
      </div>

      {/* Events List */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : !events?.data?.data.length ? (
            <EmptyState
              icon={<Calendar className="w-8 h-8" />}
              title="No events yet"
              description="Church events will appear here"
              action={canManageEvents && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Create First Event
                </Button>
              )}
            />
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4 p-6">
                {events.data.data.map((event: Event) => (
                  <div
                    key={event.id}
                    className="bg-dark-800/50 border border-secondary-800/50 rounded-xl p-5 hover:border-secondary-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                      {canManageEvents && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Delete this event?')) {
                                deleteMutation.mutate(event.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-secondary-400 mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-secondary-300">
                        <Calendar className="w-4 h-4 text-secondary-500" />
                        <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-secondary-300">
                        <Clock className="w-4 h-4 text-secondary-500" />
                        <span>
                          {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-secondary-300">
                        <MapPin className="w-4 h-4 text-secondary-500" />
                        <span>{event.locationName}</span>
                      </div>
                      {event._count && (
                        <div className="flex items-center gap-2 text-secondary-300">
                          <Users className="w-4 h-4 text-secondary-500" />
                          <span>{event._count.attendances} attendees</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-secondary-800/50">
                      <Badge variant="secondary">
                        {event.radiusMeters}m check-in radius
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              {events.data.pagination && (
                <Pagination
                  page={page}
                  totalPages={events.data.pagination.totalPages}
                  hasNext={events.data.pagination.hasNext}
                  hasPrev={events.data.pagination.hasPrev}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          reset();
        }}
        title="Create Event"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Event Title"
            placeholder="Sunday Service"
            error={errors.title?.message}
            {...register('title')}
          />

          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="Event description..."
              {...register('description')}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              error={errors.date?.message}
              {...register('date')}
            />
            <Input
              label="Location Name"
              placeholder="Main Auditorium"
              error={errors.locationName?.message}
              {...register('locationName')}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              error={errors.startTime?.message}
              {...register('startTime')}
            />
            <Input
              label="End Time"
              type="time"
              error={errors.endTime?.message}
              {...register('endTime')}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              error={errors.latitude?.message}
              {...register('latitude', { valueAsNumber: true })}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              error={errors.longitude?.message}
              {...register('longitude', { valueAsNumber: true })}
            />
            <Input
              label="Radius (m)"
              type="number"
              error={errors.radiusMeters?.message}
              {...register('radiusMeters', { valueAsNumber: true })}
            />
          </div>

          <Button type="button" variant="secondary" onClick={handleUseCurrentLocation}>
            <MapPin className="w-4 h-4" />
            Use Current Location
          </Button>

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
              Create Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
