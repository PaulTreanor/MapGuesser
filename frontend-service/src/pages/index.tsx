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
    <script defer src="https://cloud.umami.is/script.js" data-website-id="442ee600-5344-4b48-b5e6-ee6e3b497171"></script>
  </>
)

