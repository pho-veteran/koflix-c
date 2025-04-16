import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// App branding
export const NETFLIX_RED = "#E50914"; // Primary brand color
export const APP_NAME = "KOFLIX";

// Layout dimensions
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Header layout
export const HEADER_HEIGHT = 60; // Standard header height

// Carousel constants
export const CAROUSEL_HEIGHT = width * 0.65;
export const CAROUSEL_AUTO_PLAY_INTERVAL = 7000;
export const CAROUSEL_ANIMATION_DURATION = 200;

// Movie card dimensions
export const CARD_WIDTH = width * 0.34;
export const CARD_HEIGHT = CARD_WIDTH * 1.5;
export const THUMB_WIDTH = width * 0.6;
export const THUMB_HEIGHT = THUMB_WIDTH * 0.56;
export const FEATURED_HEIGHT = width * 0.65;

// Animation timings
export const ANIMATION = {
    FADE_IN_DURATION: 600,
    FEATURE_FADE_DURATION: 800,
    SLIDE_DOWN_DURATION: 400,
    SLIDE_DOWN_DELAY_1: 300,
    SLIDE_DOWN_DELAY_2: 500,
    IMAGE_TRANSITION: 300,
};

// Pagination dot styling
export const PAGINATION = {
    DOT_WIDTH: 4,
    DOT_HEIGHT: 3,
    DOT_BORDER_RADIUS: 2,
    DOT_MARGIN: 3,
    INACTIVE_COLOR: "rgba(255, 255, 255, 0.3)",
};

// Loading / refreshing state
export const LOADING = {
    INDICATOR_COLOR: NETFLIX_RED,
    REFRESH_BACKGROUND: "#121212",
};

// Text styling
export const TEXT_STYLING = {
    SHADOW_COLOR: "rgba(229, 9, 20, 0.3)",
    SHADOW_OFFSET: { width: 0, height: 0 },
    SHADOW_RADIUS: 10,
};

// Gradient colors for various overlays
export const GRADIENTS = {
    TOP_FADE: ["rgba(0,0,0,0.7)", "rgba(0,0,0,0.3)", "transparent"] as const,
    TOP_FADE_LOCATIONS: [0, 0.5, 1.0] as const,

    BOTTOM_FADE: [
        "transparent",
        "rgba(0,0,0,0.6)",
        "rgba(0,0,0,0.85)",
        "rgba(0,0,0,0.95)",
    ] as const,
    BOTTOM_FADE_LOCATIONS: [0.1, 0.5, 0.8, 1.0] as const,

    THUMBNAIL_FADE: [
        "transparent",
        "rgba(0, 0, 0, 0.7)",
        "rgba(0, 0, 0, 0.95)",
    ] as const,
    THUMBNAIL_FADE_LOCATIONS: [0.4, 0.75, 1.0] as const,

    HEADER_OPACITY_INPUT_RANGE: [0, 50, 100] as const,
    HEADER_OPACITY_OUTPUT_RANGE: [0, 0.85, 0.98] as const,
};

// Parallax mode config
export const PARALLAX_CONFIG = {
    SCALE: 0.95,
    OFFSET: 40,
};

// Grid display configurations
export const GRID_CONFIG = {
    DEFAULT_COLUMNS: 2,
    MEDIUM_SCREEN_COLUMNS: 3, // For screen width >= 600
    LARGE_SCREEN_COLUMNS: 4, // For screen width >= 900
    MEDIUM_SCREEN_WIDTH: 600,
    LARGE_SCREEN_WIDTH: 900,
    GAP: 12,
};
