import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import { resourcesApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { BookOpen, Music, Plus, Download, ExternalLink } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { ResourceType } from '@/types';

interface ResourceForm {
  type: ResourceType;
  title: string;
  description?: string;
  fileUrl?: string;
  price?: number;
  excerpt?: string;
  coverUrl?: string;
}

export function ResourcesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<ResourceType | ''>('');
  const [showCreate, setShowCreate] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  const { data, isLoading } = useQuery({
    queryKey: ['resources', page, filter],
    queryFn: () => resourcesApi.getResources({
      page,
      limit: 12,
      ...(filter ? { type: filter } : {}),
    }),
  });

  const createMutation = useMutation({
    mutationFn: resourcesApi.createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setShowCreate(false);
      toast.success('Resource created');
    },
    onError: () => toast.error('Failed to create resource'),
  });

  const { register, handleSubmit, reset, watch } = useForm<ResourceForm>({
    defaultValues: { type: 'MESSAGE' },
  });

  const selectedType = watch('type');

  const onSubmit = (formData: ResourceForm) => {
    createMutation.mutate({
      ...formData,
      price: formData.price ? Number(formData.price) : null,
    });
    reset();
  };

  const resources = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Resources</h1>
          <p className="text-secondary-400 mt-1">Messages, sermons, and books</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onChange={(e) => { setFilter(e.target.value as ResourceType | ''); setPage(1); }}>
            <option value="">All Types</option>
            <option value="MESSAGE">Messages</option>
            <option value="BOOK">Books</option>
          </Select>
          {isAdmin && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-secondary-400">Loading...</div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-12 h-12" />}
          title="No resources yet"
          description="Resources will appear here once added"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="p-0 overflow-hidden flex flex-col">
              {resource.coverUrl && (
                <img src={resource.coverUrl} alt={resource.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={resource.type === 'MESSAGE' ? 'primary' : 'accent'}>
                    {resource.type === 'MESSAGE' ? (
                      <><Music className="w-3 h-3 mr-1" />Message</>
                    ) : (
                      <><BookOpen className="w-3 h-3 mr-1" />Book</>
                    )}
                  </Badge>
                  {resource.price != null && resource.price > 0 && (
                    <Badge variant="warning">${resource.price.toFixed(2)}</Badge>
                  )}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{resource.title}</h3>
                {resource.description && (
                  <p className="text-secondary-400 text-sm mb-3 line-clamp-2">{resource.description}</p>
                )}
                {resource.excerpt && (
                  <p className="text-secondary-500 text-sm italic mb-4 line-clamp-3">"{resource.excerpt}"</p>
                )}
                <div className="mt-auto">
                  {resource.fileUrl ? (
                    <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </a>
                  ) : resource.price && resource.price > 0 ? (
                    <Button variant="primary" className="w-full" disabled>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Purchase to Access
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination page={pagination.page} totalPages={pagination.totalPages} hasNext={pagination.hasNext} hasPrev={pagination.hasPrev} onPageChange={setPage} />
      )}

      {/* Create Resource Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Resource">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Type" {...register('type')}>
            <option value="MESSAGE">Message</option>
            <option value="BOOK">Book</option>
          </Select>
          <Input label="Title" {...register('title', { required: true })} placeholder="Resource title" />
          <Input label="Description" {...register('description')} placeholder="Brief description" />
          <Input label="Cover Image URL" {...register('coverUrl')} placeholder="https://..." />
          {selectedType === 'BOOK' && (
            <>
              <Input label="Price" type="number" step="0.01" {...register('price')} placeholder="0.00" />
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">Excerpt</label>
                <textarea
                  {...register('excerpt')}
                  rows={3}
                  className="w-full bg-dark-800 border border-secondary-700 rounded-lg px-4 py-3 text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="Book excerpt..."
                />
              </div>
            </>
          )}
          <Input label="File URL" {...register('fileUrl')} placeholder="https://..." />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending} className="flex-1">
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
