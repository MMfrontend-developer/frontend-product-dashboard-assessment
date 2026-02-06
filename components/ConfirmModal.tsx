'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type Props = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({ message, onConfirm, onCancel }: Props) {
  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
        </DialogHeader>

        <div className="py-2">{message}</div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onConfirm}>
            Yes
          </Button>
          <Button variant="outline" onClick={onCancel}>
            No
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
