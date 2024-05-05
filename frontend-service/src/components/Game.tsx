import React, { useState, useEffect } from 'react'
import type {Pin, Round } from '../Types'
import roundsData from "../data/rounds.json"
import MapboxMap from './MapBoxMap'
import TopBarGame from './TopBarGame'
import Modal from './Modal'


export default function Game() {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0)
  const [rounds, setRounds] = useState<Round[] | null>(null)
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false)
  const [score, setScore] = useState<number>(0)
  const [isModalOpen, setIsModalOpen] = useState(true); // State to control modal visibility


  const handleGuess = (distance: number) => {
    console.log('Guess', distance)
    setScore(score + distance)
    setRoundCompleted(true)
  }

  const generateRounds = () => {
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
    setRoundCompleted(false)
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

  if (currentRoundIndex === 5 && roundCompleted) {
    return (
      <div>Game Over</div>
    )
  }

  return (
    <>
      { isModalOpen && 
        <Modal onClose={() => setIsModalOpen(false)}>
          <h1
            className="font-titillium text-blue-800 text-4xl font-bold md:mb-2 flex flex-col md:flex-row items-baseline"
          >
            🌎 MapGuesser 
            <span className="text-slate-400 text-xl font-light mt-2 md:mt-0 md:ml-2">Inspired by GeoGuessr!</span>
          </h1>
          <br />
          <p className="text-lg text-slate-950">
            For each round, try to pinpoint the city on the map. The map supports panning and zooming. 
          </p>
          <br />
          <p className="text-lg text-slate-950">
          Scores are based on how far your guess is from the city's real location, so lower scores are better.  There is 5 rounds per game and you want your final score as close to 0 as possible, like golf.
          </p>
          <br />
          <p className="text-lg text-slate-950">
            Please share MapGuesser with your friends if you enjoyed it!
          </p>
          <br />
          <div className="flex justify-end mr-2">
            <button onClick={() => setIsModalOpen(false)} className="bg-blue-800 hover:bg-blue-900 text-xl text-white font-bold py-2 px-4 rounded">
              Start Game!
            </button>
          </div>
        </Modal>
      }
      <div className="relative h-screen"> {/* Ensure the container fills the screen or has a defined height */}
        {!isModalOpen && (
          <TopBarGame
            roundLocation={rounds[currentRoundIndex].location}
            score={score}
            currentRound={currentRoundIndex + 1}
            roundCompleted={roundCompleted}
            moveToNextRound={moveToNextRound}
          />
        )}
        <div className="absolute top-0 left-0 right-0 bottom-0"> {/* Map container filling the entire parent */}
  
          <MapboxMap
            roundDetails={rounds[currentRoundIndex]}
            handleGuess={handleGuess}
          />
        </div>
      </div>
    </>
  )
}
