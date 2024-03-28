import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Map from "../images/irelandMap.svg"

const IndexPage: React.FC<PageProps> = () => {
  return (
    <main>
      <h1 className="text-amber-700">MapGusser</h1>
      <p>Guess the location of a photo on a map!</p>
      <img src={Map} alt="Ireland map" />
    </main>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>MapGusser</title>
