import { Button } from "@/components/ui/button"

export const App = () => {
  return (<div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-gray-800">Hello, World!</h1>
      <p className="text-gray-600 mt-4">Welcome to your Vite + React + Tailwind CSS app.</p>
      <Button>Click me</Button>
    </div>
  )
}

export default App
