import * as React from "react"
import { Link, HeadFC, PageProps } from "gatsby"
import favicon from "../images/favicon.ico"
import { navigate } from "gatsby"
import { Button } from "../components/ui/button"
import { Heading, Subheading, Paragraph } from "../components/typography/Typography"


const NotFoundPage: React.FC<PageProps> = () => {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-slate-100 relative">
      <Heading className="text-3xl md:text-4xl flex flex-col md:flex-row items-baseline absolute top-0 left-0 m-4">
        🌎 MapGuesser 
      </Heading>
      <Heading className="text-4xl md:text-6xl text-slate-800 mb-4 md:mb-6">
        Page not found 😐
      </Heading>
      <Paragraph className="text-xl font-light text-slate-700 mb-10">
        Sorry this page doesn't exist. 
      </Paragraph>
      <Button 
        onClick={() => navigate('/')} 
        variant="mapguesser" 
        size="xl"
      >
        Go back home
      </Button>
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
