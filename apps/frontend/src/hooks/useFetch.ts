import { useState, useEffect, useCallback, useRef } from 'react'

export function useFetch<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
): [T | null, boolean, string | null, () => void] {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fnRef = useRef(fn)
  fnRef.current = fn

  const run = useCallback(() => {
    setLoading(true)
    setError(null)
    fnRef.current()
      .then((result) => { setData(result); setLoading(false) })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { run() }, [run])

  return [data, loading, error, run]
}
