import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Anaya Baby Care",
        short_name: "Anaya",
        description: "Your favorite baby care store.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#06B6D4",
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
            {
                src: "/web-app-manifest-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable"
            },
            {
                src: "/web-app-manifest-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable"
            },
        ],
    };
}
