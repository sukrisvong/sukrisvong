import { useCallback, useEffect, useRef, useState } from "react"
import type { Step } from "../types"

export type PlaybackState = {
  stepIndex: number
  playing: boolean
  speed: number
  currentArray: number[]
  activeIndices: [number, number] | null
  activeType: "compare" | "swap" | null
  totalSteps: number
  done: boolean
}

export function usePlayback(initial: number[], steps: Step[]) {
  const [stepIndex, setStepIndex] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(300)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalSteps = steps.length

  const currentArray = stepIndex < 0 || stepIndex >= steps.length ? initial : steps[stepIndex].array
  const safeStep = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : null
  const activeIndices = safeStep ? safeStep.indices as [number, number] : null
  const activeType = safeStep ? safeStep.type : null
  const done = stepIndex >= totalSteps - 1

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const play = useCallback(() => setPlaying(true), [])
  const pause = useCallback(() => setPlaying(false), [])

  const stepForward = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, totalSteps - 1))
  }, [totalSteps])

  const stepBack = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, -1))
  }, [])

  const reset = useCallback(() => {
    setPlaying(false)
    setStepIndex(-1)
  }, [])

  const jumpToEnd = useCallback(() => {
    setPlaying(false)
    setStepIndex(totalSteps - 1)
  }, [totalSteps])

  useEffect(() => {
    if (!playing) {
      stopInterval()
      return
    }
    if (done) {
      setPlaying(false)
      return
    }
    intervalRef.current = setInterval(() => {
      setStepIndex((i) => {
        const next = i + 1
        if (next >= totalSteps - 1) setPlaying(false)
        return Math.min(next, totalSteps - 1)
      })
    }, speed)
    return stopInterval
  }, [playing, speed, totalSteps, done, stopInterval])

  useEffect(() => {
    setStepIndex(-1)
    setPlaying(false)
  }, [steps])

  return {
    stepIndex,
    playing,
    speed,
    setSpeed,
    currentArray,
    activeIndices,
    activeType,
    totalSteps,
    done,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    jumpToEnd,
  }
}
