import React from 'react'

interface TopBarGameProps {
  score: number
  currentRound: number
  roundCompleted: boolean
  moveToNextRound: () => void
}

export default function TopBarGame({score, currentRound, roundCompleted, moveToNextRound}) {
  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <h1 className="text-amber-700 text-3xl">MapGuesser</h1>
        <div className="*:w-full md:block md:w-auto" id="navbar-default">
          <button
            className='disabled:bg-gray-500 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            onClick={moveToNextRound}
            disabled={!roundCompleted}
          >
            Next Round
          </button>
          <p>{score} points</p>
          <p>{currentRound}/5</p>
        </div>
      </div>
    </nav>
  )
}
