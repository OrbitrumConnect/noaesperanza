import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Wellness colors
				glass: 'var(--glass-bg)',
				'glass-border': 'hsl(var(--glass-border))',
				highlight: 'hsl(var(--highlight))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-section': 'var(--gradient-section)',
			},
			backdropBlur: {
				'xs': '2px',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xl': '1rem',
				'3xl': '1.5rem'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				// Animações para micropartículas do buraco negro
				"moveOut0": {
					"0%": { transform: "scale(0) translate(0, 0)", opacity: "0" },
					"10%": { opacity: "1" },
					"100%": { transform: "scale(1) translate(200px, 0)", opacity: "0" }
				},
				"moveOut1": {
					"0%": { transform: "scale(0) translate(0, 0)", opacity: "0" },
					"10%": { opacity: "1" },
					"100%": { transform: "scale(1) translate(0, 200px)", opacity: "0" }
				},
				"moveOut2": {
					"0%": { transform: "scale(0) translate(0, 0)", opacity: "0" },
					"10%": { opacity: "1" },
					"100%": { transform: "scale(1) translate(-200px, 0)", opacity: "0" }
				},
				"moveOut3": {
					"0%": { transform: "scale(0) translate(0, 0)", opacity: "0" },
					"10%": { opacity: "1" },
					"100%": { transform: "scale(1) translate(0, -200px)", opacity: "0" }
				},
				"float0": {
					"0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
					"50%": { transform: "translateY(-20px) rotate(180deg)" }
				},
				"float1": {
					"0%, 100%": { transform: "translateX(0px) rotate(0deg)" },
					"50%": { transform: "translateX(-15px) rotate(180deg)" }
				},
				"float2": {
					"0%, 100%": { transform: "translate(0px, 0px) rotate(0deg)" },
					"33%": { transform: "translate(10px, -10px) rotate(120deg)" },
					"66%": { transform: "translate(-10px, 10px) rotate(240deg)" }
				},
				"float3": {
					"0%, 100%": { transform: "translateY(0px) scale(1)" },
					"50%": { transform: "translateY(-10px) scale(1.1)" }
				},
				"float4": {
					"0%, 100%": { transform: "translateX(0px) scale(1)" },
					"50%": { transform: "translateX(10px) scale(0.9)" }
				},
				"float5": {
					"0%, 100%": { transform: "rotate(0deg)" },
					"50%": { transform: "rotate(360deg)" }
				},
				"escape0": {
					"0%": { transform: "scale(0.5)", opacity: "0.8" },
					"100%": { transform: "scale(0) translate(300px, 0)", opacity: "0" }
				},
				"escape1": {
					"0%": { transform: "scale(0.5)", opacity: "0.8" },
					"100%": { transform: "scale(0) translate(-300px, 0)", opacity: "0" }
				},
				"escape2": {
					"0%": { transform: "scale(0.5)", opacity: "0.8" },
					"100%": { transform: "scale(0) translate(0, -300px)", opacity: "0" }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				// Animações do buraco negro
				"moveOut0": "moveOut0 6s linear infinite",
				"moveOut1": "moveOut1 7s linear infinite", 
				"moveOut2": "moveOut2 5s linear infinite",
				"moveOut3": "moveOut3 8s linear infinite",
				"float0": "float0 4s ease-in-out infinite",
				"float1": "float1 5s ease-in-out infinite",
				"float2": "float2 6s ease-in-out infinite",
				"float3": "float3 3s ease-in-out infinite",
				"float4": "float4 4s ease-in-out infinite",
				"float5": "float5 8s linear infinite",
				"escape0": "escape0 8s linear infinite",
				"escape1": "escape1 9s linear infinite",
				"escape2": "escape2 7s linear infinite"
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
