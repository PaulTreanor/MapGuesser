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
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(1)
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false)
  const [pins, setPins] = useState<Pin[]>([])
  const [aggregateUserGameScore, setAggregateUserGameScore] = useState<number>(0)

  const handleGuess = (pin: Pin, distance:number) => {
    // setPins([...pins, pin])
    // if (pins.length === 3) {
    //   setCurrentRoundIndex(currentRoundIndex + 1)
    // }
    // Update the aggregateUserGameScore with the distance
    setAggregateUserGameScore(Number(aggregateUserGameScore) + Number(distance))
    // make it so the user can't make another guess this round 
    setRoundCompleted(true)
  }

  const moveToNextRound = () => {
    console.log('Next round')
    setCurrentRoundIndex(currentRoundIndex + 1)
  }

  return (
    <>
      <div>Current round: {currentRoundIndex}/5</div>
      <div>Total score: {aggregateUserGameScore}</div>
      <button
        className='disabled:bg-gray-500 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        onClick={moveToNextRound}
        disabled={!roundCompleted}
      >Next Round</button>
      <GameMap
        roundDetails={hardCordeRounds[currentRoundIndex - 1]}
        onGuess={handleGuess}
      />
    </>
    
  )
}
