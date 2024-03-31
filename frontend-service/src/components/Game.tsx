import React, { useState, useEffect } from 'react'
import type { Pin, Round } from '../Types'
import GameMap from "../components/GameMap"
import roundsData from "../data/rounds.json"

export default function Game() {
  // Login will be handled by a hook with amplfiy, so it doesn't need to be global state
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false) 
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
    if (isUserLoggedIn) {
      setRounds(roundsData.defaultGame)
    } else {
      // Pick 5 random rounds from the generalRoundsList
      const generalRoundsList = [...roundsData.generalRoundsList] // create a copy of the array to avoid mutating the original
      const randomRounds = []
      for (let i = 0; i < 5; i++) {
        if (generalRoundsList.length === 0) {
          break; // break if there are no more rounds to select
        }
        const randomIndex = Math.floor(Math.random() * generalRoundsList.length)
        randomRounds.push(generalRoundsList[randomIndex])
        generalRoundsList.splice(randomIndex, 1) // remove the selected round from the list
      }
      setRounds(randomRounds)
    }
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
