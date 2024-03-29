import React, { useEffect, useRef, useState } from 'react'
import MapImage from "../images/irelandMap.svg"
import type { Round, Pin } from '../Types'

interface GameMapProps {
  roundDetails: Round
}

function GameMap({ roundDetails }: GameMapProps) {

  const canvasRef = useRef(null);
  // useState to store all pin's coordinates
  const [pin, setPin] = useState<Pin | null>(null)

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
      if (pin) {
        console.log({ pin })
        drawPin(context, pin.x, pin.y);
        drawHouse(context, roundDetails.coordinates.x, roundDetails.coordinates.y);
        drawLineAndDistance(context, roundDetails.coordinates, pin);
      }
    };
  }, [pin]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setPin({ x, y });
  };

  const drawHouse = (context: CanvasRenderingContext2D, x: number, y: number) => {
    context.font = '30px serif';
    context.fillText('🏘️', x, y);
  }

  const drawPin = (context: CanvasRenderingContext2D, x: number, y: number) => {
    context.fillStyle = 'red'; // Pin color
    context.beginPath();
    context.arc(x, y, 5, 0, 2 * Math.PI); // Draw a circle as a pin
    context.fill();
  };

  const drawLineAndDistance = (context: CanvasRenderingContext2D, start: Pin, end: Pin) => {
    // Draw dotted line
    context.setLineDash([5, 5]); // Set the dash pattern
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.strokeStyle = 'blue';
    context.stroke();
    context.setLineDash([]); // Reset the dash pattern to solid

    // Calculate and display the distance
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy).toFixed(2); // Pythagorean theorem, fixed to 2 decimals

    // Display distance
    context.font = '16px Arial';
    context.fillStyle = 'black';
    // Positioning the distance text near the pin with an offset
    context.fillText(`${distance} units`, end.x + 10, end.y + 10);
  };

  return (
    <>
      <h1>Guess the location of {roundDetails.location}</h1>
      <canvas ref={canvasRef} width={600} height={600} onClick={handleCanvasClick} className="cursor-crosshair" />;
    </>
  )
  
  
}

export default GameMap;
