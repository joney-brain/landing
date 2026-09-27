import { Contact } from '@/components/sections/Contact'
import { Cases } from '@/components/sections/Cases'
import { Hero } from '@/components/sections/Hero'
import { Results } from '@/components/sections/Results'
import { Services } from '@/components/sections/Services'
import { Strengths } from '@/components/sections/Strengths'
import { Masthead } from '@/components/primitives/Masthead'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Перейти к содержанию
      </a>

      <Masthead />

      <main id="main">
        <Hero />
        <Services />
        <Results />
        <Strengths />
        <Cases />
      </main>

      <Contact />
    </>
  )
}
