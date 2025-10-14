# Style Guide for Observatory Visualizer

This document provides a detailed breakdown of the custom styles, CSS variables (design tokens), and component classes defined in `src/styles/globals.css`.

## Theming and Colors

The application has a light and a dark theme. The colors are defined using CSS variables, which are then applied to components. The `.dark` class on the `<html>` element toggles the theme.

### Color Variables (Design Tokens)

These variables are defined for both light (`:root`) and dark (`.dark`) modes.

| Variable Name                  | Description                                                              |
| ------------------------------ | ------------------------------------------------------------------------ |
| `--background`                 | The main background gradient of the application.                         |
| `--foreground`                 | The primary text color.                                                  |
| `--card` / `--card-foreground` | Background and text color for card-like components.                      |
| `--popover` / `--popover-foreground` | Background and text color for popovers.                                |
| `--primary` / `--primary-foreground` | Primary accent color (e.g., for buttons) and its corresponding text color. |
| `--secondary` / `--secondary-foreground` | Secondary accent color and its text color.                             |
| `--muted` / `--muted-foreground`   | Muted colors for less prominent elements and text.                     |
| `--accent` / `--accent-foreground` | An accent color, often used for hover states, and its text color.        |
| `--destructive` / `--destructive-foreground` | Colors for actions that delete or destroy data, and its text color.    |
| `--border`                     | Default border color for components.                                     |
| `--input` / `--input-background` | Colors for input fields.                                                 |
| `--switch-background`          | Background color for the unchecked state of a switch component.          |
| `--ring`                       | Color for focus rings on interactive elements.                           |
| `--chart-1` to `--chart-5`     | A set of 5 distinct colors for use in charts and data visualizations.    |

### Sidebar-Specific Colors

A separate set of color variables is defined for the sidebar to allow it to have a distinct theme.

| Variable Name                       | Description                                                              |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `--sidebar` / `--sidebar-foreground`| Background and text color for the sidebar.                               |
| `--sidebar-primary` / `--sidebar-primary-foreground` | Primary accent color used within the sidebar.                        |
| `--sidebar-accent` / `--sidebar-accent-foreground` | Accent color for hover states within the sidebar.                     |
| `--sidebar-border`                  | Border color used within the sidebar.                                    |
| `--sidebar-ring`                    | Focus ring color for interactive elements within the sidebar.          |

## Layout and Sizing

| Variable Name | Description                                     |
| ------------- | ----------------------------------------------- |
| `--radius`    | The base border-radius for components (`0.75rem`). |
| `--font-size` | The root font size of the application (`16px`).   |

## Typography

Base typography styles are applied to standard HTML elements like `h1`, `p`, etc., inside the `@layer base`. These styles are only applied if no Tailwind text utility class (e.g., `text-lg`) is present on an ancestor element.

| Element(s)       | Font Size         | Font Weight                |
| ---------------- | ----------------- | -------------------------- |
| `h1`             | `var(--text-2xl)` | `var(--font-weight-medium)` |
| `h2`             | `var(--text-xl)`  | `var(--font-weight-medium)` |
| `h3`             | `var(--text-lg)`  | `var(--font-weight-medium)` |
| `h4`             | `var(--text-base)`| `var(--font-weight-medium)` |
| `p`              | `var(--text-base)`| `var(--font-weight-normal)` |
| `label`, `button`| `var(--text-base)`| `var(--font-weight-medium)` |
| `input`          | `var(--text-base)`| `var(--font-weight-normal)` |

### Font Weights

| Variable Name          | Value |
| ---------------------- | ----- |
| `--font-weight-normal` | `400` |
| `--font-weight-medium` | `500` |

## Custom Component Classes

These classes are defined in the `@layer components` and can be applied to your elements to get consistent styling.

### `.glass`

This class applies a "glass morphism" effect to an element. It creates a semi-transparent, blurred background.

**Styles:**
-   `backdrop-filter`: `blur(var(--blur-xl))`
-   `background-color`: `var(--card)` with 70% opacity
-   `border-color`: `var(--border)` with 50% opacity

**Usage:**
```html
<div class="glass p-4 rounded-lg">
  This container has a glassy effect.
</div>
```

### `.glass-strong`

A stronger version of the `.glass` effect with more blur and opacity.

**Styles:**
-   `backdrop-filter`: `blur(var(--blur-2xl))`
-   `background-color`: `var(--card)` with 80% opacity
-   `border-color`: `var(--border)` with 60% opacity

**Usage:**
```html
<div class="glass-strong p-4 rounded-lg">
  This container has a stronger glassy effect.
</div>
```

## Animations

### `gradientShift`

This is a keyframe animation that animates the `background-position` of an element. It's used on the `<body>` to create a slow-moving gradient background.

-   **Duration:** 20 seconds
-   **Timing Function:** `ease`
-   **Iteration:** `infinite`

### Interactive Element Animations

A set of base transitions and animations are applied to interactive elements for a more dynamic feel.

#### `button`
-   **Transition:** `all` properties, `0.2s`, `ease-out`
-   **Hover:** Scales up to `1.02` and adds a `shadow-lg`.
-   **Active (Click):** Scales down to `0.98`.

#### `input`, `select`, `textarea`
-   **Transition:** `all` properties, `0.2s`, `ease-out`
-   **Focus:** Scales up to `1.01` and adds a `shadow-md`.

## How to Use This Guide

1.  **Consistency:** When creating new components, use the CSS variables defined here (e.g., `bg-primary`, `text-foreground`) instead of hard-coding color values. This ensures that your components will automatically adapt to light and dark themes.
2.  **Component Styles:** Use the `.glass` and `.glass-strong` classes for any container that needs a blurred, semi-transparent background.
3.  **Typography:** Rely on Tailwind's text utilities (`text-sm`, `text-lg`, etc.) for sizing. The base typography is a fallback.
4.  **Extending:** If you need a new color or style, add it to `globals.css` as a CSS variable in both `:root` and `.dark` to maintain theme consistency.

By following this guide, you can ensure that the visual elements of the observatory visualizer remain consistent and easy to maintain.

