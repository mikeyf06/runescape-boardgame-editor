import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Line, Circle, Image as KonvaImage } from 'react-konva';
import { Brush, Clear, Save, FileCopy, Image as ImageIcon, RadioButtonUnchecked } from '@mui/icons-material';
import './App.css';

const App = () => {
  const [tool, setTool] = useState('line');
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [image, setImage] = useState(null);
  const [color] = useState('#000000');
  
  const stageRef = useRef(null); // Create ref for the Stage component

  useEffect(() => {
    const handleResize = () => {
      // You can remove the state updates for stageWidth and stageHeight
      // and let the Stage component automatically resize on window resize
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleToolChange = (newTool) => {
    setTool(newTool);
  };

  const handleMouseDown = (e) => {
    if (!image) return; // Disable drawing if no image is loaded
  
    const pos = e.target.getStage().getPointerPosition();
    if (tool === 'line') {
      setLines([...lines, { points: [pos.x, pos.y], color }]);
    } else if (tool === 'x') {
      const size = 30;
      setLines([
        ...lines,
        {
          points: [
            pos.x - size, pos.y - size,
            pos.x + size, pos.y + size,
            pos.x - size, pos.y + size,
            pos.x + size, pos.y - size
          ],
          color,
        },
      ]);
    } else if (tool === 'circle') {
      setLines([
        ...lines,
        {
          type: 'circle',
          x: pos.x,
          y: pos.y,
          radius: 37,
          fill: 'rgba(255, 0, 0, 0.7)', // Red with 90% opacity
        },
      ]);
    }
    setIsDrawing(tool === 'line');
  };
  

  const handleMouseMove = (e) => {
    if (!isDrawing || lines.length === 0 || !image) return; // Disable drawing if no image is loaded

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);

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
  };

  const saveCanvasAsImage = () => {
    if (!image || !stageRef.current) return;
  
    const stage = stageRef.current;
    
    // Get the stage dimensions
    const width = stage.width();
    const height = stage.height();
  
    // Create a new canvas with the correct dimensions
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const dataUrl = stage.toDataURL({
      pixelRatio: 1,  // Do not adjust pixel ratio here
      x: 0,           // Optional, offset if you have specific areas to crop
      y: 0,
      width: width,
      height: height,
    });
  
    const link = document.createElement('a');
    link.href = dataUrl;
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

  return (
    <div className="container-fluid">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand px-5" href="/">Runescape Board <br /> Updater</a>
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
          <ul className="navbar-nav ms-auto px-5">
          <li className="nav-item">
            <button
              className={`nav-link btn btn-link ${tool === 'line' ? 'selected' : ''}`}
              onClick={() => handleToolChange('line')}
            >
              <Brush /> Line
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link btn btn-link ${tool === 'circle' ? 'selected' : ''}`}
              onClick={() => handleToolChange('circle')}
            >
              <RadioButtonUnchecked /> Circle
            </button>
          </li>
          </ul>        
        </div>
      </nav>
      <div className="drawing-container">
        <Stage
          width={image ? image.width : window.innerWidth}
          height={image ? image.height : window.innerHeight}
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
              return (
                <Line
                  key={index}
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={8}
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
  );
};

export default App;
