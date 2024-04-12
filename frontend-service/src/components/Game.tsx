import React, { useState, useEffect } from 'react'
import type { Pin, Round } from '../Types'
import roundsData from "../data/rounds.json"
import MapboxMap from './MapBoxMap'

export default function Game() {
  // Login will be handled by a hook with amplfiy, so it doesn't need to be global state
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false) 
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0)
  const [rounds, setRounds] = useState<Round[] | null>(null)
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false)
  const [aggregateUserGameScore, setAggregateUserGameScore] = useState<number>(0)

  const handleGuess = () => {
    console.log('Guess')
  }

  const generateRounds = () => {

    setRounds(roundsData.locations)
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

  console.log(rounds[currentRoundIndex])

  return (
    <>
      <div>Current round: {currentRoundIndex + 1}/5</div>
      <div>Total score: {aggregateUserGameScore}</div>
      <button
        className='disabled:bg-gray-500 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        onClick={moveToNextRound}
        disabled={!roundCompleted}
      >Next Round</button>
      <MapboxMap
        roundDetails={rounds[currentRoundIndex]}
        handleGuess={handleGuess}
      />
    </>
    
  )
}
