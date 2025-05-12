import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Button } from "@/components/ui/button"
import {CustomInput} from "./components/ui/CustomInput";

function App() {
    const [count, setCount] = useState(0)

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full">
            <div className="flex justify-center gap-4">
                <a href="https://vite.dev" target="_blank" className="inline-block">
                    <img
                        src={viteLogo}
                        className="h-24 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_rgba(100,108,255,0.67)]"
                        alt="Vite logo"
                    />
                </a>
                <a href="https://react.dev" target="_blank" className="inline-block">
                    <img
                        src={reactLogo}
                        className="h-24 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_rgba(97,218,251,0.67)] motion-safe:animate-[spin_20s_linear_infinite]"
                        alt="React logo"
                    />
                </a>
            </div>
            <h1 className="text-5xl font-bold leading-tight mt-4">Vite + React</h1>
            <div className="p-8 text-center">
                <button
                    onClick={() => setCount((count) => count + 1)}
                    className="rounded-lg border border-transparent px-5 py-2 bg-zinc-800 text-base font-medium transition-colors hover:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:border-indigo-500"
                >
                    count is {count}
                </button>
                <p className="mt-4">
                    Edit <code className="font-mono bg-zinc-800/20 p-1 rounded">src/App.tsx</code> and save to test HMR
                </p>
                <div className="space-y-4 p-6">
                    <Button>Botón de Shadcn!</Button>

                    <CustomInput
                        label="Email"
                        type="email"
                        placeholder="tu@email.com"
                    />

                    <div className="bg-primary-500 text-foreground">
                        Probando colores: <b>bg-primary text-foreground</b>
                    </div>

                    <div className="bg-secondary-500 text-foreground">
                        Probando colores: <b>bg-secondary text-foreground</b>
                    </div>

                    <div className="bg-accent-500 text-foreground">
                        Probando colores: <b>bg-accent text-foreground</b>
                    </div>

                    <div className="bg-background text-primary-500 p-1">
                        Probando colores: <b>bg-background text-primary</b>
                    </div>

                    <div className="bg-foreground text-background p-1">
                        Probando colores: <b>bg-foreground text-background</b>
                    </div>
                </div>

            </div>
            <p className="text-zinc-400">
                Click on the Vite and React logos to learn more
            </p>
        </div>
    )
}

export default App