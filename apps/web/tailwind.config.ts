import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nomadly v3 — Clean Light Design System
        background: "#FAFAF8",
        surface: "#FFFFFF",
        "surface-2": "#F5F4F0",
        "surface-3": "#EEECE7",

        primary: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
          light: "#EEF2FF",
          foreground: "#FFFFFF",
        },

        accent: {
          DEFAULT: "#7C3AED",
          hover: "#6D28D9",
          light: "#F5F3FF",
        },

        success: {
          DEFAULT: "#059669",
          light: "#ECFDF5",
          border: "#A7F3D0",
        },
        warning: {
          DEFAULT: "#D97706",
          light: "#FFFBEB",
          border: "#FDE68A",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEF2F2",
          border: "#FECACA",
        },

        text: {
          primary: "#111827",
          secondary: "#374151",
          muted: "#6B7280",
          subtle: "#9CA3AF",
        },

        border: "#E5E7EB",
        "border-strong": "#D1D5DB",
      },

      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },

      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        snug: "-0.01em",
      },

      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },

      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.05)",
        sm: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        DEFAULT: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
        md: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        lg: "0 10px 30px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.04)",
        xl: "0 20px 60px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06)",
        "card": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 30px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)",
        "primary-glow": "0 4px 20px rgba(79,70,229,0.25)",
        "primary-glow-lg": "0 8px 40px rgba(79,70,229,0.3)",
        "inset": "inset 0 2px 4px rgba(0,0,0,0.06)",
      },

      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
        "gradient-warm": "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
        "gradient-hero": "linear-gradient(160deg, #EEF2FF 0%, #F5F3FF 40%, #FDF4FF 70%, #FAFAF8 100%)",
      },

      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "entrance": "entrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "gradient-shift": "gradientShift 6s ease infinite",
      },

      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { transform: "translateY(16px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        entrance: {
          from: { transform: "translateY(20px) scale(0.97)", opacity: "0" },
          to: { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },

      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
        "spring-bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
