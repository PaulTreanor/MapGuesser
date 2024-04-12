import React, { useState, useEffect } from 'react'
import type {Pin, Round } from '../Types'
import roundsData from "../data/rounds.json"
import MapboxMap from './MapBoxMap'


export default function Game() {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0)
  const [rounds, setRounds] = useState<Round[] | null>(null)
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false)

  const handleGuess = () => {
    console.log('Guess')
    setRoundCompleted(true)
  }

  const generateRounds = () => {
    // TypeScript being stupid, not worth complexity
    setRounds(roundsData.locations as any)
    console.log({"rounds": rounds})
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
      <button
        className='disabled:bg-gray-500 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        onClick={moveToNextRound}
        disabled={!roundCompleted}
      >Next Round</button>
      <h2 className='text-2xl'>Where is <span className='font-bold'>{rounds[currentRoundIndex].location}</span>?</h2>
      <MapboxMap
        roundDetails={rounds[currentRoundIndex]}
        handleGuess={handleGuess}
      />
    </>
    
  )
}
