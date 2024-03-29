import React, { useState, useEffect } from 'react'
import type { Pin, Round } from '../Types'
import GameMap from "../components/GameMap"


const hardCordeRounds: Round[] = [
  {
    location: "Athlone",
    coordinates: { x: 300, y: 300 }
  },
  {
    location: "Dublin",
    coordinates: { x: 490, y: 310 }
  },
  {
    location: "Galway",
    coordinates: { x: 180, y: 320 }
  }
]

export default function Game() {
  let gameRounds: Round[] = [] 
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(3)
  const [pins, setPins] = useState<Pin[]>([])
  const aggregateUserGameScore = 0 // Updates with each round 

  const handleGuess = (pin: Pin, distance:number) => {
    // setPins([...pins, pin])
    // if (pins.length === 3) {
    //   setCurrentRoundIndex(currentRoundIndex + 1)
    // }
    console.log({ "pin": pin })
    console.log({ "distance": distance })
  }

  return (
    <>
      <div>Current round: {currentRoundIndex}/5</div>
      <div>Total score: {aggregateUserGameScore}</div>
      <GameMap
        roundDetails={hardCordeRounds[currentRoundIndex - 1]}
        onGuess={handleGuess}
      />
    </>
    
  )
}
