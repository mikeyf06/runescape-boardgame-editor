import React, { useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Image as KonvaImage } from 'react-konva';
import { Brush, Clear, Save, FileCopy, Image as ImageIcon, RadioButtonUnchecked } from '@mui/icons-material';
import './App.css';

const App = () => {
  const [tool, setTool] = useState('line');
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [image, setImage] = useState(null);
  const [color] = useState('#000000');
  const [stageWidth, setStageWidth] = useState(window.innerWidth);
  const [stageHeight, setStageHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setStageWidth(window.innerWidth);
      setStageHeight(window.innerHeight);
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
        setStageWidth(img.width);
        setStageHeight(img.height);
      };
    }
  };

  const saveCanvasAsImage = () => {
    const stage = document.querySelector('canvas');
    const dataUrl = stage.toDataURL();
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
        <a className="navbar-brand px-5" href="#">Runescape Board <br/> Updater</a>
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
              <a className="nav-link" href="#" onClick={saveCanvasAsImage}>
                <Save /> Save
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={copyToClipboard}>
                <FileCopy /> Copy
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={() => setLines([])}>
                <Clear /> Clear
              </a>
            </li>            
          </ul> 
          <ul className="navbar-nav ms-auto px-5">
            <li className="nav-item">
              <a className={`nav-link ${tool === 'line' ? 'selected' : ''}`} href="#" onClick={() => handleToolChange('line')}>
                <Brush /> Line
              </a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${tool === 'circle' ? 'selected' : ''}`} href="#" onClick={() => handleToolChange('circle')}>
                <RadioButtonUnchecked /> Add Circle
              </a>
            </li>
          </ul>        
        </div>
      </nav>
      <div className="drawing-container">
        <Stage
          width={stageWidth}
          height={stageHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
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
                  strokeWidth={8} // Fixed stroke width for lines
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