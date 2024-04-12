import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Game from "../components/Game"
import TopBarGame from "../components/TopBarGame"

const IndexPage: React.FC<PageProps> = () => {
  return (
    <main>
      <Game /> 
    </main>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>MapGusser</title>
