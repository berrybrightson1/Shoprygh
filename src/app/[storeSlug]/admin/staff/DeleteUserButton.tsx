"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export default function DeleteUserButton({ onDelete, userId }: { onDelete: (formData: FormData) => void, userId: string }) {

    // We wrap the server action in a client handler to add confirmation
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const confirmed = window.confirm("Are you sure you want to revoke access? This action cannot be undone.");
        if (confirmed) {
            const formData = new FormData(e.currentTarget);
            onDelete(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex">
            <input type="hidden" name="id" value={userId} />
            <SubmitButton />
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            title="Revoke Access"
            disabled={pending}
            className="p-3 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 border border-gray-100 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
        >
            {pending ? <span className="animate-spin w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full block" /> : <Trash2 size={20} strokeWidth={2.5} />}
        </button>
    );
}
