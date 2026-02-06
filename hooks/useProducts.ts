import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/lib/api';

export function useProducts(
  page: number,
  search: string,
  category: string
) {
  return useQuery({
    queryKey: ['products', page, search, category],
    queryFn: () => getProducts(page, search, category),
    placeholderData: (previousData) => previousData,
    staleTime: 0, 
  });
}