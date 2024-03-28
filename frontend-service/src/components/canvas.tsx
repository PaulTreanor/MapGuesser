import React, { useEffect, useRef, useState } from 'react'
import MapImage from "../images/irelandMap.svg"

function GameMap() {
  const canvasRef = useRef(null);
  // useState to store all pin's coordinates
  const [pins, setPins] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const image = new Image();
    image.src = MapImage;
    image.onload = () => {
      // Clear the canvas before drawing the image again
      context.clearRect(0, 0, canvas.width, canvas.height);
      // Draw the map image
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      // Draw only the most recent pin, if there is one
      if (pins.length > 0) {
        const lastPin = pins[pins.length - 1];
        drawPin(context, lastPin.x, lastPin.y);
      }
    };
  }, [pins]); // Redraw when the pins array changes
  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Update the pins array with the new pin, consider checking for map boundaries here
    setPins(prevPins => [...prevPins, { x, y }]);
  };

  // Function to draw the pin
  const drawPin = (context, x, y) => {
    context.fillStyle = 'red'; // Pin color
    context.beginPath();
    context.arc(x, y, 5, 0, 2 * Math.PI); // Draw a circle as a pin
    context.fill();
  };

  return <canvas ref={canvasRef} width={600} height={600} onClick={handleCanvasClick} />;
}

export default GameMap;
