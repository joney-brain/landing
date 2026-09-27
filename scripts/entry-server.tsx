import { renderToStaticMarkup } from 'react-dom/server'
import App from '@/App'

export function render(): string {
  return `<!doctype html>\n<html lang="ru">${renderToStaticMarkup(<App />)}</html>`
}
