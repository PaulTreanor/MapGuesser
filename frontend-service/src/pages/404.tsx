import * as React from "react"
import { Link, HeadFC, PageProps } from "gatsby"
import favicon from "../images/favicon.ico"
import { navigate } from "gatsby"


const NotFoundPage: React.FC<PageProps> = () => {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-slate-100 relative">
      <h2
            className="font-titillium text-blue-800 text-3xl md:text-4xl font-bold md:mb-4 flex flex-col md:flex-row items-baseline absolute top-0 left-0 m-4"
          >
            🌎 MapGuesser 
      </h2>
      <h1 className="font-titillium text-4xl md:text-6xl font-bold text-slate-800 mb-4 md:mb-6">
        Page not found 😐
      </h1>
      <p className="font-titillium text-xl font-light text-slate-700 mb-10">
        Sorry this page doesn't exist. 
      </p>
      <button onClick={() => navigate('/')} className="bg-blue-800 hover:bg-blue-900 text-xl text-white font-bold py-2 px-4 rounded">
        Go back home
      </button>
    </main>
  )
}

export default NotFoundPage

export const Head: HeadFC = () => (
  <>
    <title>Not found</title>
    <link rel="icon" href={favicon} type="image/x-icon" />
  </>
)
