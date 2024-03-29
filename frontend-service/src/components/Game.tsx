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
  },
  {
    location: "Cork",
    coordinates: { x: 250, y: 400 }
  },
  {
    location: "Limerick",
    coordinates: { x: 200, y: 350 }
  }
]


export default function Game() {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0)
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false)
  const [aggregateUserGameScore, setAggregateUserGameScore] = useState<number>(0)

  const handleGuess = (pin: Pin, distance:number) => {
    setAggregateUserGameScore(Number(aggregateUserGameScore) + Number(distance))
    setRoundCompleted(true)
  }

  const moveToNextRound = () => {
    console.log('Next round')
    if (currentRoundIndex === 4) {
      return
    }
    setCurrentRoundIndex(currentRoundIndex + 1)
  }

  if (currentRoundIndex === 4 && roundCompleted) {
    return (
      <div>Game Over</div>
    )
  }

  return (
    <>
      <div>Current round: {currentRoundIndex + 1}/5</div>
      <div>Total score: {aggregateUserGameScore}</div>
      <button
        className='disabled:bg-gray-500 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        onClick={moveToNextRound}
        disabled={!roundCompleted}
      >Next Round</button>
      <GameMap
        roundDetails={hardCordeRounds[currentRoundIndex]}
        onGuess={handleGuess}
      />
    </>
    
  )
}
