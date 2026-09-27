import { renderToStaticMarkup } from 'react-dom/server'
import App from '@/App'

/**
 * Pre-render target: the app markup only, no document wrapper. postbuild.mjs
 * injects this into the Vite-built index.html, so the shipped page contains
 * every word in the initial HTML while the client still hydrates normally.
 *
 * Rendered with renderToStaticMarkup on purpose: the components hold no
 * useId() and no Suspense, so the markup is byte-identical to what the client's
 * first render produces and hydration stays silent.
 */
export function render(): string {
  return renderToStaticMarkup(<App />)
}
