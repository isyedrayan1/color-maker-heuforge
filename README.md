# color-maker-heuforge

HueForge - Color Palette Generator
Project Overview
HueForge is a web-based color palette generator designed to help users create stunning and harmonious color schemes effortlessly. Built for a hackathon, this tool caters to designers, developers, and creatives by offering two modes: Generate Mode for random harmonized palettes and Image Mode for extracting colors from uploaded images. With a sleek glassmorphism UI, live UI previews, and export options, HueForge simplifies the process of crafting and utilizing color palettes.
Features

Dual Modes:
Generate Mode: Creates a harmonized 5-color palette using HSL color space with analogous and complementary hues.
Image Mode: Extracts a 5-color palette from an uploaded image using the ColorThief library.

Interactive Palette Viewer:
View colors in HEX, RGB, or HSL formats.
Copy individual colors or the entire palette to the clipboard.
Adjust brightness using sliders.
Lock/unlock specific colors to preserve them during generation.

Live UI Preview: See how the palette applies to a mock UI in a sidebar, updated in real-time.
Export Options:
Download the palette as a PNG image.
Export the palette as a JSON file for development use.

Responsive Design: Built with Tailwind CSS for a mobile-friendly experience.
Glassmorphism Aesthetic: Modern UI with glass-like effects, animations, and a dark gradient background.
Local Storage: Saves your palette and locked colors for persistence across sessions.

How to Use

Access the Tool:
Open index.html in a modern web browser.

Choose a Mode:
Generate Mode: Click "Generate Palette" to create a new harmonized palette.
Image Mode: Click "From Image," upload a JPEG or PNG, and click "Generate from Image" to extract colors.

Interact with the Palette:
Adjust brightness with sliders.
Lock colors to keep them unchanged during regeneration.
Switch between HEX, RGB, and HSL formats using the dropdown.
Copy colors individually or all at once.

Preview and Export:
Click "Preview" to see the palette applied to a mock UI.
Export as PNG or JSON using the respective buttons.

Technical Details

Tech Stack:
HTML, CSS (Tailwind CSS), JavaScript.
ColorThief: For image color extraction.
LocalStorage: For saving palettes.

Libraries:
Tailwind CSS (via CDN) for styling.
ColorThief (via CDN) for image processing.
Google Fonts (Poppins) for typography.

Color Logic:
Random palettes are generated in HSL space with harmonized hues (analogous, complementary).
Image mode extracts 5 dominant colors and converts them to HSL for consistency.

Animations:
Scroll-triggered animations for a smooth user experience.
Sidebar transitions for the live preview.

Installation
No installation is required! Simply:

Clone or download the repository.
Open index.html in a browser.
Ensure an internet connection for CDN-loaded dependencies (Tailwind CSS, ColorThief).

Future Improvements

Add more color harmony options (e.g., triadic, split-complementary).
Implement a color picker for manual color adjustments.
Support for additional export formats (e.g., CSS, SCSS).
Offline support by bundling dependencies.

Credits

Created by Syed Rayan.
Built during a hackathon on May 19, 2025.

License
© 2025 HueForge. All rights reserved.
