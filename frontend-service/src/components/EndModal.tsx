import React from 'react'
import Modal from './Modal'


export default function EndModal({ score }: { score: number }) {
  
  const handlePlayAgain = () => {
    window.location.reload();
  }

  return (
    <Modal onClose={() => alert("closed")}>
          <h1
            className="font-titillium text-blue-800 text-4xl font-bold md:mb-2 flex flex-col md:flex-row items-baseline"
          >
            🌎 MapGuesser 
            <span className="text-slate-400 text-xl font-light mt-2 md:mt-0 md:ml-2">Inspired by GeoGuessr!</span>
          </h1>
          <br />
          <p className="text-lg text-slate-950 text-center flex items-center justify-center">
            Your final score is
            <span className="font-black text-3xl md:text-4xl lg:text-5xl pl-1 md:pl-2 lg:pl-3 text-green-700 animate-pulse">
              {"  " + score}
            </span>
          </p>
          <div className="flex justify-center mt-10 mr-2">
            <button onClick={handlePlayAgain} className="bg-blue-800 hover:bg-blue-900 text-xl text-white font-bold py-2 px-4 rounded">
              Play again
            </button>
          </div>
    </Modal>
  )
}
