import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Line, Circle, Image as KonvaImage } from 'react-konva';
import { Brush, Clear, Save, FileCopy, Image as ImageIcon, RadioButtonUnchecked, Close, Palette, Menu, ChevronLeft, ChevronRight } from '@mui/icons-material';
import './App.css';

const App = () => {
  const [tool, setTool] = useState('line');
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [image, setImage] = useState(null);
  const [color, setColor] = useState('#000000');
  const [circleColor, setCircleColor] = useState('rgba(255, 0, 0, 0.7)');
  const [circleSize, setCircleSize] = useState(37);
  const [xMarkSize, setXMarkSize] = useState(30);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight - 56 });
  const [scale, setScale] = useState(1);
  
  const stageRef = useRef(null); // Create ref for the Stage component

  // Calculate stage size and scale when image or window changes
  useEffect(() => {
    const calculateSizeAndScale = () => {
      const navbarHeight = 56;
      const sidebarWidth = sidebarOpen ? 280 : 0;
      const maxWidth = window.innerWidth - sidebarWidth;
      const maxHeight = window.innerHeight - navbarHeight;

      if (!image) {
        setStageSize({ width: maxWidth, height: maxHeight });
        setScale(1);
        return;
      }

      const imageAspect = image.width / image.height;
      const containerAspect = maxWidth / maxHeight;

      let width, height;
      if (imageAspect > containerAspect) {
        // Image is wider - fit to width
        width = maxWidth;
        height = maxWidth / imageAspect;
      } else {
        // Image is taller - fit to height
        width = maxHeight * imageAspect;
        height = maxHeight;
      }

      setStageSize({ width, height });
      setScale(width / image.width);
    };

    calculateSizeAndScale();
    
    const handleResize = () => {
      calculateSizeAndScale();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [image, sidebarOpen]);

  const handleToolChange = (newTool) => {
    setTool(newTool);
  };

  const handleMouseDown = (e) => {
    if (!image) return; // Disable drawing if no image is loaded
  
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    // Convert coordinates to scaled image space
    const x = pos.x / scale;
    const y = pos.y / scale;
    
    if (tool === 'line') {
      setLines([...lines, { points: [x, y], color, scale }]);
    } else if (tool === 'x') {
      setLines([
        ...lines,
        {
          type: 'x',
          points: [x, y, xMarkSize],
          color,
          scale,
        },
      ]);
    } else if (tool === 'circle') {
      setLines([
        ...lines,
        {
          type: 'circle',
          x: x,
          y: y,
          radius: circleSize,
          fill: circleColor,
          scale,
        },
      ]);
    }
    setIsDrawing(tool === 'line');
  };
  

  const handleMouseMove = (e) => {
    if (!isDrawing || lines.length === 0 || !image) return; // Disable drawing if no image is loaded

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    // Convert coordinates to scaled image space
    const x = point.x / scale;
    const y = point.y / scale;

    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([x, y]);

    setLines([...lines.slice(0, lines.length - 1), lastLine]);
  };

  const handleMouseUp = () => {
    if (!image) return; // Disable drawing if no image is loaded
    setIsDrawing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        setImage(img);
      };
    }
    // Reset lines when uploading new image
    setLines([]);
  };

  const saveCanvasAsImage = () => {
    if (!image || !stageRef.current) return;
  
    // Create a new canvas with the actual image dimensions (not scaled)
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    
    // Draw the image
    ctx.drawImage(image, 0, 0);
    
    // Draw all annotations scaled back to original image size
    ctx.strokeStyle = color;
    ctx.lineWidth = 8 / scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    lines.forEach((line) => {
      if (line.type === 'circle') {
        ctx.fillStyle = line.fill || 'rgba(255, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(line.x, line.y, line.radius, 0, 2 * Math.PI);
        ctx.fill();
      } else if (line.type === 'x') {
        // Render X marks as two crossing diagonal lines
        const [x, y, size] = line.points;
        ctx.strokeStyle = line.color || color;
        ctx.lineWidth = 8;
        
        // First diagonal line (top-left to bottom-right)
        ctx.beginPath();
        ctx.moveTo(x - size, y - size);
        ctx.lineTo(x + size, y + size);
        ctx.stroke();
        
        // Second diagonal line (bottom-left to top-right)
        ctx.beginPath();
        ctx.moveTo(x - size, y + size);
        ctx.lineTo(x + size, y - size);
        ctx.stroke();
      } else {
        ctx.strokeStyle = line.color || color;
        ctx.beginPath();
        ctx.moveTo(line.points[0], line.points[1]);
        for (let i = 2; i < line.points.length; i += 2) {
          ctx.lineTo(line.points[i], line.points[i + 1]);
        }
        ctx.stroke();
      }
    });
  
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'drawing.png';
    link.click();
  };
  
  const copyToClipboard = () => {
    const stage = document.querySelector('canvas');
    const dataUrl = stage.toDataURL('image/png');

    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]);
      });
  };

  // Helper to convert hex to rgba
  const hexToRgba = (hex, alpha = 1) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` 
      : 'rgba(0, 0, 0, 1)';
  };

  // Helper to extract hex from rgba/rgb
  const extractHexFromRgba = (rgba) => {
    const rgbMatch = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    return '#000000';
  };

  // Helper to extract opacity from rgba string
  const extractOpacityFromRgba = (rgba) => {
    const opacityMatch = rgba.match(/rgba?\([^)]*,\s*([\d.]+)\)/);
    if (opacityMatch) {
      return parseFloat(opacityMatch[1]);
    }
    return 0.7; // default
  };

  return (
    <div className="container-fluid">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{ zIndex: 1000 }}>
        <a className="navbar-brand" href="/" style={{ fontSize: '1.25rem', lineHeight: '1.4', padding: '0.5rem 1rem' }}>Runescape Board <br /> Updater</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
          <form className="d-flex">
            <label htmlFor="icon-button-file" className="btn btn-outline-light me-2">
              <ImageIcon /> Upload
            </label> 
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="icon-button-file"
              type="file"
              onChange={handleImageUpload}
            />
          </form>
          <li className="nav-item">
            <button className="nav-link btn btn-link" onClick={saveCanvasAsImage}>
              <Save /> Save
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link btn btn-link" onClick={copyToClipboard}>
              <FileCopy /> Copy
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link btn btn-link" onClick={() => setLines([])}>
              <Clear /> Clear
            </button>
          </li>        
          </ul> 
        </div>
      </nav>
      
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', position: 'relative' }}>
        {/* Sidebar with Toggle Button */}
        <div 
          className="sidebar"
          style={{
            width: sidebarOpen ? '280px' : '0',
            transition: 'width 0.3s ease',
            overflow: 'visible',
            backgroundColor: 'transparent',
            borderRight: 'none',
            position: 'relative',
          }}
        >
          {/* Toggle Button - Only when sidebar is open */}
          {sidebarOpen && (
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                position: 'absolute',
                right: '-37px',
                top: '10px',
                zIndex: 1001,
                border: '1px solid rgba(0,0,0,0.1)',
                borderLeft: 'none',
                backgroundColor: '#3a3a3a',
                borderRadius: '0 8px 8px 0',
                padding: '8px 6px',
                cursor: 'pointer',
                height: '40px',
                minWidth: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft style={{ color: '#dc2626' }} />
            </button>
          )}
          
          {sidebarOpen && (
            <div className="sidebar-content" style={{ 
              padding: '20px', 
              overflowY: 'auto', 
              maxHeight: 'calc(100vh - 56px)',
              backgroundColor: '#3a3a3a',
              borderRadius: '0 12px 12px 0',
              boxShadow: '2px 0 16px rgba(0,0,0,0.3)',
            }}>
              {/* Tool Tabs */}
              <div className="tool-tabs mb-3">
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${tool === 'line' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => handleToolChange('line')}
                    title="Line Tool"
                  >
                    <Brush />
                  </button>
            <button
                    type="button"
                    className={`btn btn-sm ${tool === 'circle' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => handleToolChange('circle')}
                    title="Circle Tool"
                  >
                    <RadioButtonUnchecked />
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${tool === 'x' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => handleToolChange('x')}
                    title="X Mark Tool"
                  >
                    <Close />
                  </button>
                </div>
              </div>
              
              <hr />
              
              {/* Color Picker for Line and X */}
              {(tool === 'line' || tool === 'x') && (
                <div>
                  <label className="form-label mb-2"><Palette /> Line Color</label>
                  <div className="d-flex align-items-center gap-2">
                    <input 
                      type="color" 
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="form-control form-control-color"
                      style={{ width: '60px', height: '40px' }}
                    />
                    <span className="small">{color}</span>
                  </div>
                </div>
              )}
              
              {/* Circle Controls */}
              {tool === 'circle' && (
                <>
                  <div className="mb-3">
                    <label className="form-label mb-2"><Palette /> Circle Color:</label>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <input 
                        type="color" 
                        value={extractHexFromRgba(circleColor)}
                        onChange={(e) => {
                          const hex = e.target.value;
                          const alpha = extractOpacityFromRgba(circleColor);
                          setCircleColor(hexToRgba(hex, alpha));
                        }}
                        className="form-control form-control-color"
                        style={{ width: '60px', height: '40px' }}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label mb-2">Opacity: {Math.round(extractOpacityFromRgba(circleColor) * 100)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={extractOpacityFromRgba(circleColor) * 100}
                      onChange={(e) => {
                        const alpha = parseFloat(e.target.value) / 100;
                        const match = circleColor.match(/rgba?\(([^)]+)\)/);
                        if (match) {
                          const [, values] = match;
                          const parts = values.split(',');
                          const r = parseInt(parts[0].trim());
                          const g = parseInt(parts[1].trim());
                          const b = parseInt(parts[2].trim());
                          setCircleColor(`rgba(${r}, ${g}, ${b}, ${alpha})`);
                        }
                      }}
                      className="form-range"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label mb-2">Size: {circleSize}px</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={circleSize}
                      onChange={(e) => setCircleSize(parseInt(e.target.value))}
                      className="form-range"
                    />
                  </div>
                </>
              )}
              
              {/* X Mark Size */}
              {tool === 'x' && (
                <div className="mb-3">
                  <label className="form-label mb-2">X Mark Size: {xMarkSize}px</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={xMarkSize}
                    onChange={(e) => setXMarkSize(parseInt(e.target.value))}
                    className="form-range"
                  />
                </div>
              )}
              
              <div className="mt-4 pt-3 border-top">
                <h6 className="mb-2">Quick Actions</h6>
                <div className="d-grid gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={saveCanvasAsImage}>
                    <Save /> Save Image
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={copyToClipboard}>
                    <FileCopy /> Copy to Clipboard
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setLines([])}>
                    <Clear /> Clear All
            </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Toggle Button - Only when sidebar is closed */}
        {!sidebarOpen && (
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: 'absolute',
              left: '0',
              top: '10px',
              zIndex: 1001,
              border: '1px solid rgba(0,0,0,0.1)',
              backgroundColor: '#3a3a3a',
              borderRadius: '0 8px 8px 0',
              padding: '8px 6px',
              cursor: 'pointer',
              height: '40px',
              minWidth: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <ChevronRight style={{ color: '#dc2626' }} />
          </button>
        )}
        
        {/* Main Content */}
        <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div className="drawing-container" style={{ height: '100%', width: '100%' }}>
        <div style={{ maxWidth: '100%', maxHeight: '100%', overflow: 'hidden' }}>
        <Stage
            width={stageSize.width}
            height={stageSize.height}
            scaleX={scale}
            scaleY={scale}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={stageRef}  // Attach the ref to the Stage
        >
          <Layer>
            {image && <KonvaImage image={image} />}
            {lines.map((line, index) => {
              if (line.type === 'circle') {
                return (
                  <Circle
                    key={index}
                    x={line.x}
                    y={line.y}
                    radius={line.radius}
                    fill={line.fill}
                  />
                );
              }
              
              if (line.type === 'x') {
                // Render X marks as two crossing diagonal lines
                const [x, y, size] = line.points;
                const scaledStrokeWidth = 8 / scale;
                const scaledSize = size / scale;
                
                return (
                  <React.Fragment key={index}>
                    <Line
                      points={[x - scaledSize, y - scaledSize, x + scaledSize, y + scaledSize]}
                      stroke={line.color}
                      strokeWidth={scaledStrokeWidth}
                      lineCap="round"
                      lineJoin="round"
                    />
                    <Line
                      points={[x - scaledSize, y + scaledSize, x + scaledSize, y - scaledSize]}
                      stroke={line.color}
                      strokeWidth={scaledStrokeWidth}
                      lineCap="round"
                      lineJoin="round"
                    />
                  </React.Fragment>
                );
              }
              
              // Scale stroke width with the stage scale
              const scaledStrokeWidth = 8 / scale;
              return (
                <Line
                  key={index}
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={scaledStrokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              );
            })}
          </Layer>
        </Stage>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default App;
