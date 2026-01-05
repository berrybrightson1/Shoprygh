"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logActivity } from "@/lib/audit";
import { getSession } from "@/lib/auth";

export async function logout() {
    const session = await getSession();
    if (session) {
        try {
            await logActivity("LOGOUT", "User logged out", "USER", session.id);
        } catch (e) {
            console.error("Logout log failed", e);
        }
    }

    (await cookies()).delete("session");
    redirect("/login");
}
