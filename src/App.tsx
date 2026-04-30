import { useEffect, useState } from "react"
import FormSection from "./components/core/FormSection"
import GridSection from "./components/core/GridSection"

export const App = () => {
  const [wktData, setWktData] = useState("")

  const handleReset = () => {
    setWktData("")
    console.log("Form reset")
  }

  useEffect(() => {
    console.log("WKT Data updated:", wktData)
  }, [wktData])
  
  return (<div className="flex flex-col items-center h-screen">
    <h1 className="text-4xl font-bold my-4">Welcome to WKT Spatial Editor</h1>
    <GridSection />
    <FormSection wktData={wktData} setWktData={setWktData} handleReset={handleReset} />
  </div>
  )
}

export default App