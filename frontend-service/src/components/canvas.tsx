import React, { useEffect, useRef } from 'react'
import MapImage from "../images/irelandMap.svg"

function GameMap() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const image = new Image();
    image.src = MapImage;
    image.onload = () => {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }, []);

  return <canvas ref={canvasRef} width={600} height={600} />;
}

export default GameMap;