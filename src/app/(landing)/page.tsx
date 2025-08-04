"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"
import { MeshGradient } from "@paper-design/shaders-react"
import { Github } from "lucide-react"
import clsx from "clsx"

type State = "idle" | "loading" | "success" | "error"

export default function Home() {
  const [state, setState] = useState<State>("idle")
  const [error, setError] = useState<string>()
  const [value, setValue] = useState("")
  const errorTimeout = useRef<NodeJS.Timeout | null>(null)

  // Auto-reset success state
  useEffect(() => {
    if (state === "success") {
      const resetTimeout = setTimeout(() => {
        setState("idle")
      }, 2000)
      return () => clearTimeout(resetTimeout)
    }
  }, [state])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formEl = e.currentTarget
    if (state === "success" || state === "loading") return

    if (errorTimeout.current) {
      clearTimeout(errorTimeout.current)
      setError(undefined)
      setState("idle")
    }

    try {
      setState("loading")
      const formData = new FormData(formEl)
      const email = formData.get("email") as string

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Basic email validation
      if (!email || !email.includes("@")) {
        setState("error")
        setError("Please enter a valid email address")
        errorTimeout.current = setTimeout(() => {
          setError(undefined)
          setState("idle")
        }, 3000)
        return
      }

      // Simulate successful submission
      console.log("Email submitted:", email)
      setState("success")
      formEl.reset()
      setValue("")
    } catch (error) {
      setState("error")
      setError("There was an error while submitting the form")
      console.error(error)
      errorTimeout.current = setTimeout(() => {
        setError(undefined)
        setState("idle")
      }, 3000)
    }
  }

  const isSubmitted = state === "success"
  const inputDisabled = state === "loading"

  return (
    <div className="antialiased max-w-screen min-h-svh bg-slate-1 text-slate-12">
      {/* Background Gradient */}
      <MeshGradient
        colors={["#001c80", "#1ac7ff", "#04ffb1", "#ff1ff1"]}
        speed={0.25}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* Main Content */}
      <div className="max-w-screen-sm mx-auto w-full relative z-[1] flex flex-col min-h-screen">
          <div className="px-5 gap-8 flex flex-col flex-1 py-[12vh]">
            <main className="flex justify-center">
              <div
                className={clsx(
                  "w-full mx-auto max-w-[500px] flex flex-col justify-center items-center bg-gray-1/85 pb-8 overflow-hidden rounded-2xl",
                  "shadow-[0px_170px_48px_0px_rgba(18,_18,_19,_0.00),_0px_109px_44px_0px_rgba(18,_18,_19,_0.01),_0px_61px_37px_0px_rgba(18,_18,_19,_0.05),_0px_27px_27px_0px_rgba(18,_18,_19,_0.09),_0px_7px_15px_0px_rgba(18,_18,_19,_0.10)]",
                )}
              >
                <div className="flex flex-col items-center gap-4 flex-1 text-center w-full p-8">
                  <div className="flex flex-col gap-10">
                    <div className="flex  justify-center items-center gap-4">
                      <h2 className="text-black text-2xl font-KeplerStd">2ALabs</h2>
                      <a
                        href="https://github.com/Alkush-Pipania/2alabs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-black p-2 bg-gray-12/10 hover:bg-gray-12/20 text-gray-12 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                        aria-label="View 2ALabs on GitHub"
                      >
                        <Github className="w-4 h-4" />
                        
                      </a>
                    </div>
                    {/* Heading */}
                    <div className="space-y-1">
                      <h1 className="text-2xl sm:text-3xl font-medium text-slate-12 whitespace-pre-wrap text-pretty">
                        AI Meeting CoPilot
                      </h1>
                      <div className="text-slate-10 [&>p]:tracking-tight text-pretty">
                        <p>
                        Join every meeting with team of AI experts. No more pre-meeting stress, in-meeting anxiety or post-meeting regrets.
                        Drop all your docs, ideas & notes into JarWiz—get in-meeting instant answers, citations, and arguments.
                        1-click, context-aware agents working in background—no need to type queries or interrupt your flow.
                        </p>
                      </div>
                    </div>

                    {/* Form */}
                    <div className="px-1 flex flex-col w-full self-stretch">
                      <form className="flex flex-col gap-2 w-full relative" onSubmit={handleSubmit}>
                        <div className="flex items-center justify-between gap-3 relative">
                          <input
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                            value={value}
                            className={clsx(
                              "flex-1 text-sm pl-4 pr-28 py-2 h-11 bg-gray-11/5 cursor-text rounded-full text-gray-12 placeholder:text-gray-9 border border-gray-11/10",
                            )}
                            disabled={inputDisabled}
                            onChange={(e) => setValue(e.target.value)}
                            autoComplete="off"
                            data-1p-ignore
                            data-lpignore
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={inputDisabled}
                            className={clsx(
                              "absolute h-8 px-3.5 bg-gray-12 text-gray-1 text-sm top-1/2 transform -translate-y-1/2 right-1.5 rounded-full font-medium flex gap-1 items-center",
                              "disabled:cursor-not-allowed",
                              {
                                "bg-gray-12 text-gray-2": state === "loading",
                              },
                              inputDisabled && "cursor-not-allowed bg",
                            )}
                          >
                            {state === "loading" ? (
                              <>
                                Joining...
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full border border-[currentColor] !border-t-[transparent] animate-spin" />
                                </div>
                              </>
                            ) : isSubmitted ? (
                              "Welcome!"
                            ) : (
                              "Join Waitlist"
                            )}
                          </button>
                        </div>
                        <div className="w-full h-2" />
                        {error && (
                          <p className="absolute text-xs text-[#ff0000] top-full -translate-y-1/2 px-2">{error}</p>
                        )}
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
      </div>
    </div>
  )
}
