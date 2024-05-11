import React from 'react'

interface TopBarGameProps {
  roundLocation: string
  score: number
  currentRound: number
  roundCompleted: boolean
  moveToNextRound: () => void,
  setIsEndModalOpen: (value: boolean) => void,
  isEndModalOpen: boolean
}

export default function TopBarGame({ roundLocation, score, currentRound, roundCompleted, moveToNextRound, setIsEndModalOpen, isEndModalOpen }: TopBarGameProps) {

  return (
    <nav className="border-gray-200 pointer-events-none min-h-64">
      <div className="mx-4 flex flex-col sm:flex-row sm:flex-wrap items-center justify-between py-4 pointer-events-auto">
        <div className="flex flex-col sm:flex-row items-center">
          <h1 className="font-titillium text-blue-800 text-4xl font-bold z-30 mr-4 hidden md:block md:absolute md:bottom-0 md:left-0 md:ml-4 md:mb-4 ">
            🌎
            <span className='text-shadow'> MapGuesser</span>
          </h1>
          <div className="p-4 bg-blue-900 rounded-md z-30 shadow-slate-50 shadow-sm"> 
            <h2 className='text-2xl text-white'>
              Where is <span className='font-bold'>{roundLocation}</span>?
            </h2>
          </div>
        </div>
        <button
          hidden={!roundCompleted || currentRound == 5}
          className='disabled:bg-gray-500 bg-rose-700 hover:bg-rose-800 text-white font-bold py-2 px-4 rounded pointer-events-auto z-30 mt-4 sm:mt-0 sm:absolute sm:bottom-0 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:mb-4  shadow-slate-50 shadow-sm'
          onClick={moveToNextRound}
          disabled={!roundCompleted}
        >
          Next Round
        </button>
        {currentRound === 5 && roundCompleted && !isEndModalOpen && (
          <button
            className='bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded pointer-events-auto z-30 mt-4 sm:mt-0 sm:absolute sm:bottom-0 sm:right-1/2 sm:transform sm:translate-x-1/2 sm:mb-4 shadow-slate-50 shadow-sm'
            onClick={() => setIsEndModalOpen(true)}
          >
            Finish Game
          </button>
        )}
        {currentRound > 1 && (
          <div className='px-4 py-2 bg-blue-900 text-white rounded-md z-30 mt-4 sm:mt-0 absolute bottom-0 right-0 mb-6 mr-4 sm:relative sm:mb-0 sm:mr-0  shadow-slate-50 shadow-sm'>
            <p className='z-30'>{score} points</p>
            <p className='z-30'>{currentRound}/5</p>
          </div>
        )}
      </div>
    </nav>
  )
}