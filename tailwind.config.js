/**
 * -------------------------------------------------------------------------------
 * Author: Mohamed Salem (Expert AI Engineer & Automation Architect)
 * Focus: AI Engineering | Automation | Agentic Systems
 * Copyright (c) 2026. All Rights Reserved.
 * -------------------------------------------------------------------------------
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./tour.html",
        "./admin.html",
        "./assets/js/**/*.js"
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ["Cairo", "Inter", "system-ui", "-apple-system", "Segoe UI", "Tahoma", "Arial", "sans-serif"],
                en: ["Inter", "Cairo", "system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"]
            },
            colors: {
                champagne: {
                    DEFAULT: "#D9B36C",
                    light: "#EDD29B",
                    dark: "#B88E44"
                },
                copper: {
                    DEFAULT: "#D96B38",
                    dark: "#B55122"
                },
                sea: {
                    DEFAULT: "#2CB5A0",
                    dark: "#1D8A79"
                },
                carbon: {
                    950: "#08090C",
                    900: "#0E1015",
                    800: "#161922",
                    700: "#232836"
                }
            }
        }
    },
    plugins: []
};
