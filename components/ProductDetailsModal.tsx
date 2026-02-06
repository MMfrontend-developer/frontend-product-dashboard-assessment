'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Props = {
  product: any;
  onClose: () => void;
};

export default function ProductDetailsModal({ product, onClose }: Props) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <p><strong>Name:</strong> {product.name}</p>
          <p><strong>Price:</strong> ₦{product.price}</p>
          <p><strong>Category:</strong> {product.category}</p>
          {product.description && <p><strong>Description:</strong> {product.description}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
