import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  customerName: string;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  customerName,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-2">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Er du sikker?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Du er ved at slette <span className="font-semibold text-foreground">{customerName}</span>.
            <br />
            <span className="text-destructive font-medium mt-2 block">
              Denne handling kan ikke fortrydes.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3 sm:gap-3">
          <AlertDialogCancel 
            className="flex-1 rounded-xl border-border"
            disabled={isLoading}
          >
            Annuller
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sletter...
              </>
            ) : (
              'Slet Kunde'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
