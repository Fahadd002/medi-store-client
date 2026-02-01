"use client";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import React from "react";

interface ConfirmAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  actionLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: "default" | "destructive" | "success" | "warning";
  onConfirm: () => void | Promise<void>;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

const getVariantStyles = (variant: "default" | "destructive" | "success" | "warning") => {
  switch (variant) {
    case "destructive":
      return {
        bgColor: "bg-red-100",
        textColor: "text-red-600",
        iconColor: "text-red-600",
        buttonColor: "bg-red-600 hover:bg-red-700 focus:ring-red-600",
      };
    case "success":
      return {
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        iconColor: "text-green-600",
        buttonColor: "bg-green-600 hover:bg-green-700 focus:ring-green-600",
      };
    case "warning":
      return {
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
        iconColor: "text-yellow-600",
        buttonColor: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-600",
      };
    default:
      return {
        bgColor: "bg-blue-100",
        textColor: "text-blue-600",
        iconColor: "text-blue-600",
        buttonColor: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600",
      };
  }
};

const getDefaultIcon = (variant: "default" | "destructive" | "success" | "warning") => {
  switch (variant) {
    case "destructive":
      return <AlertTriangle className="h-5 w-5" />;
    case "success":
      return <CheckCircle className="h-5 w-5" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5" />;
    default:
      return <Info className="h-5 w-5" />;
  }
};

export function ConfirmAlert({
  open,
  onOpenChange,
  title,
  description,
  actionLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  variant = "default",
  onConfirm,
  children,
  icon,
}: ConfirmAlertProps) {
  const styles = getVariantStyles(variant);
  const displayIcon = icon || getDefaultIcon(variant);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${styles.bgColor} flex items-center justify-center`}>
              <div className={styles.iconColor}>{displayIcon}</div>
            </div>
            <div>
              <AlertDialogTitle className="text-gray-900">{title}</AlertDialogTitle>
              {description && (
                <AlertDialogDescription className="text-gray-600">
                  {description}
                </AlertDialogDescription>
              )}
            </div>
          </div>
        </AlertDialogHeader>

        {children && <div className="py-4">{children}</div>}

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel
            disabled={isLoading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={`${styles.buttonColor} text-white`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              actionLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface InfoAlertProps {
  message: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  icon?: React.ReactNode;
}

export function InfoAlert({ message, description, variant = "default", icon }: InfoAlertProps) {
  const styles = getVariantStyles(variant);
  const displayIcon = icon || getDefaultIcon(variant);

  return (
    <Alert variant={variant === "destructive" ? "destructive" : "default"} className="mb-4">
      <div className="flex items-start gap-3">
        <div className={styles.iconColor}>{displayIcon}</div>
        <div className="flex-1">
          <div className={`font-semibold ${styles.textColor}`}>{message}</div>
          {description && <AlertDescription className="text-sm mt-1">{description}</AlertDescription>}
        </div>
      </div>
    </Alert>
  );
}
