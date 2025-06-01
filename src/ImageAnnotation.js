import React, { useState, useRef, useEffect } from "react";
// Assuming "./ImageAnnotator.css" exists and is set up, or Tailwind is primarily used.
// If ImageAnnotator.css is crucial for base styles, ensure it's correctly linked.
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
  // startPos, imageStartPos, resizeStart will store internal canvas coordinates
  const [startPos, setStartPos] = useState({ x: 0, y: 0 }); 
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 }); // Internal canvas coords
  const [imageSize, setImageSize] = useState({ width: 400, height: 300 }); // Internal canvas dimensions
  const [resizing, setResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [imageStartPos, setImageStartPos] = useState({ x: 0, y: 0 });

  const [editingTextShapeIndex, setEditingTextShapeIndex] = useState(null);
  const [editTextValue, setEditTextValue] = useState("");
  const textInputRef = useRef(null);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Helper to get mouse coordinates scaled to internal canvas dimensions
  const getCanvasMouseCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { mx: 0, my: 0, scaleX: 1, scaleY: 1, rect: null, clientX: e.clientX, clientY: e.clientY };
    const rect = canvas.getBoundingClientRect();
    // x, y are coordinates relative to the canvas element's displayed top-left
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // scaleFactor converts display length to internal canvas length
    const scaleFactorX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleFactorY = rect.height > 0 ? canvas.height / rect.height : 1;
    
    return {
        mx: x * scaleFactorX, // Mouse X in internal canvas coordinates
        my: y * scaleFactorY, // Mouse Y in internal canvas coordinates
        scaleX: scaleFactorX,
        scaleY: scaleFactorY,
        rect, // canvas.getBoundingClientRect() for reference
        clientX: e.clientX, // Raw client X for specific cases like textarea out-of-bounds check
        clientY: e.clientY,
    };
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match("image.*")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          // Initial image position (internal canvas coordinates)
          setImagePosition({ x: 50, y: 50 }); 
          
          // Calculate initial image size to fit within canvas (internal dimensions)
          const maxWidth = canvas.width - 100; // Based on internal canvas width
          const maxHeight = canvas.height - 100; // Based on internal canvas height
          let scale = 1;
          if (img.width > 0 && img.height > 0) {
             scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
          } else {
            scale = Math.min(maxWidth / (img.width || maxWidth) , maxHeight / (img.height || maxHeight), 1);
          }
          setImageSize({ // Store internal dimensions
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
    setEditingTextShapeIndex(null);
  };

  const [constructionPages, setConstructionPages] = useState([1]);
  const addPage = () => setConstructionPages([...constructionPages, constructionPages.length + 1]);
  const deletePage = (index) => {
    if (constructionPages.length > 1) {
      setConstructionPages(constructionPages.filter((_, i) => i !== index));
    }
  };

  // px, py are internal canvas coordinates
  const isPointInShape = (px, py, shape) => {
    if (!shape) return false;
    // All shape coordinates (x, y, width, height, radius, points, etc.) are internal canvas coordinates
    if (shape.type === "rectangle" || shape.type === "textbox") {
      const x1 = Math.min(shape.x, shape.x + shape.width);
      const x2 = Math.max(shape.x, shape.x + shape.width);
      const y1 = Math.min(shape.y, shape.y + shape.height);
      const y2 = Math.max(shape.y, shape.y + shape.height);
      return px >= x1 && px <= x2 && py >= y1 && py <= y2;
    } else if (shape.type === "circle") {
      const dx = px - (shape.x + shape.radius);
      const dy = py - (shape.y + shape.radius);
      return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
    } else if (
      shape.type === "line" || shape.type === "arrow" || shape.type === "curved" ||
      shape.type === "zigzag" || shape.type === "bracket"
    ) {
      const { x1, y1, x2, y2 } = shape;
      const dxL = x2 - x1;
      const dyL = y2 - y1;
      if (dxL === 0 && dyL === 0) { // Point
        return Math.abs(px - x1) < 5 && Math.abs(py - y1) < 5; // 5px tolerance
      }
      const lengthSq = dxL * dxL + dyL * dyL;
      const t = Math.max(0, Math.min(1, ((px - x1) * dxL + (py - y1) * dyL) / lengthSq));
      const projX = x1 + t * dxL;
      const projY = y1 + t * dyL;
      const distSq = (px - projX) * (px - projX) + (py - projY) * (py - projY);
      return distSq < 25; // 5px threshold squared for lines
    } else if (shape.type === "triangle" && shape.points?.length === 3) {
        let minX = shape.points[0][0], maxX = shape.points[0][0];
        let minY = shape.points[0][1], maxY = shape.points[0][1];
        for(let i=1; i<3; i++) {
            minX = Math.min(minX, shape.points[i][0]);
            maxX = Math.max(maxX, shape.points[i][0]);
            minY = Math.min(minY, shape.points[i][1]);
            maxY = Math.max(maxY, shape.points[i][1]);
        }
        return px >= minX && px <= maxX && py >= minY && py <= maxY; // BBox check
    } else if (shape.type === "star" && shape.center) {
        const r = shape.outerRadius || 0;
        return px >= shape.center.x - r && px <= shape.center.x + r &&
               py >= shape.center.y - r && py <= shape.center.y + r; // Bbox check
    }
    return false;
  };

  const handleMouseDown = (e) => {
    const { mx, my, scaleX, scaleY, rect, clientX, clientY } = getCanvasMouseCoordinates(e);
    if (!rect) return; // Canvas not ready

    if (editingTextShapeIndex !== null) {
        const textareaRect = textInputRef.current?.getBoundingClientRect();
        if (textareaRect && 
            (clientX < textareaRect.left || clientX > textareaRect.right ||
             clientY < textareaRect.top || clientY > textareaRect.bottom)
        ) {
            handleTextareaBlur(); // Use blur handler to save and close
        }
        // Potentially return early if click was to complete text edit,
        // unless the click is also meant to select/drag something else
    }

    if (selectedTool === "select") {
      // Image interaction (using internal canvas coordinates: mx, my)
      if (image &&
          mx >= imagePosition.x && mx <= imagePosition.x + imageSize.width &&
          my >= imagePosition.y && my <= imagePosition.y + imageSize.height
      ) {
        const cornerSizeInternal = 10 * Math.min(scaleX, scaleY); // 10px handle in display, scaled to internal
        if (
          mx >= imagePosition.x + imageSize.width - cornerSizeInternal &&
          my >= imagePosition.y + imageSize.height - cornerSizeInternal
        ) {
          setResizing(true);
          setResizeStart({ x: mx, y: my }); // Store internal coords
        } else {
          setIsImageDragging(true);
          setImageStartPos({ x: mx, y: my }); // Store internal coords
        }
        return;
      }

      const clickedShapeIndex = shapes.findIndex((shape) => isPointInShape(mx, my, shape));
      if (clickedShapeIndex !== -1) {
        setSelectedShape(clickedShapeIndex);
        setIsDragging(true);
        setStartPos({ x: mx, y: my }); // Store internal coords
        return;
      }
      setSelectedShape(null);
      if (editingTextShapeIndex !== null && !textInputRef.current?.contains(e.target)) {
         setEditingTextShapeIndex(null); // Deselect textbox if clicked elsewhere and not on textarea
      }
    } else { // Drawing a new shape
      const newShapeBase = {
        id: Date.now(), type: selectedTool,
        x: mx, y: my, // For rect-like shapes (internal coords)
        x1: mx, y1: my, x2: mx, y2: my, // For line-like shapes (internal coords)
      };
      if (selectedTool === "rectangle" || selectedTool === "textbox") {
        setDrawingShape({ ...newShapeBase, width: 0, height: 0, 
            ...(selectedTool === "textbox" && { text: "Text" }) });
      } else if (selectedTool === "circle") {
        setDrawingShape({ ...newShapeBase, radius: 0 }); // x,y is center during drawing
      } else if (selectedTool === "triangle") {
        setDrawingShape({ ...newShapeBase, points: [[mx,my], [mx,my], [mx,my]] });
      } else if (selectedTool === "star") {
        setDrawingShape({ ...newShapeBase, center: { x: mx, y: my }, outerRadius: 0, innerRadius: 0, points: 5 });
      } else if (selectedTool === "curved") {
        setDrawingShape({ ...newShapeBase, controlX: mx, controlY: my - (50 * scaleY) }); // 50px display offset
      } else { // line, arrow, bracket, zigzag
         setDrawingShape(newShapeBase);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!drawingShape && !isDragging && !resizing && !isImageDragging) return;
    const { mx, my, scaleX, scaleY, rect } = getCanvasMouseCoordinates(e);
    if (!rect) return;

    if (isImageDragging) {
      const deltaMx = mx - imageStartPos.x;
      const deltaMy = my - imageStartPos.y;
      setImagePosition(prev => ({ x: prev.x + deltaMx, y: prev.y + deltaMy }));
      setImageStartPos({ x: mx, y: my });
      return;
    }

    if (resizing) { // Image resizing
      const deltaMx = mx - resizeStart.x;
      const deltaMy = my - resizeStart.y;
      setImageSize(prev => ({
        width: Math.max(50 * scaleX, prev.width + deltaMx), // Min 50px display width
        height: Math.max(50 * scaleY, prev.height + deltaMy) // Min 50px display height
      }));
      setResizeStart({ x: mx, y: my });
      return;
    }

    if (isDragging && selectedShape !== null) { // Shape dragging
      const deltaMx = mx - startPos.x;
      const deltaMy = my - startPos.y;
      setShapes(prevShapes => prevShapes.map((shape, index) => {
        if (index === selectedShape) {
          let newShape = { ...shape };
          if (newShape.type === "rectangle" || newShape.type === "circle" || newShape.type === "textbox") {
            newShape.x += deltaMx; newShape.y += deltaMy;
          } else if (newShape.type === "line" || newShape.type === "arrow" || newShape.type === "curved" || newShape.type === "zigzag" || newShape.type === "bracket") {
            newShape.x1 += deltaMx; newShape.y1 += deltaMy;
            newShape.x2 += deltaMx; newShape.y2 += deltaMy;
            if (newShape.type === "curved") {
              newShape.controlX += deltaMx; newShape.controlY += deltaMy;
            }
          } else if (newShape.type === "triangle") {
            newShape.points = newShape.points.map(p => [p[0] + deltaMx, p[1] + deltaMy]);
          } else if (newShape.type === "star") {
            newShape.center = { x: newShape.center.x + deltaMx, y: newShape.center.y + deltaMy };
          }
          return newShape;
        }
        return shape;
      }));
      setStartPos({ x: mx, y: my });
      return;
    }

    if (drawingShape) { // Drawing new shape
      let newDrawingShape = { ...drawingShape };
      if (newDrawingShape.type === "rectangle" || newDrawingShape.type === "textbox") {
        newDrawingShape.width = mx - newDrawingShape.x;
        newDrawingShape.height = my - newDrawingShape.y;
      } else if (newDrawingShape.type === "circle") { // x,y is center
        const rdx = mx - newDrawingShape.x;
        const rdy = my - newDrawingShape.y;
        newDrawingShape.radius = Math.sqrt(rdx * rdx + rdy * rdy);
      } else if (newDrawingShape.type === "line" || newDrawingShape.type === "arrow" || newDrawingShape.type === "bracket" || newDrawingShape.type === "zigzag") {
        newDrawingShape.x2 = mx; newDrawingShape.y2 = my;
      } else if (newDrawingShape.type === "curved") {
        newDrawingShape.x2 = mx; newDrawingShape.y2 = my;
        newDrawingShape.controlX = (newDrawingShape.x1 + mx) / 2;
        newDrawingShape.controlY = Math.min(newDrawingShape.y1, my) - (50 * scaleY); // 50px display offset
      } else if (newDrawingShape.type === "triangle") {
        const dx = mx - newDrawingShape.x1;
        newDrawingShape.points = [
          [newDrawingShape.x1, newDrawingShape.y1],
          [newDrawingShape.x1 - dx, my], 
          [mx, my]
        ];
      } else if (newDrawingShape.type === "star") {
        const rdx = mx - newDrawingShape.center.x;
        const rdy = my - newDrawingShape.center.y;
        const outerRadius = Math.sqrt(rdx*rdx + rdy*rdy);
        newDrawingShape.outerRadius = outerRadius;
        newDrawingShape.innerRadius = outerRadius * 0.4;
      }
      setDrawingShape(newDrawingShape);
    }
  };

  const handleMouseUp = (e) => {
     const { scaleX, scaleY } = getCanvasMouseCoordinates(e); // Get scales for min size checks

    if (drawingShape) {
      let finalShape = { ...drawingShape };
      let shouldAdd = false;

      if (finalShape.type === "rectangle" || finalShape.type === "textbox") {
        if (finalShape.width < 0) { finalShape.x += finalShape.width; finalShape.width = Math.abs(finalShape.width); }
        if (finalShape.height < 0) { finalShape.y += finalShape.height; finalShape.height = Math.abs(finalShape.height); }
        // Min size in internal canvas units (e.g., 50px display width)
        const minDisplayWidth = 50, minDisplayHeight = 30;
        if (finalShape.type === "textbox") {
            finalShape.width = Math.max(finalShape.width, minDisplayWidth * scaleX);
            finalShape.height = Math.max(finalShape.height, minDisplayHeight * scaleY);
        }
        shouldAdd = finalShape.width > (5 * scaleX) && finalShape.height > (5 * scaleY);
      } else if (finalShape.type === "circle") {
        // Convert center (x,y) and radius to top-left x,y and radius for storage
        finalShape.x = finalShape.x - finalShape.radius; // x becomes top-left
        finalShape.y = finalShape.y - finalShape.radius; // y becomes top-left
        shouldAdd = finalShape.radius > (5 * Math.min(scaleX, scaleY));
      } else if (["line", "arrow", "curved", "bracket", "zigzag"].includes(finalShape.type)) {
        const dx = finalShape.x2 - finalShape.x1;
        const dy = finalShape.y2 - finalShape.y1;
        shouldAdd = Math.sqrt(dx * dx + dy * dy) > (5 * Math.min(scaleX, scaleY));
      } else if (finalShape.type === "triangle" || finalShape.type === "star") {
        shouldAdd = true; // Or add more specific validation
      }

      if (shouldAdd) {
        const newShapes = [...shapes, finalShape];
        setShapes(newShapes);
        if (finalShape.type === "textbox") {
          setSelectedTool("select");
          const newShapeIndex = newShapes.length - 1;
          setSelectedShape(newShapeIndex);
          setEditingTextShapeIndex(newShapeIndex);
          setEditTextValue(finalShape.text);
        }
      }
      setDrawingShape(null);
    }
    setIsDragging(false);
    setResizing(false);
    setIsImageDragging(false);
  };

  const handleDeleteSelected = () => {
    if (selectedShape !== null) {
      if (editingTextShapeIndex === selectedShape) {
        setEditingTextShapeIndex(null); setEditTextValue("");
      }
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
  
  const handleDoubleClick = (e) => {
    // mx, my are internal canvas coordinates
    const { mx, my } = getCanvasMouseCoordinates(e);
    if (selectedTool === "select") {
        // Find shape at double click location first
        const clickedShapeIndex = shapes.findIndex((shape) => isPointInShape(mx, my, shape));
        if (clickedShapeIndex !== -1) {
            const shape = shapes[clickedShapeIndex];
            if (shape.type === "textbox") {
                setSelectedShape(clickedShapeIndex); // Ensure it's selected
                setEditingTextShapeIndex(clickedShapeIndex);
                setEditTextValue(shape.text);
            }
        }
    }
  };

  const handleTextEditComplete = () => {
    if (editingTextShapeIndex !== null && shapes[editingTextShapeIndex]) {
      setShapes(prevShapes =>
        prevShapes.map((s, i) =>
          i === editingTextShapeIndex ? { ...s, text: editTextValue } : s
        )
      );
    }
  };
  
  const handleTextareaBlur = () => {
    if (editingTextShapeIndex !== null) {
        handleTextEditComplete();
        setEditingTextShapeIndex(null); 
        setEditTextValue("");
    }
  }

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextEditComplete();
      setEditingTextShapeIndex(null); 
      setEditTextValue("");
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingTextShapeIndex(null); 
      setEditTextValue("");
    }
  };
  
  useEffect(() => {
    if (editingTextShapeIndex !== null && textInputRef.current) {
      textInputRef.current.focus();
      textInputRef.current.select();
    }
  }, [editingTextShapeIndex]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image) {
      ctx.drawImage(image, imagePosition.x, imagePosition.y, imageSize.width, imageSize.height);
      if (selectedTool === "select") {
        ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
        // Resize handle size in internal canvas units (e.g. 10px internal)
        const handleInternalSize = 10; 
        ctx.fillRect(
          imagePosition.x + imageSize.width - handleInternalSize,
          imagePosition.y + imageSize.height - handleInternalSize,
          handleInternalSize, handleInternalSize
        );
      }
    }
    drawShapes(ctx, shapes, selectedShape);
    if (drawingShape) {
      drawShapes(ctx, [drawingShape], null); 
    }
  };

  // All shape coordinates are internal canvas coordinates
  const drawShapes = (ctx, shapesToDraw, currentSelectedIdx) => {
    shapesToDraw.forEach((shape) => {
      const isSelected = (currentSelectedIdx !== null && shapes[currentSelectedIdx]?.id === shape.id) || 
                         (drawingShape && drawingShape.id === shape.id && currentSelectedIdx === null);

      ctx.strokeStyle = isSelected ? "red" : (shape.type === "textbox" ? "purple" : "blue");
      ctx.fillStyle = isSelected ? 
        (shape.type === "textbox" ? "rgba(255,0,255,0.1)" : "rgba(255,0,0,0.1)") :
        (shape.type === "textbox" ? "rgba(128,0,128,0.1)" : "rgba(0,0,255,0.1)");
      ctx.lineWidth = 2; // This is 2px in internal canvas resolution

      // Normalize dimensions for drawing (already handled in mouseUp for finalized shapes)
      let drawX = shape.x;
      let drawY = shape.y;
      let drawWidth = shape.width;
      let drawHeight = shape.height;

      if (shape.type === "rectangle" || shape.type === "textbox") {
        if (drawingShape && drawingShape.id === shape.id) { // If currently drawing
            if (shape.width < 0) { drawX = shape.x + shape.width; drawWidth = Math.abs(shape.width); }
            if (shape.height < 0) { drawY = shape.y + shape.height; drawHeight = Math.abs(shape.height); }
        }
        ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
        ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);

        if (shape.type === "textbox" && shape.text) {
            ctx.fillStyle = "black";
            ctx.font = "14px Arial"; // Font size in internal canvas units
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            const padding = 5; // Padding in internal canvas units
            ctx.save();
            ctx.beginPath();
            ctx.rect(drawX + padding / 2, drawY + padding / 2, drawWidth - padding, drawHeight - padding);
            ctx.clip();
            const lines = shape.text.split('\n');
            const lineHeight = 16; // Line height in internal canvas units for 14px font
            for (let i = 0; i < lines.length; i++) {
                const lineY = drawY + padding + (i * lineHeight);
                if (lineY < drawY + drawHeight - padding / 2 + lineHeight) { // +lineHeight to show partially visible last line
                     ctx.fillText(lines[i], drawX + padding, lineY);
                } else { break; }
            }
            ctx.restore();
        }
      } else if (shape.type === "circle") { // x,y is top-left, radius is radius
        ctx.beginPath();
        ctx.arc(shape.x + shape.radius, shape.y + shape.radius, shape.radius, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      } else if (shape.type === "line") {
        ctx.beginPath(); ctx.moveTo(shape.x1, shape.y1); ctx.lineTo(shape.x2, shape.y2); ctx.stroke();
      } else if (shape.type === "arrow") {
        ctx.beginPath(); ctx.moveTo(shape.x1, shape.y1); ctx.lineTo(shape.x2, shape.y2); ctx.stroke();
        const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
        const headLength = 15; // Internal canvas units
        ctx.beginPath(); ctx.moveTo(shape.x2, shape.y2);
        ctx.lineTo(shape.x2 - headLength * Math.cos(angle - Math.PI / 6), shape.y2 - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(shape.x2, shape.y2);
        ctx.lineTo(shape.x2 - headLength * Math.cos(angle + Math.PI / 6), shape.y2 - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (shape.type === "curved") {
        ctx.beginPath(); ctx.moveTo(shape.x1, shape.y1);
        ctx.quadraticCurveTo(shape.controlX, shape.controlY, shape.x2, shape.y2); ctx.stroke();
      } else if (shape.type === "zigzag") {
        ctx.beginPath(); ctx.moveTo(shape.x1, shape.y1);
        const dx = shape.x2 - shape.x1; const dy = shape.y2 - shape.y1;
        const segments = shape.segments || 4; const len = Math.sqrt(dx*dx + dy*dy);
        if (len === 0) { ctx.lineTo(shape.x2, shape.y2); } // Handle zero-length line
        else {
            for (let i = 1; i <= segments; i++) {
                const currentX = shape.x1 + (dx * i) / segments;
                const currentY = shape.y1 + (dy * i) / segments;
                if (i % 2 === 1) {
                    const amplitudeFactor = 0.15; // Adjust for desired zig height relative to segment length
                    const perpX = -dy / len * (len / segments * amplitudeFactor); 
                    const perpY = dx / len * (len / segments * amplitudeFactor);
                    ctx.lineTo(currentX + perpX, currentY + perpY);
                } else { ctx.lineTo(currentX, currentY); }
            }
            if (segments % 2 === 1 && (shape.x2 !== ctx.currentX || shape.y2 !== ctx.currentY)) { ctx.lineTo(shape.x2, shape.y2); }
        }
        ctx.stroke();
      } else if (shape.type === "bracket") {
        const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
        const length = Math.sqrt((shape.x2 - shape.x1) ** 2 + (shape.y2 - shape.y1) ** 2);
        const bracketArmLength = Math.min(20, length * 0.2); // Internal units
        ctx.beginPath(); ctx.moveTo(shape.x1, shape.y1); ctx.lineTo(shape.x2, shape.y2);
        ctx.moveTo(shape.x1, shape.y1); ctx.lineTo(shape.x1 + bracketArmLength * Math.cos(angle + Math.PI / 2), shape.y1 + bracketArmLength * Math.sin(angle + Math.PI / 2));
        ctx.moveTo(shape.x1, shape.y1); ctx.lineTo(shape.x1 + bracketArmLength * Math.cos(angle - Math.PI / 2), shape.y1 + bracketArmLength * Math.sin(angle - Math.PI / 2));
        ctx.moveTo(shape.x2, shape.y2); ctx.lineTo(shape.x2 - bracketArmLength * Math.cos(angle + Math.PI / 2), shape.y2 - bracketArmLength * Math.sin(angle + Math.PI / 2));
        ctx.moveTo(shape.x2, shape.y2); ctx.lineTo(shape.x2 - bracketArmLength * Math.cos(angle - Math.PI / 2), shape.y2 - bracketArmLength * Math.sin(angle - Math.PI / 2));
        ctx.stroke();
      } else if (shape.type === "triangle" && shape.points?.length === 3) {
        ctx.beginPath(); ctx.moveTo(shape.points[0][0], shape.points[0][1]);
        ctx.lineTo(shape.points[1][0], shape.points[1][1]);
        ctx.lineTo(shape.points[2][0], shape.points[2][1]);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      } else if (shape.type === "star" && shape.center && shape.outerRadius) {
        ctx.beginPath();
        const {x: cx, y: cy} = shape.center;
        const spikes = shape.points || 5; const outerRadius = shape.outerRadius;
        const innerRadius = shape.innerRadius || outerRadius * 0.4;
        let rot = (Math.PI / 2) * 3; const step = Math.PI / spikes;
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
          let xPt = cx + Math.cos(rot) * outerRadius; let yPt = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(xPt, yPt); rot += step;
          xPt = cx + Math.cos(rot) * innerRadius; yPt = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(xPt, yPt); rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    });
  };

  useEffect(() => {
    draw();
  }, [image, shapes, drawingShape, selectedShape, imagePosition, imageSize, selectedTool, editingTextShapeIndex]);

  let textEditorStyles = {};
  if (editingTextShapeIndex !== null && shapes[editingTextShapeIndex]?.type === 'textbox' && canvasRef.current) {
    const shape = shapes[editingTextShapeIndex]; // Has internal canvas coordinates
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect(); // Displayed rect of canvas

    // Scale factor from internal canvas units to display pixels
    const displayScaleX = canvasRect.width > 0 ? canvasRect.width / canvas.width : 1;
    const displayScaleY = canvasRect.height > 0 ? canvasRect.height / canvas.height : 1;

    // Convert shape's internal coordinates and dimensions to display pixels
    const s_disp_x = shape.x * displayScaleX;
    const s_disp_y = shape.y * displayScaleY;
    const s_disp_width = shape.width * displayScaleX;
    const s_disp_height = shape.height * displayScaleY;
    
    // Position textarea relative to the document (absolute positioning)
    const textLeftPx = s_disp_x + canvasRect.left + window.scrollX;
    const textTopPx = s_disp_y + canvasRect.top + window.scrollY;
    // Ensure minimum display size for textarea
    const textWidthPx = Math.max(30, s_disp_width); 
    const textHeightPx = Math.max(20, s_disp_height);

    textEditorStyles = {
      position: 'absolute',
      left: `${textLeftPx}px`,
      top: `${textTopPx}px`,
      width: `${textWidthPx}px`,
      height: `${textHeightPx}px`,
      font: '14px Arial', // Keep consistent with canvas text rendering
      border: '1px solid #d1d5db', // Tailwind gray-300 like .border-gray-300
      borderRadius: '0.25rem',    // Tailwind rounded like .rounded
      backgroundColor: 'white',
      padding: '4px',          
      boxSizing: 'border-box',
      zIndex: 100,
      resize: 'none',
      overflowWrap: 'break-word',
      whiteSpace: 'pre-wrap',
    };
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 relative">
      <div className="editor-toolbar mb-4">
        <div className="flex flex-wrap items-center border border-gray-300 rounded overflow-hidden bg-gray-100">
          <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
          <button className="p-2 border-r border-gray-300 hover:bg-gray-200" onClick={() => fileInputRef.current.click()} title="Upload Image">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </button>
          <button className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${selectedTool === "select" ? "bg-blue-100" : ""}`} onClick={() => handleToolSelect("select")} title="Select Tool">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l7 7L7 17l10-7-7-7z"></path><path d="M10 10l4 4"></path></svg>
          </button>
          <button className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${selectedTool === "textbox" ? "bg-blue-100" : ""}`} onClick={() => handleToolSelect("textbox")} title="Textbox">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
          </button>
          <span className="px-2 border-r border-gray-300 bg-gray-200 text-gray-600 text-sm">Lines</span>
          <button className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${selectedTool === "line" ? "bg-blue-100" : ""}`} onClick={() => handleToolSelect("line")} title="Line"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="19" x2="19" y2="5"></line></svg></button>
          <button className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${selectedTool === "arrow" ? "bg-blue-100" : ""}`} onClick={() => handleToolSelect("arrow")} title="Arrow"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>
          <button className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${selectedTool === "curved" ? "bg-blue-100" : ""}`} onClick={() => handleToolSelect("curved")} title="Curved Line"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6c0 0 6 0 9 6s9 6 9 6"></path></svg></button>
          <button className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${selectedTool === "zigzag" ? "bg-blue-100" : ""}`} onClick={() => handleToolSelect("zigzag")} title="Zigzag Line"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3.5 6.5 8.5 11.5 3.5 16.5 8.5 21.5"></polyline><polyline points="15.5 6.5 10.5 11.5 15.5 16.5 10.5 21.5"></polyline></svg></button>
          <button className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${selectedTool === "bracket" ? "bg-blue-100" : ""}`} onClick={() => handleToolSelect("bracket")} title="Bracket"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h1"></path><path d="M16 3h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-1"></path><line x1="7" y1="12" x2="17" y2="12"></line></svg></button>
          <span className="px-2 border-r border-gray-300 bg-gray-200 text-gray-600 text-sm">Shapes</span>
          <button className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${selectedTool === "rectangle" ? "bg-blue-100" : ""}`} onClick={() => handleToolSelect("rectangle")} title="Rectangle"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect></svg></button>
          <button className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${selectedTool === "circle" ? "bg-blue-100" : ""}`} onClick={() => handleToolSelect("circle")} title="Circle"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg></button>
          <button className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${selectedTool === "triangle" ? "bg-blue-100" : ""}`} onClick={() => handleToolSelect("triangle")} title="Triangle"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 19h20L12 2z"></path></svg></button>
          <button className={`p-2 border-r border-gray-300 hover:bg-gray-200 ${selectedTool === "star" ? "bg-blue-100" : ""}`} onClick={() => handleToolSelect("star")} title="Star"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></button>
          {selectedShape !== null && (
            <button className="ml-auto p-2 bg-red-100 hover:bg-red-200 text-red-700" onClick={handleDeleteSelected} title="Delete Selected">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          )}
        </div>
      </div>

      <div className="border border-gray-300 rounded" style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          className="w-full h-auto border-b border-gray-300 block"
          style={{ touchAction: 'none' }}
        />
        {editingTextShapeIndex !== null && shapes[editingTextShapeIndex]?.type === 'textbox' && (
          <textarea
            ref={textInputRef}
            value={editTextValue}
            onChange={(e) => setEditTextValue(e.target.value)}
            onBlur={handleTextareaBlur}
            onKeyDown={handleTextareaKeyDown}
            style={textEditorStyles}
          />
        )}
      </div>

      <div className="mt-4">
        <div className="flex mb-2">
          <input type="text" className="flex-1 p-2 border border-gray-300 rounded-l" placeholder="Add a comment..." value={currentComment} onChange={(e) => setCurrentComment(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleAddComment()} />
          <button className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600" onClick={handleAddComment}>Add Comment</button>
        </div>
        <div className="comments-list mt-2">
          <h3 className="text-lg font-semibold mb-2">Comments</h3>
          {comments.length === 0 ? (<p className="text-gray-500">No comments yet.</p>) : (
            <ul className="list-disc pl-5">
              {comments.map((comment) => (<li key={comment.id} className="mb-1">{comment.text}</li>))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
