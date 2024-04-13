import React from 'react'

interface TopBarGameProps {
  score: number
  currentRound: number
  roundCompleted: boolean
  moveToNextRound: () => void
}

export default function TopBarGame({ roundLocation, score, currentRound, roundCompleted, moveToNextRound}) {
  return (
    <nav className="border-gray-200 pointer-events-none min-h-64">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 pointer-events-auto">
        <div className="flex items-center">
          <h1 className="text-amber-700 text-3x z-30 mr-4">MapGuesser</h1>
          <div className="p-4 bg-white bg-opacity-90 rounded-md z-30"> 
            <h2 className='text-2xl'>Where is <span className='font-bold'>{roundLocation}</span>?</h2>
          </div>
        </div>
        <button
          hidden={!roundCompleted}
          className='disabled:bg-gray-500 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded pointer-events-auto z-30'
          onClick={moveToNextRound}
          disabled={!roundCompleted}
        >
          Next Round
        </button>
        <div className='z-30'>
          <p className='z-30'>{score} points</p>
          <p className='z-30'>{currentRound}/5</p>
        </div>
      </div>
    </nav>
  )
}
