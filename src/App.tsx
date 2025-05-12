import MandalaContainer from "./components/mandala/MandalaContainer";
import {Button} from "@/components/ui/button.tsx";
import {Check, Plus, Trash} from "lucide-react";

function App() {
  return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full">
          <MandalaContainer/>

          <div className="flex flex-col gap-2 items-center justify-center min-h-screen w-full">
              <Button variant="filled" color="primary">Primary</Button>
              <Button variant="outline" color="secondary">Secondary Outline</Button>
              <Button variant="text" color="tertiary">Tertiary Text</Button>
              <Button variant="ghost" color="ghost">Ghost</Button>
              <Button variant="filled" color="danger" icon={<Trash/>}>Eliminar</Button>
              <Button variant="filled" color="primary" loading>Guardando...</Button>
              <Button variant="outline" color="primary" disabled>Desactivado</Button>
              <Button variant="filled" color="secondary" icon={<Plus/>} iconPosition="left">Agregar</Button>
              <Button variant="filled" color="secondary" icon={<Check/>} iconPosition="right">Listo</Button>
              <Button variant="filled" color="tertiary" icon={<Plus/>}/>
          </div>
      </div>
  );
}

export default App;
