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
                            }: ConfirmationDialogProps) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
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
                        <Button variant="outline" color={isDanger ? "danger" : "tertiary"} onClick={() => onOpenChange(false)}>
                            {cancelText}
                        </Button>
                    )}
                    <Button
                        variant="filled"
                        color={isDanger ? "danger" : "primary"}
                        onClick={() => {
                            onOpenChange(false);
                            setTimeout(() => {
                                onConfirm();
                            }, 150);
                        }}
                    >
                        {confirmText}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ConfirmationDialog;
