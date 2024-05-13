import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Game from "../components/Game"
import favicon from "../images/favicon.ico"

const IndexPage: React.FC<PageProps> = () => {
  return (
    <main className="h-full overflow-hidden">
      <Game /> 
    </main>
  )
}

export default IndexPage

export const Head: HeadFC = () => (
  <>
    <title>MapGuesser</title>
    <link rel="icon" href={favicon} type="image/x-icon" />
  </>
)

