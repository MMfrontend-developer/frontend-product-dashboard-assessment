export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

// Add the Product type
type Product = {
  id: string | number;
  name: string;
  price: number;
  category: string;
  createdAt?: string;
  [key: string]: unknown;
};

// Update ProductsResponse to use Product[]
type ProductsResponse = {
  products: Product[];
  total: number;
};

let cachedTotal: { count: number; timestamp: number } | null = null;
const CACHE_DURATION = 60000; 

async function getTotalCount(search = '', category = ''): Promise<number> {
  const now = Date.now();
  
  if (
    cachedTotal &&
    !search &&
    !category &&
    now - cachedTotal.timestamp < CACHE_DURATION
  ) {
    return cachedTotal.count;
  }

  const params = new URLSearchParams({
    sortBy: 'createdAt',
    order: 'desc',
  });
  
  if (search) {
    params.append('search', search);
  }

  if (category) {
    params.append('category', category);
  }

  const url = `${BASE_URL}/products?${params.toString()}`;
  const res = await fetch(url);
  
  if (!res.ok) {
    return 0;
  }

  const totalCount = res.headers.get('X-Total-Count');
  
  if (totalCount) {
    const count = parseInt(totalCount, 10);
    
    if (!search && !category) {
      cachedTotal = { count, timestamp: now };
    }
    
    return count;
  }

  const allProducts = await res.json();
  const count = allProducts.length;

  if (!search && !category) {
    cachedTotal = { count, timestamp: now };
  }
  
  return count;
}

export async function getProducts(
  page: number,
  search = '',
  category = '',
  limit = 5
): Promise<ProductsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy: 'createdAt',
    order: 'desc',
  });

  if (search) {
    params.append('search', search);
  }

  if (category) {
    params.append('category', category);
  }

  const [productsRes, total] = await Promise.all([
    fetch(`${BASE_URL}/products?${params.toString()}`),
    getTotalCount(search, category),
  ]);

  if (!productsRes.ok) {
    throw new Error('Failed to fetch products');
  }

  const products = await productsRes.json();

  return {
    products,
    total,
  };
}

export async function createProduct(data: unknown) {
  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to create product');
  }

  cachedTotal = null;

  return res.json();
}