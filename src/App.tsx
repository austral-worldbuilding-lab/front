import { TooltipProvider } from "./components/ui/tooltip";
import MandalaContainer from "./components/mandala/Container";
function App() {
  return (
    <TooltipProvider>
      <div className="flex flex-col items-center justify-center min-h-screen w-full">
        <MandalaContainer />
      </div>
    </TooltipProvider>
  );
}

export default App;
