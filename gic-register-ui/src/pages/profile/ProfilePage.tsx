import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase,
  Save,
  History,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/features/auth/AuthContext';
import { usersApi, attendanceApi } from '@/services/api';
import { updateProfileSchema, type UpdateProfileFormData } from '@/lib/validators';
import { handleApiError } from '@/lib/api';
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardBody, 
  CardTitle,
  RoleBadge,
  WorkerStatusBadge,
  Pagination,
  LoadingSpinner,
  EmptyState
} from '@/components/ui';
import type { Attendance } from '@/types';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [attendancePage, setAttendancePage] = useState(1);

  // Get user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => usersApi.getProfile(),
  });

  // Get attendance history
  const { data: attendanceHistory, isLoading: attendanceLoading } = useQuery({
    queryKey: ['myAttendance', attendancePage],
    queryFn: () => attendanceApi.getMyHistory({ page: attendancePage, limit: 10 }),
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileFormData) => usersApi.updateProfile({
      ...data,
      phone: data.phone || null,
      address: data.address || null,
      primaryServiceUnit: data.primaryServiceUnit || null,
      secondaryServiceUnit: data.secondaryServiceUnit || null,
    }),
    onSuccess: (response) => {
      if (response.data) {
        updateUser(response.data);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
      toast.success('Profile updated successfully');
      setIsEditing(false);
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
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: profile?.data?.fullName || user?.fullName,
      dateOfBirth: profile?.data?.dateOfBirth ? format(new Date(profile.data.dateOfBirth), 'yyyy-MM-dd') : '',
      phone: profile?.data?.phone || '',
      address: profile?.data?.address || '',
      primaryServiceUnit: profile?.data?.primaryServiceUnit || '',
      secondaryServiceUnit: profile?.data?.secondaryServiceUnit || '',
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const userData = profile?.data || user;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">My Profile</h1>
          <p className="text-secondary-400 mt-1">Manage your personal information</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary-400" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardBody>
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <Input
                    label="Full Name"
                    leftIcon={<User className="w-5 h-5" />}
                    error={errors.fullName?.message}
                    {...register('fullName')}
                  />
                  
                  <Input
                    label="Date of Birth"
                    type="date"
                    leftIcon={<Calendar className="w-5 h-5" />}
                    error={errors.dateOfBirth?.message}
                    {...register('dateOfBirth')}
                  />

                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="+234 xxx xxx xxxx"
                    leftIcon={<Phone className="w-5 h-5" />}
                    error={errors.phone?.message}
                    {...register('phone')}
                  />

                  <Input
                    label="Address"
                    placeholder="Your address"
                    leftIcon={<MapPin className="w-5 h-5" />}
                    error={errors.address?.message}
                    {...register('address')}
                  />

                  <Input
                    label="Primary Service Unit"
                    placeholder="e.g., Worship Team, Media Team"
                    leftIcon={<Briefcase className="w-5 h-5" />}
                    error={errors.primaryServiceUnit?.message}
                    {...register('primaryServiceUnit')}
                  />

                  <Input
                    label="Secondary Service Unit"
                    placeholder="e.g., Ushering, Protocol"
                    leftIcon={<Briefcase className="w-5 h-5" />}
                    error={errors.secondaryServiceUnit?.message}
                    {...register('secondaryServiceUnit')}
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="secondary" type="button" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={updateMutation.isPending}>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl font-bold text-white">
                      {userData?.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">{userData?.fullName}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <RoleBadge role={userData?.role || 'MEMBER'} />
                        {userData?.workerStatus && userData.workerStatus !== 'NONE' && (
                          <WorkerStatusBadge status={userData.workerStatus} />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-secondary-800/50">
                    <div className="flex items-center gap-3 text-secondary-300">
                      <Mail className="w-4 h-4 text-secondary-500" />
                      <span>{userData?.email}</span>
                    </div>
                    {userData?.phone && (
                      <div className="flex items-center gap-3 text-secondary-300">
                        <Phone className="w-4 h-4 text-secondary-500" />
                        <span>{userData.phone}</span>
                      </div>
                    )}
                    {userData?.dateOfBirth && (
                      <div className="flex items-center gap-3 text-secondary-300">
                        <Calendar className="w-4 h-4 text-secondary-500" />
                        <span>{format(new Date(userData.dateOfBirth), 'MMMM d, yyyy')}</span>
                      </div>
                    )}
                    {userData?.address && (
                      <div className="flex items-center gap-3 text-secondary-300">
                        <MapPin className="w-4 h-4 text-secondary-500" />
                        <span>{userData.address}</span>
                      </div>
                    )}
                    {userData?.primaryServiceUnit && (
                      <div className="flex items-center gap-3 text-secondary-300">
                        <Briefcase className="w-4 h-4 text-secondary-500" />
                        <span>Primary: {userData.primaryServiceUnit}</span>
                      </div>
                    )}
                    {userData?.secondaryServiceUnit && (
                      <div className="flex items-center gap-3 text-secondary-300">
                        <Briefcase className="w-4 h-4 text-secondary-500" />
                        <span>Secondary: {userData.secondaryServiceUnit}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-secondary-800/50 text-sm text-secondary-500">
                    Member since {userData?.createdAt ? format(new Date(userData.createdAt), 'MMMM yyyy') : 'N/A'}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Stats Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Stats</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="p-3 bg-dark-800/50 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {attendanceHistory?.data?.pagination.total || 0}
                </div>
                <div className="text-sm text-secondary-400">Total Check-ins</div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary-400" />
            Attendance History
          </CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {attendanceLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : attendanceHistory?.data?.data.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-8 h-8" />}
              title="No attendance records"
              description="Your check-in history will appear here"
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Event</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory?.data?.data.map((record: Attendance) => (
                      <tr key={record.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-secondary-500" />
                            {format(new Date(record.date), 'MMM d, yyyy')}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-secondary-500" />
                            {format(new Date(record.checkInTime), 'h:mm a')}
                          </div>
                        </td>
                        <td>
                          {record.event ? record.event.title : 'Regular Service'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {attendanceHistory?.data?.pagination && (
                <Pagination
                  page={attendancePage}
                  totalPages={attendanceHistory.data.pagination.totalPages}
                  hasNext={attendanceHistory.data.pagination.hasNext}
                  hasPrev={attendanceHistory.data.pagination.hasPrev}
                  onPageChange={setAttendancePage}
                />
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
