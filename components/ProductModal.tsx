'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormData } from '@/lib/validators';
import { useCreateProduct } from '@/hooks/useCreateProduct';
import { useUpdateProduct } from '@/hooks/useUpdateProduct';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRODUCT_CATEGORIES } from '@/app/products/page';

type Props = {
  onClose: () => void;
  mode: 'create' | 'edit';
  product?: ProductFormData & { id?: string };
};

export default function ProductModal({ onClose, mode, product }: Props) {
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    if (mode === 'edit' && product) reset(product);
  }, [mode, product, reset]);

  function onSubmit(data: ProductFormData) {
    if (mode === 'create') {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success('Product created successfully!');
          onClose();
        },
        onError: () => toast.error('Failed to create product'),
      });
    } else {
      updateMutation.mutate(
        { id: product!.id!, ...data },
        {
          onSuccess: () => {
            toast.success('Product updated successfully!');
            onClose();
          },
          onError: () => toast.error('Failed to update product'),
        }
      );
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Product' : 'Edit Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label className='mb-1'>Name</Label>
            <Input placeholder="Product name" {...register('name')} />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label className='mb-1'>Price</Label>
            <Input
              type="number"
              placeholder="Price"
              {...register('price', { valueAsNumber: true })}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
          </div>

          <div>
            <Label className='mb-1'>Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <Label className='mb-1'>Description</Label>
            <Textarea placeholder="Description" {...register('description')} />
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}