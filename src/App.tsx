import { useEffect, useState } from "react"
import FormSection from "./components/core/FormSection"
import GridSection from "./components/core/GridSection"

export const App = () => {
  const initPolygon = "POLYGON ((-57.480469 29.916852, -60.029297 24.846565, -55.349121 23.604262, -52.998047 26.68673, -54.294434 29.094577, -55.898438 30.088108, -57.480469 29.916852))"
  const [wktData, setWktData] = useState(initPolygon)

  const handleReset = () => {
    setWktData(initPolygon)
    console.log("Form reset")
  }

  useEffect(() => {
    console.log("WKT Data updated:", wktData)
  }, [wktData])
  
  return (<div className="flex flex-col items-center h-screen">
    <h1 className="text-4xl font-bold my-4">Welcome to WKT Spatial Editor</h1>
    <GridSection polygonString={wktData} onPolygonChange={setWktData} />
    <FormSection wktData={wktData} setWktData={setWktData} handleReset={handleReset} />
  </div>
  )
}

export default App
