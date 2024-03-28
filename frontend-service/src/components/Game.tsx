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
    coordinates: { x: 100, y: 100 }
  },
  {
    location: "Galway",
    coordinates: { x: 200, y: 200 }
  }
]

// const generateRounds = (): Round[] => {
//   return 
// }

export default function Game() {
  let gameRounds: Round[] = [] 
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(1)
  const [pins, setPins] = useState<Pin[]>([])
  const aggregateUserGameScore = 0 // Updates with each round 

  // onLoad generate rounds 
  useEffect(() => {
    gameRounds = hardCordeRounds

  }, [])

  return (
    <>
      <div>Current round: {currentRoundIndex}/5</div>
      <div>Total score: {aggregateUserGameScore}</div>
      <GameMap roundDetails={hardCordeRounds[currentRoundIndex - 1]} />
    </>
    
  )
}
