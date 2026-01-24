"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useTransition } from "react";

export default function DeleteUserButton({ onDelete, userId }: { onDelete: (formData: FormData) => Promise<void>, userId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        toast("Revoke access for this member?", {
            description: "This action cannot be undone.",
            action: {
                label: "Revoke",
                onClick: () => {
                    startTransition(async () => {
                        const formData = new FormData();
                        formData.append("id", userId);

                        toast.promise(onDelete(formData), {
                            loading: 'Revoking access...',
                            success: 'Access revoked successfully',
                            error: 'Failed to revoke access'
                        });
                    });
                }
            },
            cancel: {
                label: "Cancel",
                onClick: () => { }
            },
            duration: 8000,
        });
    };

    return (
        <button
            title="Revoke Access"
            disabled={isPending}
            onClick={handleDelete}
            className="p-2.5 md:p-3 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 border border-gray-100 rounded-xl md:rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
        >
            {isPending ? (
                <span className="animate-spin w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full block" />
            ) : (
                <Trash2 size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
            )}
        </button>
    );
}
