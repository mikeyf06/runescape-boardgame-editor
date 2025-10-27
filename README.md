# RuneScape Board Game Editor

A web-based image markup tool designed for RuneScape players to quickly annotate game boards with drawing tools and markers.

## Overview

This React-based web application allows users to upload images and annotate them with various drawing tools. Originally built as a quick tool for marking up RuneScape game boards, it provides a simple and intuitive interface for image editing and annotation.

## Features

### Core Functionality

#### 1. **Image Upload**
   - Upload any image file (`image/*`) to the canvas
   - Images automatically scale to fit within the viewport while maintaining aspect ratio
   - Canvas dimensions adapt to available screen space
   - Large images are automatically scaled down to fit the viewport
   - Drawing is disabled until an image is loaded

#### 2. **Drawing Tools**

   **Line Tool**
   - Freehand drawing with mouse/touch input
   - Draw smooth, continuous lines on the canvas
   - Customizable color picker (default: black #000000)
   - 8px stroke width with tension and rounded line caps

   **Circle Tool**
   - Click to place circular markers on the canvas
   - Customizable color with transparency/opacity slider
   - Adjustable size (10-100px radius, default: 37px)
   - Default: Red with 70% opacity

   **X Mark Tool**
   - Click to place X marks on the canvas
   - Created from two crossing diagonal lines
   - Customizable color picker
   - Adjustable size (10-100px, default: 30px)
   - Useful for marking incorrect or targeted areas

   **Customization Controls (Sidebar)**
   - Collapsible sidebar on the left side of the canvas
   - Toggle button (chevron icon) attached to sidebar edge
   - Tool tabs at the top: Line, Circle, and X Mark icons
   - Tab-based interface - click a tab to select tool and update controls below
   - Color picker for lines and X marks
   - Color and opacity sliders for circles
   - Size sliders for circles and X marks
   - Quick action buttons (Save, Copy, Clear)
   - All settings are live and apply to newly created marks
   - Sidebar automatically adjusts canvas size when toggled

#### 3. **Canvas Operations**

   **Save**
   - Export the entire canvas with annotations as a PNG image
   - Preserves original image dimensions at full resolution
   - Annotations are scaled to match original image size
   - Downloads as `drawing.png`

   **Copy to Clipboard**
   - Copies the canvas to system clipboard
   - Allows instant pasting into other applications
   - Uses modern Clipboard API for compatibility

   **Clear**
   - Removes all annotations from the canvas
   - Preserves the original uploaded image
   - Resets all drawing layers

#### 4. **Interactive Canvas**
   - Full canvas interaction with mouse events
   - Real-time drawing preview
   - Automatically responsive to window size changes
   - Images scale to fit viewport, preventing overflow issues
   - Coordinate system maintains accuracy with scaled images
   - Smooth drawing with optimized performance

## Technical Stack

### Dependencies

- **React** (v19.0.0) - UI framework
- **React-DOM** (v19.0.0) - DOM rendering
- **Konva** (v9.3.18) - 2D canvas library
- **react-konva** (v19.0.1) - React bindings for Konva
- **Material-UI** (@mui/icons-material v6.3.0) - Icon components
- **Bootstrap** (v5.3.3) - UI styling framework
- **react-bootstrap** (v2.10.7) - React Bootstrap components
- **html2canvas** (v1.4.1) - Canvas rendering utilities

### Development Tools

- **React Scripts** (v5.0.1) - Build and development server
- **Testing Library** - Unit testing utilities
- **web-vitals** - Performance monitoring

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd runescape-boardgame-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The application will automatically reload on file changes

5. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## Usage

### Getting Started

1. **Upload an Image**
   - Click the "Upload" button in the navbar
   - Select an image file from your device
   - The image will load onto the canvas

2. **Select a Tool**
   - **Line**: Click and drag to draw freehand lines
   - **Circle**: Click anywhere to place a circle marker
   - **X Mark**: Click anywhere to place an X marker

3. **Select Tool and Customize**
   - Use the tool tabs at the top of the sidebar (Line, Circle, X Mark icons)
   - Click a tab to select a tool - controls below update automatically
   - Toggle the sidebar using the chevron button attached to the sidebar edge
   - Adjust colors using the color picker
   - Change sizes using the size sliders (circles and X marks)
   - Adjust opacity using the opacity slider (circles)
   - Use quick action buttons in the sidebar for Save, Copy, and Clear
   - Settings apply to all newly created marks

4. **Annotate the Image**
   - Use the selected tool to mark up the image
   - Switch between tools as needed during drawing

5. **Save Your Work**
   - **Save**: Download the annotated image as PNG
   - **Copy**: Copy the image to clipboard for quick sharing
   - **Clear**: Remove all annotations (keeps original image)

### Drawing Workflow

1. Upload your game board image
2. Select a drawing tool (Line, Circle, or X Mark)
3. Customize color and size settings in the controls panel
4. Use your mouse to draw or click on the canvas
5. Switch between tools and adjust settings as needed
6. Save or copy your final annotated image

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile browsers**: Limited support (known issues exist)

## Current Limitations

1. **Mobile Support**
   - Not optimized for mobile devices
   - Touch interactions may be limited
   - Layout may need adjustments on very small screens

2. **Drawing Features**
   - No undo/redo functionality
   - Existing marks cannot be edited after placement (only cleared)

3. **File Support**
   - No drag & drop upload (file picker only)
   - Single image upload at a time
   - No support for multiple layers

4. **Export Options**
   - Only PNG export format available
   - No customizable export settings

5. **Copy to Clipboard**
   - May not work correctly due to scaling differences
   - Recommend using Save instead

## Known Issues

- Drawing is disabled until an image is uploaded
- Clipboard copy may not work properly with scaled images - use Save instead
- Performance may degrade with extremely large images (5000px+ dimensions)
- Clipboard API requires secure context (HTTPS or localhost)

## Planned Improvements

### Drawing Tools
- ✅ Circle markers
- ✅ Freehand lines
- ✅ X marks
- ✅ Color customization for all tools
- ✅ Size adjustment for circles and X marks
- ✅ Opacity control for circles
- ⏳ Check marks
- ⏳ Arrow markers
- ⏳ Text annotations

### User Experience
- ✅ Automatic image scaling to fit viewport
- ✅ Responsive canvas that adapts to window size
- ⏳ Undo/Redo buttons
- ⏳ Layer management
- ⏳ Zoom and pan controls
- ⏳ Grid overlay option
- ⏳ Fixed canvas positioning issues

### Upload & Export
- ⏳ Drag & drop image upload
- ⏳ Multiple image support
- ⏳ Export to various formats (JPG, PDF, SVG)
- ⏳ Customizable export settings

### Mobile Support
- ⏳ Touch-optimized interface
- ⏳ Mobile-friendly layout
- ⏳ Gesture support

## Project Structure

```
runescape-boardgame-editor/
├── build/                 # Production build output
├── public/                # Static assets
├── src/
│   ├── components/        # React components (currently empty)
│   ├── App.js             # Main application component
│   ├── App.css            # Application styles
│   ├── App.test.js        # Unit tests
│   ├── index.js           # Application entry point
│   ├── index.css          # Global styles
│   └── setupTests.js      # Test configuration
├── package.json           # Project dependencies
├── yarn.lock              # Dependency lock file
└── README.md              # This file
```

## Contributing

This is an early-stage project open to improvements. Key areas where contributions would be valuable:

- Mobile responsiveness improvements
- Additional drawing tools and markers
- Undo/redo functionality
- Performance optimizations for large images
- Better accessibility features

## License

This project is private and not currently licensed for public use.

## Version History

**v0.1.1** (Current)
- Fixed image overflow issues
- Implemented automatic image scaling to fit viewport
- Added responsive canvas that adapts to window size changes
- Fixed save functionality to export at original image dimensions
- Improved coordinate system for scaled images
- Added proper aspect ratio preservation
- Line annotations reset when uploading new image
- Implemented X Mark tool with UI integration
- Added color picker for lines and X marks
- Added size adjustment controls for circles and X marks
- Added opacity slider for circle markers
- Implemented collapsible sidebar for all controls
- Added quick action buttons (Save, Copy, Clear) in sidebar
- Improved UI layout with organized tool settings
- Sidebar automatically adjusts canvas dimensions when toggled
- Moved tool selection to tab-based interface in sidebar
- Integrated toggle button with sidebar edge
- Removed tools from navbar for cleaner layout

**v0.1.0**
- Initial release
- Basic line and circle drawing tools
- Image upload and save functionality
- Copy to clipboard feature
- Clear canvas functionality

## Recent Updates

### v0.1.1 - Image Scaling & Responsiveness Fix

- **Fixed Canvas Overflow**: Images now automatically scale to fit within the viewport, preventing overflow issues
- **Responsive Design**: Canvas adapts to window size changes in real-time
- **Proper Scaling**: Maintains aspect ratio while fitting images to available space
- **Full Resolution Export**: Save function exports at original image dimensions with properly scaled annotations
- **Coordinate Accuracy**: Mouse coordinates are converted to image space, ensuring annotations align properly
- **X Mark Tool**: Fully implemented X mark drawing tool with UI integration
- **Color Customization**: Added color pickers for all drawing tools
- **Size Controls**: Adjustable size for circles (10-100px) and X marks (10-100px)
- **Opacity Control**: Slider to adjust transparency of circle markers (0-100%)
- **Collapsible Sidebar**: Organized sidebar for all tool settings and quick actions
- **Tab-Based Tool Selection**: Icons for Line, Circle, and X Mark tools in sidebar tabs
- **Attached Toggle Button**: Chevron button integrated with sidebar edge
- **Dynamic Controls**: Settings panel updates based on selected tool tab
- **Improved Layout**: Sidebar automatically adjusts canvas space for optimal viewing
- **Quick Actions**: Save, Copy, and Clear buttons accessible from the sidebar

### Future Development

> "Very early and quick implementation, planning on iterating on this in the future."
> 
> Mobile optimizations coming soon!

---

For questions, issues, or feature requests, please open an issue in the repository or contact the project maintainer.
