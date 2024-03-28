import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"

const IndexPage: React.FC<PageProps> = () => {
  return (
    <main>
      <h1 className="text-amber-700">MapGusser</h1>
      <p>Guess the location of a photo on a map!</p>
    </main>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>MapGusser</title>
