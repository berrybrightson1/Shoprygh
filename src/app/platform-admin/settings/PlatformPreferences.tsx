"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ShieldOff, Zap } from "lucide-react";

export default function PlatformPreferences() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [registrationsPaused, setRegistrationsPaused] = useState(false);
    const [betaFeatures, setBetaFeatures] = useState(true);

    const handleToggle = (setting: string, current: boolean, setter: (val: boolean) => void) => {
        const newState = !current;
        setter(newState);

        if (setting === "maintenance") {
            if (newState) {
                toast.error("Maintenance Mode Enabled. Storefronts are now locked.");
            } else {
                toast.success("Maintenance Mode Disabled. Storefronts are live.");
            }
        } else {
            toast.success(`${setting} updated successfully.`);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {/* Maintenance Mode */}
            <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg mt-1 ${maintenanceMode ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">Maintenance Mode</h4>
                        <p className="text-sm text-gray-500 mt-1">Prevents non-admin users from accessing the store fronts.</p>
                    </div>
                </div>
                <button
                    onClick={() => handleToggle("maintenance", maintenanceMode, setMaintenanceMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20 ${maintenanceMode ? "bg-red-600" : "bg-gray-200"
                        }`}
                    title={maintenanceMode ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
                >
                    <span
                        className={`${maintenanceMode ? "translate-x-6" : "translate-x-1"
                            } inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform`}
                    />
                </button>
            </div>

            {/* Pause Registrations */}
            <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 text-gray-500 rounded-lg mt-1">
                        <ShieldOff size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">Pause Registrations</h4>
                        <p className="text-sm text-gray-500 mt-1">Temporarily disable new vendor signups.</p>
                    </div>
                </div>
                <button
                    onClick={() => handleToggle("Registration status", registrationsPaused, setRegistrationsPaused)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black/10 ${registrationsPaused ? "bg-black" : "bg-gray-200"
                        }`}
                    title={registrationsPaused ? "Resume Registrations" : "Pause Registrations"}
                >
                    <span
                        className={`${registrationsPaused ? "translate-x-6" : "translate-x-1"
                            } inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform`}
                    />
                </button>
            </div>

            {/* Beta Features */}
            <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-cyan-50 text-cyan-700 rounded-lg mt-1">
                        <Zap size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">Beta Features</h4>
                        <p className="text-sm text-gray-500 mt-1">Access experimental tools and UI updates.</p>
                    </div>
                </div>
                <button
                    onClick={() => handleToggle("Beta features", betaFeatures, setBetaFeatures)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${betaFeatures ? "bg-cyan-600" : "bg-gray-200"
                        }`}
                    title={betaFeatures ? "Disable Beta Features" : "Enable Beta Features"}
                >
                    <span
                        className={`${betaFeatures ? "translate-x-6" : "translate-x-1"
                            } inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform`}
                    />
                </button>
            </div>
        </div>
    );
}
