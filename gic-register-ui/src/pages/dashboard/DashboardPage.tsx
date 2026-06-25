import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Calendar, 
  Clock,
  RefreshCw,
  AlertTriangle,
  History,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '@/features/auth/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { attendanceApi, eventsApi, locationsApi } from '@/services/api';
import { handleApiError } from '@/lib/api';
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  CardTitle, 
  Badge,
  LoadingSpinner
} from '@/components/ui';
import type { Event } from '@/types';

export function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { coordinates, error: geoError, isLoading: geoLoading, refresh: refreshLocation } = useGeolocation({
    watchPosition: true,
  });
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();

  // Get default church location
  const { data: defaultLocation } = useQuery({
    queryKey: ['defaultLocation'],
    queryFn: () => locationsApi.getDefaultLocation(),
  });

  // Get upcoming events
  const { data: upcomingEvents } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: () => eventsApi.getUpcomingEvents(5),
  });

  // Get last check-in
  const { data: lastCheckIn, isLoading: lastCheckInLoading } = useQuery({
    queryKey: ['lastCheckIn'],
    queryFn: () => attendanceApi.getLastCheckIn(),
  });

  // Can check in query
  const { data: canCheckInData, refetch: refetchCanCheckIn } = useQuery({
    queryKey: ['canCheckIn', coordinates?.latitude, coordinates?.longitude, selectedEventId],
    queryFn: () => coordinates ? attendanceApi.canCheckIn({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      eventId: selectedEventId,
    }) : null,
    enabled: !!coordinates,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (data: { latitude: number; longitude: number; eventId?: string }) =>
      attendanceApi.checkIn(data),
    onSuccess: () => {
      toast.success('Check-in successful! Welcome!');
      queryClient.invalidateQueries({ queryKey: ['canCheckIn'] });
      queryClient.invalidateQueries({ queryKey: ['lastCheckIn'] });
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });

  const handleCheckIn = () => {
    if (!coordinates) {
      toast.error('Location not available. Please enable location services.');
      return;
    }

    checkInMutation.mutate({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      eventId: selectedEventId,
    });
  };

  // Determine check-in status
  const isWithinGeofence = canCheckInData?.data?.canCheckIn ?? false;
  const hasAlreadyCheckedIn = canCheckInData?.data?.alreadyCheckedIn ?? false;
  const distanceFromChurch = canCheckInData?.data?.distance;
  const allowedRadius = canCheckInData?.data?.allowedRadius;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            {getGreeting()}, {user?.fullName.split(' ')[0]}!
          </h1>
          <p className="text-secondary-400 mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="primary">{user?.role}</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Check-in Card */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 border-b border-secondary-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-400" />
                  Check In
                </CardTitle>
              </CardHeader>
            </div>
            <CardBody className="space-y-6">
              {/* Location Status */}
              <div className="bg-dark-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-secondary-400">Your Location</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshLocation}
                    disabled={geoLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${geoLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                
                {geoLoading ? (
                  <div className="flex items-center gap-2 text-secondary-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Getting your location...</span>
                  </div>
                ) : geoError ? (
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">{geoError}</span>
                  </div>
                ) : coordinates ? (
                  <div className="space-y-2">
                    <div className="text-sm text-secondary-300">
                      Lat: {coordinates.latitude.toFixed(6)}, Lng: {coordinates.longitude.toFixed(6)}
                    </div>
                    {distanceFromChurch !== undefined && (
                      <div className={`text-sm ${isWithinGeofence ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {distanceFromChurch}m from {defaultLocation?.data?.name || 'church'}
                        {allowedRadius && ` (must be within ${allowedRadius}m)`}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Event Selection */}
              {upcomingEvents?.data && upcomingEvents.data.length > 0 && (
                <div>
                  <label className="label">Check in for event (optional)</label>
                  <select
                    value={selectedEventId || ''}
                    onChange={(e) => {
                      setSelectedEventId(e.target.value || undefined);
                      refetchCanCheckIn();
                    }}
                    className="input"
                  >
                    <option value="">Regular service (no event)</option>
                    {upcomingEvents.data.map((event: Event) => (
                      <option key={event.id} value={event.id}>
                        {event.title} - {format(new Date(event.date), 'MMM d')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Check-in Button */}
              <div className="pt-2">
                {hasAlreadyCheckedIn ? (
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-emerald-400 font-medium">Already Checked In</p>
                      <p className="text-sm text-secondary-400">You've already checked in today</p>
                    </div>
                  </div>
                ) : !coordinates ? (
                  <Button disabled className="w-full" size="lg">
                    <MapPin className="w-5 h-5" />
                    Enable Location to Check In
                  </Button>
                ) : !isWithinGeofence ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                      <XCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-amber-400 font-medium">Outside Check-in Zone</p>
                        <p className="text-sm text-secondary-400">
                          {canCheckInData?.data?.reason || 'Please move closer to check in'}
                        </p>
                      </div>
                    </div>
                    <Button disabled className="w-full" size="lg">
                      <MapPin className="w-5 h-5" />
                      Check In
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleCheckIn}
                    isLoading={checkInMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Check In Now
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Last Check-in */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="w-5 h-5 text-secondary-400" />
                Last Check-in
              </CardTitle>
            </CardHeader>
            <CardBody>
              {lastCheckInLoading ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : lastCheckIn?.data ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-secondary-300">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(lastCheckIn.data.date), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-300">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(lastCheckIn.data.checkInTime), 'h:mm a')}</span>
                  </div>
                  {lastCheckIn.data.event && (
                    <div className="mt-2 pt-2 border-t border-secondary-800/50">
                      <span className="text-sm text-secondary-400">Event: </span>
                      <span className="text-sm text-white">{lastCheckIn.data.event.title}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-secondary-400 text-sm">No check-ins yet</p>
              )}
            </CardBody>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Links</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <Link
                to="/profile"
                className="flex items-center justify-between px-6 py-3 hover:bg-secondary-800/30 transition-colors"
              >
                <span className="text-secondary-300">View Profile</span>
                <ChevronRight className="w-4 h-4 text-secondary-500" />
              </Link>
              <Link
                to="/events"
                className="flex items-center justify-between px-6 py-3 hover:bg-secondary-800/30 transition-colors border-t border-secondary-800/50"
              >
                <span className="text-secondary-300">Upcoming Events</span>
                <ChevronRight className="w-4 h-4 text-secondary-500" />
              </Link>
              {(user?.role === 'WORKER' || user?.role === 'LEADER' || user?.role === 'ADMIN') && (
                <Link
                  to="/training"
                  className="flex items-center justify-between px-6 py-3 hover:bg-secondary-800/30 transition-colors border-t border-secondary-800/50"
                >
                  <span className="text-secondary-300">Training Dashboard</span>
                  <ChevronRight className="w-4 h-4 text-secondary-500" />
                </Link>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
