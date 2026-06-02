import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  corePlugins: {
    // Preflight resets conflict with existing global.css base styles.
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: "#09090b",
          card: "rgba(24, 24, 27, 0.6)",
          surface2: "rgba(24, 24, 27, 0.7)",
          surface3: "rgba(39, 39, 42, 0.5)",
          elevated: "rgba(63, 63, 70, 0.35)",
          overlay: "rgba(9, 9, 11, 0.85)",
        },
        accent: {
          primary: "#8b5cf6",
          "primary-hover": "#9f75ff",
          secondary: "#06b6d4",
          "secondary-hover": "#22d3ee",
        },
        content: {
          main: "#f8fafc",
          secondary: "#cbd5e1",
          muted: "#94a3b8",
          placeholder: "#64748b",
          disabled: "rgba(148, 163, 184, 0.4)",
        },
        glass: {
          bg: "rgba(24, 24, 27, 0.7)",
          border: "rgba(255, 255, 255, 0.08)",
          highlight: "rgba(255, 255, 255, 0.06)",
          light: "rgba(255, 255, 255, 0.03)",
        },
        border: {
          DEFAULT: "rgba(63, 63, 70, 0.4)",
          subtle: "rgba(255, 255, 255, 0.05)",
          strong: "rgba(255, 255, 255, 0.15)",
        },
        success: {
          DEFAULT: "#10b981",
          muted: "rgba(16, 185, 129, 0.15)",
        },
        warning: {
          DEFAULT: "#f59e0b",
          muted: "rgba(245, 158, 11, 0.15)",
        },
        error: {
          DEFAULT: "#ef4444",
          muted: "rgba(239, 68, 68, 0.15)",
        },
        info: {
          DEFAULT: "#3b82f6",
          muted: "rgba(59, 130, 246, 0.15)",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-outfit)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        btn: "12px",
        "btn-sm": "8px",
        "btn-lg": "14px",
        card: "16px",
        panel: "20px",
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(139, 92, 246, 0.4)",
        "glow-secondary": "0 0 20px rgba(6, 182, 212, 0.4)",
        "glow-success": "0 0 20px rgba(16, 185, 129, 0.35)",
        "glow-danger": "0 0 20px rgba(239, 68, 68, 0.45)",
        "btn-primary": "0 4px 12px rgba(139, 92, 246, 0.3)",
        "btn-danger": "0 4px 12px rgba(239, 68, 68, 0.3)",
        card: "0 4px 24px rgba(0, 0, 0, 0.3)",
        glass:
          "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        "glass-sm": "0 4px 16px rgba(0, 0, 0, 0.35)",
      },
      backdropBlur: {
        xs: "4px",
        glass: "20px",
      },
      maxWidth: {
        layout: "1400px",
        "layout-wide": "1520px",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #8b5cf6, #06b6d4)",
        "gradient-primary-hover":
          "linear-gradient(135deg, #9f75ff, #22d3ee)",
        "gradient-danger": "linear-gradient(135deg, #ef4444, #f97316)",
        "gradient-brand":
          "linear-gradient(135deg, #fff 0%, #94a3b8 100%)",
        "gradient-surface":
          "linear-gradient(135deg, rgba(24,24,27,0.6), rgba(39,39,42,0.5))",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      animation: {
        "spin-slow": "spin 2s linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      zIndex: {
        base: "0",
        raised: "10",
        dropdown: "100",
        sticky: "200",
        overlay: "300",
        modal: "400",
        toast: "500",
      },
    },
  },
  plugins: [],
};

export default config;
