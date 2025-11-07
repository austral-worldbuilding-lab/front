import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ConfirmationDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    cancelText?: string;
    confirmText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
    children?: React.ReactNode;
    loading?: boolean;
}

const ConfirmationDialog = ({
                                isOpen,
                                onOpenChange,
                                title,
                                description,
                                cancelText = "Cancelar",
                                confirmText = "Confirmar",
                                isDanger = false,
                                onConfirm,
                                loading = false,
                            }: ConfirmationDialogProps) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={loading ? undefined : onOpenChange}>
            <AlertDialogContent
                className={cn(
                    "max-w-md border",
                    isDanger ? "border-red-500" : "border-gray-200"
                )}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle
                        className={cn(
                            "text-lg font-bold text-left",
                            isDanger ? "text-red-600" : "text-gray-900"
                        )}
                    >
                        {title}
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-sm text-gray-600 text-left">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex pt-4 space-x-0">
                    {cancelText && (
                        <Button 
                            variant="outline" 
                            color={isDanger ? "danger" : "tertiary"} 
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            {cancelText}
                        </Button>
                    )}
                    <Button
                        variant="filled"
                        color={isDanger ? "danger" : "primary"}
                        onClick={() => {
                            if (!loading) {
                                onConfirm();
                            }
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                Eliminando...
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ConfirmationDialog;
