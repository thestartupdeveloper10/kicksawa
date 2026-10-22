/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2.5rem",
        xl: "3rem",
      },
      screens: {
        "2xl": "1536px",
      },
    },
    extend: {
      screens: {
        xs: "480px",
      },

      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Flat surfaces — product swatches, rails, wells.
        surface: {
          DEFAULT: "hsl(var(--surface))",
          2: "hsl(var(--surface-2))",
          3: "hsl(var(--surface-3))",
        },
        // Hairlines, separate from `border` so dividers can be tuned alone.
        line: {
          DEFAULT: "hsl(var(--line))",
          strong: "hsl(var(--line-strong))",
        },

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        subtle: {
          foreground: "hsl(var(--subtle-foreground))",
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
        },

        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
        },
        volt: {
          DEFAULT: "hsl(var(--volt))",
          foreground: "hsl(var(--volt-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
      },

      fontFamily: {
        sans: ['Archivo', 'Helvetica Neue', 'Helvetica', 'system-ui', 'sans-serif'],
        display: ['Archivo', 'Helvetica Neue', 'Helvetica', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        // Display scale. Fluid so the hero never needs a breakpoint ladder.
        // Line heights are sub-1 on purpose — stacked caps should lock up.
        'display-2xl': ['clamp(3.25rem, 11vw, 8.5rem)', { lineHeight: '0.86', letterSpacing: '-0.035em' }],
        'display-xl': ['clamp(2.5rem, 7.5vw, 5.5rem)', { lineHeight: '0.9', letterSpacing: '-0.032em' }],
        'display-lg': ['clamp(2rem, 5vw, 3.75rem)', { lineHeight: '0.94', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(1.625rem, 3.6vw, 2.5rem)', { lineHeight: '1', letterSpacing: '-0.025em' }],
        'display-sm': ['clamp(1.25rem, 2.4vw, 1.75rem)', { lineHeight: '1.06', letterSpacing: '-0.02em' }],

        // Micro type — the uppercase labels that carry most of the chrome.
        'eyebrow': ['0.6875rem', { lineHeight: '1', letterSpacing: '0.14em' }],
        'micro': ['0.75rem', { lineHeight: '1.25', letterSpacing: '0.06em' }],
      },

      letterSpacing: {
        tightest: '-0.045em',
        display: '-0.03em',
        eyebrow: '0.14em',
        wider: '0.06em',
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 1px)",
        sm: "calc(var(--radius) - 2px)",
      },

      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        pop: "var(--shadow-pop)",
        none: "none",
      },

      transitionTimingFunction: {
        swift: "cubic-bezier(0.2, 0, 0, 1)",
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        "in-out-quart": "cubic-bezier(0.65, 0, 0.35, 1)",
      },

      transitionDuration: {
        fast: "150ms",
        DEFAULT: "250ms",
        slow: "450ms",
      },

      spacing: {
        header: "var(--header-h)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        // Page-load / scroll reveals.
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        // Display type wiping up from behind a mask.
        "reveal-up": {
          from: { transform: "translateY(105%)" },
          to: { transform: "translateY(0)" },
        },
        // Brand rail. Track holds two identical copies; -50% loops seamlessly.
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 220ms cubic-bezier(0.2, 0, 0, 1)",
        "accordion-up": "accordion-up 180ms cubic-bezier(0.2, 0, 0, 1)",
        "fade-up": "fade-up 620ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "reveal-up": "reveal-up 760ms cubic-bezier(0.22, 1, 0.36, 1) both",
        marquee: "marquee var(--marquee-duration, 40s) linear infinite",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
