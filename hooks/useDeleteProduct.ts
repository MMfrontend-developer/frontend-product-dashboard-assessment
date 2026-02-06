import { useMutation, useQueryClient } from '@tanstack/react-query';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

async function deleteProduct(id: string) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete product');
  }

  return res.json();
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
    
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}