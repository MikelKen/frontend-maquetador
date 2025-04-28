import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

function AlerDialog({ open, onOpenChange, onConfirm }: AlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#0f172acc] text-cyan-100 border border-cyan-700 backdrop-blur-md rounded-2xl shadow-2xl p-6 transition-all">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-cyan-400 text-xl font-bold">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-cyan-200">
            This action cannot be undone. This will permanently delete your project.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel className="border border-cyan-700 text-cyan-300 hover:bg-cyan-700/20 transition-all">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white transition-all">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AlerDialog;
