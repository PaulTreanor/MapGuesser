import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Canvas from "../components/canvas"

const IndexPage: React.FC<PageProps> = () => {
  return (
    <main>
      <h1 className="text-amber-700 text-3xl">MapGusser</h1>
      <h2 className="text-lg">Guess the location of the Athlone on the map!</h2>
      <Canvas />
    </main>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>MapGusser</title>
