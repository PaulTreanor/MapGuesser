import React, { useEffect, useRef, useState } from 'react'
import MapImage from "../images/irelandMap.svg"
import type { Round, Pin } from '../Types'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";


interface GameMapProps {
  roundDetails: Round
  onGuess: (pin: Pin, distance: number) => void
}

function GameMap({ roundDetails, onGuess }: GameMapProps) {

  const canvasRef = useRef(null);
  // useState to store all pin's coordinates
  const [pin, setPin] = useState<Pin | null>(null)
  const [canGuess, setCanGuess] = useState(true);

  useEffect(() => {
    setPin(null);
    setCanGuess(true);
  } , [roundDetails]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const image = new Image();
    image.src = MapImage;
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      if (pin) {
        drawPin(context, pin.x, pin.y);
        drawHouse(context, roundDetails.coordinates.x, roundDetails.coordinates.y);
        const distance = drawLineAndDistance(context, roundDetails.coordinates, pin);
        onGuess({ x: pin.x, y: pin.y }, distance );
      }
    };
  }, [pin, roundDetails]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canGuess) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setPin({ x, y });
    setCanGuess(false); // Disable further guesses after the current one
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
    return distance;
  };


  

  return (
    <>
      <h1>Guess the location of {roundDetails.location}</h1>
      <TransformWrapper
        wheel={{
          step: 250, // Adjust this value to control zoom speed, higher values for faster zoom
        }}
        // You can also adjust pinch options if needed
        pinch={{
          disabled: false, // Enable pinch gesture (default: false)
          step: 0.05 // Adjust pinch speed (default: 0.01)
        }}
        // Other props for further customization
        doubleClick={{
          disabled: false, // Disable or enable zooming on double click (default: false)
        }} 

      >
        <TransformComponent>
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            onClick={handleCanvasClick}
            className={`${!canGuess ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
          />;
        </TransformComponent>
      </TransformWrapper>
      
    </>
  )
  
  
}

export default GameMap;
