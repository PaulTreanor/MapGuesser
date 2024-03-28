import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Game from "../components/Game"

const IndexPage: React.FC<PageProps> = () => {
  return (
    <main>
      <h1 className="text-amber-700 text-3xl">MapGusser</h1>
      <h2 className="text-lg">How well do you know Ireland?</h2>
      <Game />
    </main>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>MapGusser</title>
