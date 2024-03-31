import React, { useState, useEffect } from 'react'
import type { Pin, Round } from '../Types'
import GameMap from "../components/GameMap"
import roundsData from "../data/rounds.json"

export default function Game() {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0)
  const [rounds, setRounds] = useState<Round[] | null>(null)
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false)
  const [aggregateUserGameScore, setAggregateUserGameScore] = useState<number>(0)

  const handleGuess = (pin: Pin, distance:number) => {
    setAggregateUserGameScore(Number(aggregateUserGameScore) + Number(distance))
    setRoundCompleted(true)
  }

  const generateRounds = () => {
    // simulate fetching rounds from an API
    setTimeout(() => {
      setRounds(roundsData.defaultGame)
    }, 600)
  }

  const moveToNextRound = () => {
    console.log('Next round')
    if (currentRoundIndex === 4) {
      return
    }
    setCurrentRoundIndex(currentRoundIndex + 1)
  }

  useEffect(() => {
    generateRounds()
  }, [])

  if (!rounds) {
    return (
      <div>Loading...</div>
    )
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
        roundDetails={rounds[currentRoundIndex]}
        onGuess={handleGuess}
      />
    </>
    
  )
}
