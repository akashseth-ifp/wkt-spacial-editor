import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"

type FormSectionProps = {
  wktData: string
  setWktData: (data: string) => void
  handleReset: () => void
}

export const FormSection = ({ wktData, setWktData, handleReset }: FormSectionProps) => {
  return (
    <div className="space-y-4 w-full max-w-md p-4">
      <Textarea className="w-full h-32 p-2 border border-gray-300 rounded" placeholder="Enter WKT data here..." value={wktData} onChange={(e) => setWktData(e.target.value)} />
      <Button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleReset}>
        Reset
      </Button>
    </div>
  )
}

export default FormSection