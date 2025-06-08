import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Game from "../components/Game"
import MenuBar from "../components/MenuBar"
import favicon from "../images/favicon.ico"
import { NotificationProvider } from "../context/NotificationContext"
import { LoadingProvider } from "../context/LoadingContext"
import ToastContainer from "../components/ToastContainer"

const IndexPage: React.FC<PageProps> = () => {

  return (
    <NotificationProvider>
      <LoadingProvider>
        <main className="h-full overflow-hidden">
          <Game />
          <MenuBar />
          <ToastContainer />
        </main>
      </LoadingProvider>
    </NotificationProvider>
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

