import React, { useState, useRef } from 'react';
import { HandRaisedIcon } from '@heroicons/react/24/outline';
import './ImageAnnotator.css';

// Import Heroicons (you can install it via npm or use a CDN)
import {
  RectangleGroupIcon, // For Rectangle
  CircleStackIcon, // For Circle
  ArrowRightIcon, // For Line
  ArrowLongRightIcon, // For Arrow
  TrashIcon, // For Delete
} from '@heroicons/react/24/outline';

const ImageEditor = () => {
  const [image, setImage] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [comments, setComments] = useState([]);
  const [currentComment, setCurrentComment] = useState('');
  const [selectedTool, setSelectedTool] = useState('select');
  const [drawingShape, setDrawingShape] = useState(null);
  const [selectedShape, setSelectedShape] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 400, height: 300 });
  const [resizing, setResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [imageStartPos, setImageStartPos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImagePosition({ x: 50, y: 50 });
          const canvas = canvasRef.current;
          const maxWidth = canvas.width - 100;
          const maxHeight = canvas.height - 100;
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
          setImageSize({
            width: img.width * scale,
            height: img.height * scale,
          });
          setImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    setSelectedShape(null);
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'select') {
      if (
        x >= imagePosition.x &&
        x <= imagePosition.x + imageSize.width &&
        y >= imagePosition.y &&
        y <= imagePosition.y + imageSize.height
      ) {
        const cornerSize = 20;
        if (
          x >= imagePosition.x + imageSize.width - cornerSize &&
          y >= imagePosition.y + imageSize.height - cornerSize
        ) {
          setResizing(true);
          setResizeStart({ x, y });
        } else {
          setIsImageDragging(true);
          setImageStartPos({ x, y });
        }
        return;
      }

      const clickedShapeIndex = shapes.findIndex((shape) => {
        if (shape.type === 'rectangle') {
          return (
            x >= shape.x &&
            x <= shape.x + shape.width &&
            y >= shape.y &&
            y <= shape.y + shape.height
          );
        } else if (shape.type === 'circle') {
          const dx = x - (shape.x + shape.radius);
          const dy = y - (shape.y + shape.radius);
          return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
        } else if (shape.type === 'line' || shape.type === 'arrow') {
          const dx = shape.x2 - shape.x1;
          const dy = shape.y2 - shape.y1;
          const length = Math.sqrt(dx * dx + dy * dy);
          const t = Math.max(0, Math.min(1, ((x - shape.x1) * dx + (y - shape.y1) * dy) / (length * length)));
          const projX = shape.x1 + t * dx;
          const projY = shape.y1 + t * dy;
          const distSq = (x - projX) * (x - projX) + (y - projY) * (y - projY);
          return distSq < 100;
        }
        return false;
      });

      if (clickedShapeIndex !== -1) {
        setSelectedShape(clickedShapeIndex);
        setIsDragging(true);
        setStartPos({ x, y });
        return;
      }

      setSelectedShape(null);
    } else {
      const newShape = {
        id: Date.now(),
        type: selectedTool,
        x1: x,
        y1: y,
        x2: x,
        y2: y,
      };

      if (selectedTool === 'rectangle') {
        newShape.x = x;
        newShape.y = y;
        newShape.width = 0;
        newShape.height = 0;
      } else if (selectedTool === 'circle') {
        newShape.x = x;
        newShape.y = y;
        newShape.radius = 0;
      }

      setDrawingShape(newShape);
    }
  };

  const handleMouseMove = (e) => {
    if (!drawingShape && !isDragging && !resizing && !isImageDragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isImageDragging) {
      setImagePosition({
        x: imagePosition.x + (x - imageStartPos.x),
        y: imagePosition.y + (y - imageStartPos.y),
      });
      setImageStartPos({ x, y });
      return;
    }

    if (resizing) {
      const newWidth = Math.max(50, imageSize.width + (x - resizeStart.x));
      const newHeight = Math.max(50, imageSize.height + (y - resizeStart.y));
      setImageSize({ width: newWidth, height: newHeight });
      setResizeStart({ x, y });
      return;
    }

    if (isDragging && selectedShape !== null) {
      const dx = x - startPos.x;
      const dy = y - startPos.y;
      setStartPos({ x, y });

      setShapes(
        shapes.map((shape, index) => {
          if (index === selectedShape) {
            if (shape.type === 'rectangle' || shape.type === 'circle') {
              return { ...shape, x: shape.x + dx, y: shape.y + dy };
            } else if (shape.type === 'line' || shape.type === 'arrow') {
              return {
                ...shape,
                x1: shape.x1 + dx,
                y1: shape.y1 + dy,
                x2: shape.x2 + dx,
                y2: shape.y2 + dy,
              };
            }
          }
          return shape;
        })
      );
      return;
    }

    if (drawingShape) {
      if (drawingShape.type === 'rectangle') {
        setDrawingShape({
          ...drawingShape,
          width: x - drawingShape.x,
          height: y - drawingShape.y,
        });
      } else if (drawingShape.type === 'circle') {
        const dx = x - drawingShape.x;
        const dy = y - drawingShape.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        setDrawingShape({
          ...drawingShape,
          radius,
        });
      } else if (drawingShape.type === 'line' || drawingShape.type === 'arrow') {
        setDrawingShape({
          ...drawingShape,
          x2: x,
          y2: y,
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (drawingShape) {
      let shouldAdd = false;

      if (drawingShape.type === 'rectangle') {
        shouldAdd = drawingShape.width !== 0 && drawingShape.height !== 0;
      } else if (drawingShape.type === 'circle') {
        shouldAdd = drawingShape.radius > 5;
      } else if (drawingShape.type === 'line' || drawingShape.type === 'arrow') {
        const dx = drawingShape.x2 - drawingShape.x1;
        const dy = drawingShape.y2 - drawingShape.y1;
        shouldAdd = Math.sqrt(dx * dx + dy * dy) > 5;
      }

      if (shouldAdd) {
        setShapes([...shapes, drawingShape]);
      }
      setDrawingShape(null);
    }

    setIsDragging(false);
    setResizing(false);
    setIsImageDragging(false);
  };

  const handleDeleteSelected = () => {
    if (selectedShape !== null) {
      setShapes(shapes.filter((_, index) => index !== selectedShape));
      setSelectedShape(null);
    }
  };

  const handleAddComment = () => {
    if (currentComment.trim()) {
      setComments([...comments, { id: Date.now(), text: currentComment }]);
      setCurrentComment('');
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image) {
      ctx.drawImage(
        image,
        imagePosition.x,
        imagePosition.y,
        imageSize.width,
        imageSize.height
      );

      if (selectedTool === 'select') {
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.fillRect(
          imagePosition.x + imageSize.width - 10,
          imagePosition.y + imageSize.height - 10,
          10,
          10
        );
      }
    }

    shapes.forEach((shape, index) => {
      ctx.strokeStyle = selectedShape === index ? 'red' : 'blue';
      ctx.lineWidth = 2;

      if (shape.type === 'rectangle') {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(shape.x + shape.radius, shape.y + shape.radius, shape.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (shape.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
      } else if (shape.type === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();

        const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
        const headLength = 15;
        ctx.beginPath();
        ctx.moveTo(shape.x2, shape.y2);
        ctx.lineTo(
          shape.x2 - headLength * Math.cos(angle - Math.PI / 6),
          shape.y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(shape.x2, shape.y2);
        ctx.lineTo(
          shape.x2 - headLength * Math.cos(angle + Math.PI / 6),
          shape.y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });

    if (drawingShape) {
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;

      if (drawingShape.type === 'rectangle') {
        ctx.strokeRect(
          drawingShape.x,
          drawingShape.y,
          drawingShape.width,
          drawingShape.height
        );
      } else if (drawingShape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(
          drawingShape.x + drawingShape.radius,
          drawingShape.y + drawingShape.radius,
          drawingShape.radius,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      } else if (drawingShape.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(drawingShape.x1, drawingShape.y1);
        ctx.lineTo(drawingShape.x2, drawingShape.y2);
        ctx.stroke();
      } else if (drawingShape.type === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(drawingShape.x1, drawingShape.y1);
        ctx.lineTo(drawingShape.x2, drawingShape.y2);
        ctx.stroke();

        const angle = Math.atan2(drawingShape.y2 - drawingShape.y1, drawingShape.x2 - drawingShape.x1);
        const headLength = 15;
        ctx.beginPath();
        ctx.moveTo(drawingShape.x2, drawingShape.y2);
        ctx.lineTo(
          drawingShape.x2 - headLength * Math.cos(angle - Math.PI / 6),
          drawingShape.y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(drawingShape.x2, drawingShape.y2);
        ctx.lineTo(
          drawingShape.x2 - headLength * Math.cos(angle + Math.PI / 6),
          drawingShape.y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    }
  };

  React.useEffect(() => {
    draw();
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => fileInputRef.current.click()}
        >
          Upload Image
        </button>

        <button
  className={`px-4 py-2 rounded ${
    selectedTool === 'select' ? 'bg-blue-800 text-white' : 'bg-gray-200'
  }`}
  onClick={() => handleToolSelect('select')}
>
  <HandRaisedIcon className="w-6 h-6" />
</button>
        <button
          className={`px-4 py-2 rounded ${
            selectedTool === 'rectangle' ? 'bg-blue-800 text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleToolSelect('rectangle')}
        >
          <RectangleGroupIcon className="w-6 h-6" />
        </button>

        <button
          className={`px-4 py-2 rounded ${
            selectedTool === 'circle' ? 'bg-blue-800 text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleToolSelect('circle')}
        >
          <CircleStackIcon className="w-6 h-6" />
        </button>

        <button
          className={`px-4 py-2 rounded ${
            selectedTool === 'line' ? 'bg-blue-800 text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleToolSelect('line')}
        >
          <ArrowRightIcon className="w-6 h-6" />
        </button>

        <button
          className={`px-4 py-2 rounded ${
            selectedTool === 'arrow' ? 'bg-blue-800 text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleToolSelect('arrow')}
        >
          <ArrowLongRightIcon className="w-6 h-6" />
        </button>

        {selectedShape !== null && (
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            onClick={handleDeleteSelected}
          >
            <TrashIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="border border-gray-300 rounded">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="bg-white w-full h-auto cursor-crosshair"
        />
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Comments</h3>
        <div className="border border-gray-300 rounded p-4 mb-4 max-h-40 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet.</p>
          ) : (
            <ul className="space-y-2">
              {comments.map((comment) => (
                <li key={comment.id} className="p-2 bg-gray-100 rounded">
                  {comment.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex">
          <textarea
            value={currentComment}
            onChange={(e) => setCurrentComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-grow p-2 border border-gray-300 rounded-l"
            rows={2}
          />
          <button
            onClick={handleAddComment}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r"
          >
            Add
          </button>
        </div>
      </div>
    </div>
    );
};
    
export default ImageEditor; 