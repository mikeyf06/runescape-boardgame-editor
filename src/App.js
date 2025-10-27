import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Line, Circle, Image as KonvaImage } from 'react-konva';
import { Brush, Clear, Save, FileCopy, Image as ImageIcon, RadioButtonUnchecked, Close, Palette, ChevronLeft, ChevronRight, Menu } from '@mui/icons-material';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight - 56 });
  const [scale, setScale] = useState(1);
  
  const stageRef = useRef(null); // Create ref for the Stage component

  // Update mobile state on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate stage size and scale when image or window changes
  useEffect(() => {
    const calculateSizeAndScale = () => {
      const navbarHeight = 56;
      // On mobile, sidebar is full overlay, on desktop it takes space
      const sidebarWidth = sidebarOpen && !isMobile ? 280 : 0;
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
  }, [image, sidebarOpen, isMobile]);

  const handleToolChange = (newTool) => {
    setTool(newTool);
  };

  const handleMouseDown = (e) => {
    if (!image) return; // Disable drawing if no image is loaded
  
    // Prevent default to avoid scrolling on touch devices
    if (e.evt && e.evt.cancelable) {
      e.evt.preventDefault();
    }
  
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

    // Prevent default to avoid scrolling on touch devices
    if (e.evt && e.evt.cancelable) {
      e.evt.preventDefault();
    }

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
        <div className="d-flex align-items-center">
          <label htmlFor="icon-button-file" className="btn btn-outline-light me-2" style={{ minWidth: 'auto' }}>
            <ImageIcon /> <span className="d-none d-md-inline">Upload</span>
            </label> 
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="icon-button-file"
              type="file"
              onChange={handleImageUpload}
            />
        </div>
      </nav>
      
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', position: 'relative', overflow: 'visible' }}>
        {/* Sidebar with Toggle Button */}
        {isMobile ? (
          /* Mobile Sidebar - Full Overlay */
          <>
            {sidebarOpen && (
              <div 
                className="mobile-sidebar-overlay"
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: 'fixed',
                  top: '56px',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  zIndex: 999,
                  animation: 'fadeIn 0.3s ease',
                }}
              />
            )}
            <div 
              className="sidebar mobile-sidebar"
              style={{
                position: 'fixed',
                top: '56px',
                left: sidebarOpen ? '0' : '-100%',
                height: 'calc(100vh - 56px)',
                width: '280px',
                transition: 'left 0.3s ease',
                overflow: 'visible',
                backgroundColor: 'transparent',
                zIndex: 1000,
                boxShadow: sidebarOpen ? '2px 0 20px rgba(0,0,0,0.5)' : 'none',
              }}
            >
                {/* Close button for mobile */}
              {sidebarOpen && (
                <button
                  className="sidebar-toggle"
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    position: 'absolute',
                    right: '-50px',
                    top: '10px',
                    zIndex: 1001,
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: '#3a3a3a',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <Close style={{ fontSize: '20px' }} />
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
              {/* Main Actions */}
              <div className="mb-3">
                <h6 className="mb-2" style={{ color: '#dc2626' }}>Actions</h6>
                <div className="d-grid gap-2">
                  <label htmlFor="sidebar-upload-file" className="btn btn-sm btn-outline-light">
                    <ImageIcon /> Upload Image
                  </label>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="sidebar-upload-file"
                    type="file"
                    onChange={handleImageUpload}
                  />
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
              
              <hr />
              
              {/* Tool Tabs */}
              <div className="tool-tabs mb-3">
                <h6 className="mb-2" style={{ color: '#dc2626' }}>Drawing Tools</h6>
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
            </div>
          )}
            </div>
          </>
        ) : (
          /* Desktop Sidebar */
          <div 
            className="sidebar"
            style={{
              width: sidebarOpen ? '280px' : '0',
              maxWidth: sidebarOpen ? '280px' : '0',
              minWidth: sidebarOpen ? '280px' : '0',
              transition: 'width 0.3s ease',
              overflow: 'visible',
              backgroundColor: 'transparent',
              borderRight: 'none',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {sidebarOpen && (
              <div className="sidebar-content" style={{ 
                padding: '20px', 
                overflowY: 'auto', 
                maxHeight: 'calc(100vh - 56px)',
                backgroundColor: '#3a3a3a',
                borderRadius: '0 12px 12px 0',
                boxShadow: '2px 0 16px rgba(0,0,0,0.3)',
                width: '280px',
                maxWidth: '280px',
                minWidth: '280px',
              }}>
                {/* Main Actions */}
                <div className="mb-3">
                  <h6 className="mb-2" style={{ color: '#dc2626' }}>Actions</h6>
                  <div className="d-grid gap-2">
                    <label htmlFor="desktop-upload-file" className="btn btn-sm btn-outline-light">
                      <ImageIcon /> Upload Image
                    </label>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="desktop-upload-file"
                      type="file"
                      onChange={handleImageUpload}
                    />
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
                
                <hr />
                
                {/* Tool Tabs */}
                <div className="tool-tabs mb-3">
                  <h6 className="mb-2" style={{ color: '#dc2626' }}>Drawing Tools</h6>
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
              </div>
            )}
          </div>
        )}
        
        {/* Desktop Toggle Button - Always visible */}
        {!isMobile && (
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: 'fixed',
              left: sidebarOpen ? 'calc(280px - 1px)' : '0',
              top: '90px',
              zIndex: 10000,
              border: sidebarOpen ? 'none' : '1px solid rgba(0,0,0,0.1)',
              borderLeft: sidebarOpen ? '2px solid #3a3a3a' : '1px solid rgba(0,0,0,0.1)',
              backgroundColor: '#3a3a3a',
              borderRadius: sidebarOpen ? '0 8px 8px 0' : '0 8px 8px 0',
              padding: '8px 6px',
              cursor: 'pointer',
              height: '40px',
              minWidth: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: sidebarOpen ? 'none' : '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'left 0.3s ease',
            }}
          >
            {sidebarOpen ? <ChevronLeft style={{ color: '#dc2626' }} /> : <ChevronRight style={{ color: '#dc2626' }} />}
          </button>
        )}
        
        {/* Mobile Floating Action Button */}
        {isMobile && !sidebarOpen && (
          <button
            className="mobile-fab"
            onClick={() => setSidebarOpen(true)}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 9999,
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 16px rgba(220, 38, 38, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'fadeIn 0.3s ease',
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Menu style={{ fontSize: '32px' }} />
            </button>
        )}
        
        {/* Main Content */}
        <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div className="drawing-container" style={{ height: '100%', width: '100%' }}>
        <div style={{ maxWidth: '100%', maxHeight: '100%', overflow: 'hidden', position: 'relative' }}>
        {!image && (
          <div className="placeholder-instructions">
            <div className="instruction-emoji">📷</div>
            <h2 className="instruction-title">Runescape Board Updater</h2>
            <p className="instruction-subtitle">Upload an image to start annotating</p>
            
            <div className="instruction-box">
              <div className="instruction-card">
                <div className="step-number">1</div>
                <div className="step-text">Tap <strong>Upload Image</strong> in the sidebar</div>
              </div>
              
              <div className="instruction-card">
                <div className="step-number">2</div>
                <div className="step-text">Choose your drawing tool</div>
              </div>
              
              <div className="instruction-card">
                <div className="step-number">3</div>
                <div className="step-text">Customize colors and sizes</div>
              </div>
              
              <div className="instruction-card">
                <div className="step-number">4</div>
                <div className="step-text">Draw on your image</div>
              </div>
              
              <div className="instruction-card">
                <div className="step-number">5</div>
                <div className="step-text">Save or copy your work</div>
              </div>
            </div>
        </div>
        )}
        <Stage
            width={stageSize.width}
            height={stageSize.height}
            scaleX={scale}
            scaleY={scale}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
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
