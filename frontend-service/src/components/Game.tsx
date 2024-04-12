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
    // setRounds(roundsData.simpleGame as any)
    // console.log({"rounds": rounds})


    // Create copy to avoid mutating the original data
    const generalRoundsList = [...roundsData.generalEurope]
      const randomRounds = []
      for (let i = 0; i < 5; i++) {
        if (generalRoundsList.length === 0) {
          break; // break if there are no more rounds to select
        }
        const randomIndex = Math.floor(Math.random() * generalRoundsList.length)
        randomRounds.push(generalRoundsList[randomIndex])
        generalRoundsList.splice(randomIndex, 1) // remove the selected round from the list
      }
    // TypeScript being stupid, not worth complexity
      setRounds(randomRounds as any)
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
