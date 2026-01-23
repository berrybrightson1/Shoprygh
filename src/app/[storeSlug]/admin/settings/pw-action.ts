"use server";

import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!currentPassword || !newPassword) {
        return { error: "All fields are required" };
    }

    try {
        const supabase = await createClient();

        // 1. Get current user to verify session and get email
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user || !user.email) {
            return { error: "You must be logged in to update your password" };
        }

        // 2. Re-authenticate to verify current password
        // We create a separate client or just use the API to verify credentials without disrupting the main session?
        // signInWithPassword will update the session cookies in this context, which is actually fine (refreshes session).
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword
        });

        if (signInError) {
            console.error("Re-auth failed:", signInError);
            return { error: "Incorrect current password" };
        }

        // 3. Update password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            console.error("Update failed:", updateError);
            return { error: updateError.message };
        }

        return { success: true };

    } catch (e) {
        console.error(e);
        return { error: "An unexpected error occurred" };
    }
}
