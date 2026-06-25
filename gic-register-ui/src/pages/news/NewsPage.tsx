import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import { newsApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Newspaper, Plus, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { NewsVisibility } from '@/types';

interface NewsForm {
  title: string;
  content: string;
  visibility: NewsVisibility;
}

export function NewsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const canManage = user?.role === 'ADMIN' || user?.role === 'DIRECTORATE';

  const { data, isLoading } = useQuery({
    queryKey: ['news', page],
    queryFn: () => newsApi.getNewsFeed({ page, limit: 10 }),
  });

  const createMutation = useMutation({
    mutationFn: newsApi.createNewsPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      setShowCreate(false);
      toast.success('News post created');
    },
    onError: () => toast.error('Failed to create post'),
  });

  const deleteMutation = useMutation({
    mutationFn: newsApi.deleteNewsPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Post deleted');
    },
  });

  const { register, handleSubmit, reset } = useForm<NewsForm>({
    defaultValues: { visibility: 'PUBLIC' },
  });

  const onSubmit = (formData: NewsForm) => {
    createMutation.mutate(formData);
    reset();
  };

  const posts = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">News Feed</h1>
          <p className="text-secondary-400 mt-1">Church updates and announcements</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-secondary-400">Loading...</div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="w-12 h-12" />}
          title="No news yet"
          description="Check back later for updates"
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                    <Badge variant={post.visibility === 'PUBLIC' ? 'success' : 'warning'}>
                      {post.visibility === 'PUBLIC' ? (
                        <><Eye className="w-3 h-3 mr-1" />Public</>
                      ) : (
                        <><EyeOff className="w-3 h-3 mr-1" />Workers Only</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-secondary-300 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-secondary-500">
                    <span>By {post.createdBy?.fullName ?? 'Admin'}</span>
                    <span>{format(new Date(post.createdAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                </div>
                {canManage && (
                  <button
                    onClick={() => deleteMutation.mutate(post.id)}
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

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          onPageChange={setPage}
        />
      )}

      {/* Create Post Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create News Post">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" {...register('title', { required: true })} placeholder="Post title" />
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">Content</label>
            <textarea
              {...register('content', { required: true })}
              rows={6}
              className="w-full bg-dark-800 border border-secondary-700 rounded-lg px-4 py-3 text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              placeholder="Write your post content..."
            />
          </div>
          <Select label="Visibility" {...register('visibility')}>
            <option value="PUBLIC">Public</option>
            <option value="WORKERS_ONLY">Workers Only</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending} className="flex-1">
              Publish
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
