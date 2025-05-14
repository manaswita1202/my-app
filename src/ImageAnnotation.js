import React, { useState, useRef, useEffect } from "react";
import "./ImageAnnotator.css";

const ImageEditor = () => {
  const [image, setImage] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [comments, setComments] = useState([]); 
  const [currentComment, setCurrentComment] = useState("");
  const [selectedTool, setSelectedTool] = useState("select");
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
    if (file && file.type.match("image.*")) {
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

  const [constructionPages, setConstructionPages] = useState([1]);
  
    const addPage = () => {
      setConstructionPages([...constructionPages, constructionPages.length + 1]);
    };
  
    const deletePage = (index) => {
      if (constructionPages.length > 1) {
        setConstructionPages(constructionPages.filter((_, i) => i !== index));
      }
    };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === "select") {
      // Check if clicking on the image
      if (
        x >= imagePosition.x &&
        x <= imagePosition.x + imageSize.width &&
        y >= imagePosition.y &&
        y <= imagePosition.y + imageSize.height
      ) {
        // Check if near bottom-right corner (for resizing)
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

      // Check if clicking on any shape
      const clickedShapeIndex = shapes.findIndex((shape) => {
        if (shape.type === "rectangle") {
          return (
            x >= shape.x &&
            x <= shape.x + shape.width &&
            y >= shape.y &&
            y <= shape.y + shape.height
          );
        } else if (shape.type === "circle") {
          const dx = x - (shape.x + shape.radius);
          const dy = y - (shape.y + shape.radius);
          return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
        } else if (
          shape.type === "line" ||
          shape.type === "arrow" ||
          shape.type === "curved" ||
          shape.type === "zigzag" ||
          shape.type === "bracket"
        ) {
          // Simple distance to line segment check
          const dx = shape.x2 - shape.x1;
          const dy = shape.y2 - shape.y1;
          const length = Math.sqrt(dx * dx + dy * dy);
          const t = Math.max(
            0,
            Math.min(1, ((x - shape.x1) * dx + (y - shape.y1) * dy) / (length * length)
          ));
          const projX = shape.x1 + t * dx;
          const projY = shape.y1 + t * dy;
          const distSq = (x - projX) * (x - projX) + (y - projY) * (y - projY);
          return distSq < 100; // 10px threshold squared
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
      // Start drawing a new shape
      const newShape = {
        id: Date.now(),
        type: selectedTool,
        x1: x,
        y1: y,
        x2: x,
        y2: y,
      };

      if (selectedTool === "rectangle") {
        newShape.x = x;
        newShape.y = y;
        newShape.width = 0;
        newShape.height = 0;
      } else if (selectedTool === "circle") {
        newShape.x = x;
        newShape.y = y;
        newShape.radius = 0;
      } else if (selectedTool === "triangle") {
        newShape.points = [
          [x, y],
          [x, y],
          [x, y],
        ];
      } else if (selectedTool === "star") {
        newShape.center = { x, y };
        newShape.outerRadius = 0;
        newShape.innerRadius = 0;
        newShape.points = 5;
      } else if (selectedTool === "curved") {
        newShape.controlX = x;
        newShape.controlY = y - 50;
      } else if (selectedTool === "bracket") {
        newShape.direction = "right";
      } else if (selectedTool === "zigzag") {
        newShape.segments = 4;
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
            if (shape.type === "rectangle" || shape.type === "circle") {
              return { ...shape, x: shape.x + dx, y: shape.y + dy };
            } else if (
              shape.type === "line" ||
              shape.type === "arrow" ||
              shape.type === "curved" ||
              shape.type === "zigzag" ||
              shape.type === "bracket"
            ) {
              return {
                ...shape,
                x1: shape.x1 + dx,
                y1: shape.y1 + dy,
                x2: shape.x2 + dx,
                y2: shape.y2 + dy,
                ...(shape.type === "curved"
                  ? {
                      controlX: shape.controlX + dx,
                      controlY: shape.controlY + dy,
                    }
                  : {}),
              };
            } else if (shape.type === "triangle") {
              return {
                ...shape,
                points: shape.points.map((point) => [point[0] + dx, point[1] + dy]),
              };
            } else if (shape.type === "star") {
              return {
                ...shape,
                center: { x: shape.center.x + dx, y: shape.center.y + dy },
              };
            }
          }
          return shape;
        })
      );
      return;
    }

    if (drawingShape) {
      if (drawingShape.type === "rectangle") {
        setDrawingShape({
          ...drawingShape,
          width: x - drawingShape.x,
          height: y - drawingShape.y,
        });
      } else if (drawingShape.type === "circle") {
        const dx = x - drawingShape.x;
        const dy = y - drawingShape.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        setDrawingShape({
          ...drawingShape,
          radius,
        });
      } else if (
        drawingShape.type === "line" ||
        drawingShape.type === "arrow" ||
        drawingShape.type === "bracket" ||
        drawingShape.type === "zigzag"
      ) {
        setDrawingShape({
          ...drawingShape,
          x2: x,
          y2: y,
        });
      } else if (drawingShape.type === "curved") {
        setDrawingShape({
          ...drawingShape,
          x2: x,
          y2: y,
          controlX: (drawingShape.x1 + x) / 2,
          controlY: Math.min(drawingShape.y1, y) - 50,
        });
      } else if (drawingShape.type === "triangle") {
        const dx = x - drawingShape.x1;
        const dy = y - drawingShape.y1;
        setDrawingShape({
          ...drawingShape,
          points: [
            [drawingShape.x1, drawingShape.y1],
            [drawingShape.x1 - dx, y],
            [x, y],
          ],
        });
      } else if (drawingShape.type === "star") {
        const dx = x - drawingShape.center.x;
        const dy = y - drawingShape.center.y;
        const outerRadius = Math.sqrt(dx * dx + dy * dy);
        setDrawingShape({
          ...drawingShape,
          outerRadius: outerRadius,
          innerRadius: outerRadius * 0.4,
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (drawingShape) {
      // Only add if it has some size
      let shouldAdd = false;

      if (drawingShape.type === "rectangle") {
        shouldAdd =
          Math.abs(drawingShape.width) > 5 && Math.abs(drawingShape.height) > 5;
      } else if (drawingShape.type === "circle") {
        shouldAdd = drawingShape.radius > 5;
      } else if (
        drawingShape.type === "line" ||
        drawingShape.type === "arrow" ||
        drawingShape.type === "curved" ||
        drawingShape.type === "bracket" ||
        drawingShape.type === "zigzag"
      ) {
        const dx = drawingShape.x2 - drawingShape.x1;
        const dy = drawingShape.y2 - drawingShape.y1;
        shouldAdd = Math.sqrt(dx * dx + dy * dy) > 5;
      } else if (drawingShape.type === "triangle" || drawingShape.type === "star") {
        shouldAdd = true;
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
      setCurrentComment("");
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image if available
    if (image) {
      ctx.drawImage(
        image,
        imagePosition.x,
        imagePosition.y,
        imageSize.width,
        imageSize.height
      );

      // Draw resize handle
      if (selectedTool === "select") {
        ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
        ctx.fillRect(
          imagePosition.x + imageSize.width - 10,
          imagePosition.y + imageSize.height - 10,
          10,
          10
        );
      }
    }

    // Draw all shapes
    drawShapes(ctx, shapes, selectedShape);

    // Draw the shape being currently drawn
    if (drawingShape) {
      drawShapes(ctx, [drawingShape], null);
    }
  };

  const drawShapes = (ctx, shapesToDraw, selectedIdx) => {
    shapesToDraw.forEach((shape, index) => {
      ctx.strokeStyle = selectedIdx === index ? "red" : "blue";
      ctx.fillStyle =
        selectedIdx === index ? "rgba(255, 0, 0, 0.1)" : "rgba(0, 0, 255, 0.1)";
      ctx.lineWidth = 2;

      if (shape.type === "rectangle") {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        ctx.beginPath();
        ctx.arc(
          shape.x + shape.radius,
          shape.y + shape.radius,
          shape.radius,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      } else if (shape.type === "line") {
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
      } else if (shape.type === "arrow") {
        // Draw the line
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();

        // Draw the arrow head
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
      } else if (shape.type === "curved") {
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.quadraticCurveTo(
          shape.controlX,
          shape.controlY,
          shape.x2,
          shape.y2
        );
        ctx.stroke();
      } else if (shape.type === "zigzag") {
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);

        const dx = shape.x2 - shape.x1;
        const dy = shape.y2 - shape.y1;
        const segments = shape.segments || 4;

        for (let i = 1; i <= segments; i++) {
          const x = shape.x1 + (dx * i) / segments;
          const y = shape.y1 + (dy * i) / segments;

          if (i % 2 === 1) {
            // Zigzag offset
            const perpX = -dy / segments;
            const perpY = dx / segments;
            ctx.lineTo(x - perpX * 0.5, y - perpY * 0.5);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      } else if (shape.type === "bracket") {
        const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
        const length = Math.sqrt(
          (shape.x2 - shape.x1) * (shape.x2 - shape.x1) +
          (shape.y2 - shape.y1) * (shape.y2 - shape.y1)
        );
        const bracketWidth = length * 0.3;

        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(
          shape.x1 - bracketWidth * Math.cos(angle - Math.PI / 2),
          shape.y1 - bracketWidth * Math.sin(angle - Math.PI / 2)
        );

        ctx.moveTo(shape.x2, shape.y2);
        ctx.lineTo(
          shape.x2 - bracketWidth * Math.cos(angle + Math.PI / 2),
          shape.y2 - bracketWidth * Math.sin(angle + Math.PI / 2)
        );

        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
      } else if (shape.type === "triangle" && shape.points) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0][0], shape.points[0][1]);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i][0], shape.points[i][1]);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
      } else if (shape.type === "star" && shape.outerRadius) {
        ctx.beginPath();
        const cx = shape.center.x;
        const cy = shape.center.y;
        const spikes = shape.points || 5;
        const outerRadius = shape.outerRadius;
        const innerRadius = shape.innerRadius;

        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * outerRadius;
          y = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;

          x = cx + Math.cos(rot) * innerRadius;
          y = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
      }
    });
  };

  // Call draw function
  useEffect(() => {
    draw();
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
        {/* {constructionPages.map((page,index) => (
            <div key={index} className="construction-page techpack1-page">
            <div className="page-header">
              <h2>Construction Details - Page {index + 1}</h2>
              <div className="page-actions">
                <button className="add-page-btn" onClick={addPage}>+ Add Page</button>
                {constructionPages.length > 1 && (
                  <button className="delete-page-btn" onClick={() => deletePage(index)}>🗑 Delete Page</button>
                )}
              </div>
            </div>
          </div>
        ))} */}
      <div className="editor-toolbar mb-4">
        <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-gray-100">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            className="p-2 border-r border-gray-300 hover:bg-gray-200"
            onClick={() => fileInputRef.current.click()}
            title="Upload Image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </button>

          <button
            className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${
              selectedTool === "select" ? "bg-blue-100" : ""
            }`}
            onClick={() => handleToolSelect("select")}
            title="Select Tool"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3l7 7 3-3 7 7V8h-4l-3 3-7-7z"></path>
            </svg>
          </button>

          <span className="px-2 border-r border-gray-300 bg-gray-200 text-gray-600 text-sm">
            Lines
          </span>

          <button
            className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${
              selectedTool === "line" ? "bg-blue-100" : ""
            }`}
            onClick={() => handleToolSelect("line")}
            title="Line"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="19" x2="19" y2="5"></line>
            </svg>
          </button>

          <button
            className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${
              selectedTool === "arrow" ? "bg-blue-100" : ""
            }`}
            onClick={() => handleToolSelect("arrow")}
            title="Arrow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>

          <button
            className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${
              selectedTool === "curved" ? "bg-blue-100" : ""
            }`}
            onClick={() => handleToolSelect("curved")}
            title="Curved Line"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6c0 0 6 0 9 6s9 6 9 6"></path>
            </svg>
          </button>

          <button
            className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${
              selectedTool === "zigzag" ? "bg-blue-100" : ""
            }`}
            onClick={() => handleToolSelect("zigzag")}
            title="Zigzag Line"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 6 8 12 4 18 8 24"></polyline>
              <polyline points="16 6 12 12 16 18 12 24"></polyline>
            </svg>
          </button>

          <button
            className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${
              selectedTool === "bracket" ? "bg-blue-100" : ""
            }`}
            onClick={() => handleToolSelect("bracket")}
            title="Bracket"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h1"></path>
              <path d="M16 3h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-1"></path>
            </svg>
          </button>

          <span className="px-2 border-r border-gray-300 bg-gray-200 text-gray-600 text-sm">
            Shapes
          </span>

          <button
            className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${
              selectedTool === "rectangle" ? "bg-blue-100" : ""
            }`}
            onClick={() => handleToolSelect("rectangle")}
            title="Rectangle"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            </svg>
          </button>

          <button
            className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${
              selectedTool === "circle" ? "bg-blue-100" : ""
            }`}
            onClick={() => handleToolSelect("circle")}
            title="Circle"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </button>

          <button
            className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${
              selectedTool === "triangle" ? "bg-blue-100" : ""
            }`}
            onClick={() => handleToolSelect("triangle")}
            title="Triangle"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 19h20L12 2z"></path>
            </svg>
          </button>

          <button
            className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${
              selectedTool === "star" ? "bg-blue-100" : ""
            }`}
            onClick={() => handleToolSelect("star")}
            title="Star"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>

          {selectedShape !== null && (
            <button
              className="ml-auto p-2 bg-red-100 hover:bg-red-200 text-red-700"
              onClick={handleDeleteSelected}
              title="Delete Selected"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          )}
        </div>
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
          className="w-full h-full border-b border-gray-300"
        />
      </div>

      <div className="mt-4">
        <div className="flex mb-2">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-l"
            placeholder="Add a comment..."
            value={currentComment}
            onChange={(e) => setCurrentComment(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
            onClick={handleAddComment}
          >
            Add Comment
          </button>
        </div>

        <div className="comments-list mt-2">
          <h3 className="text-lg font-semibold mb-2">Comments</h3>
          {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet.</p>
          ) : (
            <ul className="list-disc pl-5">
              {comments.map((comment) => (
                <li key={comment.id} className="mb-1">
                  {comment.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
