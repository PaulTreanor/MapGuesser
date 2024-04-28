import React from 'react'

interface TopBarGameProps {
  roundLocation: string
  score: number
  currentRound: number
  roundCompleted: boolean
  moveToNextRound: () => void
}

export default function TopBarGame({ roundLocation, score, currentRound, roundCompleted, moveToNextRound}: TopBarGameProps) {
  return (
    <nav className="border-gray-200 pointer-events-none min-h-64">
      <div className="max-w-screen-xl flex flex-col md:flex-row md:flex-wrap items-center justify-between mx-auto py-4 pointer-events-auto">
        <div className="flex flex-col md:flex-row items-center">
          <h1 className="font-titillium text-blue-700 text-3xl font-bold z-30 mr-4 hidden sm:block">🌎 MapGuesser</h1>
          <div className="p-4 bg-white rounded-md z-30"> 
            <h2 className='text-2xl'>Where is <span className='font-bold'>{roundLocation}</span>?</h2>
          </div>
        </div>
        <button
          hidden={!roundCompleted}
          className='disabled:bg-gray-500 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded pointer-events-auto z-30 mt-4 md:mt-0'
          onClick={moveToNextRound}
          disabled={!roundCompleted}
        >
          Next Round
        </button>
        <div className='px-4 py-2 bg-white rounded-md z-30 mt-4 md:mt-0 absolute bottom-0 right-0 mb-4 mr-4 md:relative md:mb-0 md:mr-0'>
          <p className='z-30'>{score} points</p>
          <p className='z-30'>{currentRound}/5</p>
        </div>
      </div>
    </nav>
  )
}