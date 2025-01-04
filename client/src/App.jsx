import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FileUpload from './FileUpload'
import Stepper from './components/Stepper'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    {/* <FileUpload/> */}
    <Stepper/>
    </>
  )
}

export default App
