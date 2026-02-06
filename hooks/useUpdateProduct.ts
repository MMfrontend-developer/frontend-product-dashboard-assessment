import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '@/lib/api';

type UpdateProductPayload = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
};

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProductPayload) => {
      const res = await fetch(
        `${BASE_URL}/products/${data.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to update product');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

