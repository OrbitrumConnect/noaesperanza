import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Congress theme colors
        "congress-green": {
          DEFAULT: "hsl(var(--congress-green))",
          foreground: "hsl(var(--congress-green-foreground))",
        },
        "congress-light": {
          DEFAULT: "hsl(var(--congress-light))",
          foreground: "hsl(var(--congress-light-foreground))",
        },
        
        // Organic gradient stops
        "organic": {
          "light-green": "hsl(var(--bg-light-green))",
          "green": "hsl(var(--bg-green))",
          "blue": "hsl(var(--bg-blue))",
          "purple": "hsl(var(--bg-purple))",
          "deep-purple": "hsl(var(--bg-deep-purple))",
        },
        
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          translucent: "hsl(var(--card-translucent) / 0.9)",
          "translucent-foreground": "hsl(var(--card-translucent-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-slide-in": {
          "0%": {
            opacity: "0",
            transform: "translateX(100px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)"
          }
        },
        "fade-slide-out": {
          "0%": {
            opacity: "1",
            transform: "translateX(0)"
          },
          "100%": {
            opacity: "0",
            transform: "translateX(100px)"
          }
        },
        "venue-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--congress-light) / 0.3)"
          },
          "50%": {
            boxShadow: "0 0 40px hsl(var(--congress-light) / 0.6)"
          }
        },
        "countdown": {
          "0%": {
            transform: "scale(1)"
          },
          "50%": {
            transform: "scale(1.05)"
          },
          "100%": {
            transform: "scale(1)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-slide-in": "fade-slide-in 0.4s ease-out",
        "fade-slide-out": "fade-slide-out 0.4s ease-out", 
        "venue-pulse": "venue-pulse 3s ease-in-out infinite",
        "countdown": "countdown 2s ease-in-out infinite",
      },
      backgroundImage: {
        "organic-gradient": "var(--gradient-organic)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
