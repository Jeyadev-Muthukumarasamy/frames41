import { useState, useEffect, useCallback, useRef } from 'react'

export function useFetch<T>(
  fn: () => Promise<T>,
  _deps: unknown[] = [],
): [T | null, boolean, string | null, () => void] {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fnRef = useRef(fn)
  // Always keep fnRef in sync with the latest fn without triggering re-renders
  useEffect(() => {
    fnRef.current = fn
  })

  const run = useCallback(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fnRef.current()
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Something went wrong')
          setLoading(false)
        }
      })

    // Return the abort function so callers can cancel if needed
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const cancel = run()
    // Cancel the in-flight request when the component unmounts or run changes
    return cancel
  }, [run])

  return [data, loading, error, run]
}
