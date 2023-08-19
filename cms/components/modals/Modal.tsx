"use client";

import {
  Dialog,
  DialogContent,
//   DialogCloseIcon,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogCloseIcon
} from "@/components/Dialog";
import { Button } from "@/components/ui/button";
import { useStoreModal } from "@/hooks/use-store-modal";

interface ModalProps {
  title: string;
  description: string;
  preventClose?: boolean;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const Modal = ({
  title,
  description,
  preventClose,
  isOpen,
  onClose,
  children,
}: ModalProps) => {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent

        // this prevents the close on interaction outside function
        onInteractOutside={(event) => preventClose && event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <DialogCloseIcon disabled={preventClose} />
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
};
