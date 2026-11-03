'use client'

import { useRef, useState } from 'react'

import { Caption, Controls, DemoButton, Slider } from '@/components/islands/demo-kit/controls'
import { playSound } from '@/components/islands/sounds'

import { buildSystemCss, getTypeSystem } from './calculator'
import styles from './demos.module.css'
import {
  BROWSER_DEFAULT,
  buildClamp,
  buildScaleCss,
  formatPx,
  getFluidSize,
  getGoldenLineHeight,
  getGoldenWidth,
  getScale,
  RATIOS,
  round,
  toRem,
  type Fluid,
  type Ratio,
} from './scale'

/** What the type scale demo says about a scale. */
export function describeScale(base: number, ratio: Ratio): string {
  const h1 = base * ratio.value ** 3
  return `${ratio.name} (${round(ratio.value)}) on a ${base}px body: h1 is ${formatPx(h1)}, ${round(h1 / base, 1)} times the body.`
}

/** A body size and a ratio, rendered h1 through small print, with the CSS to copy. */
export function ScaleDemo() {
  const [base, setBase] = useState(BROWSER_DEFAULT)
  const [ratio, setRatio] = useState<Ratio>(RATIOS[0])
  function choose(next: Ratio) {
    playSound('select')
    setRatio(next)
  }
  return (
    <>
      <div className={styles.preview}>
        {getScale(base, ratio.value).map((level) => (
          <div className={styles.level} key={level.name}>
            <span className={styles.size}>{`${level.name} ${formatPx(level.px)}`}</span>
            <p className={styles.sample} style={{ fontSize: `${level.px}px` }}>
              {level.sample}
            </p>
          </div>
        ))}
      </div>
      <Controls label="Ratio">
        {RATIOS.map((option) => (
          <DemoButton
            aria-pressed={option.id === ratio.id}
            key={option.id}
            onClick={() => choose(option)}
            variant="secondary"
          >
            {option.name}
          </DemoButton>
        ))}
      </Controls>
      <Controls>
        <Slider label="Body size" max={24} min={12} onChange={setBase} value={base} />
      </Controls>
      <Caption>{describeScale(base, ratio)}</Caption>
      <pre className={styles.code}>
        <code>{buildScaleCss(base, ratio.value)}</code>
      </pre>
    </>
  )
}

/** What the line height demo says about a font size and a line width. */
export function describeLineHeight(fontSize: number, width: number): string {
  const lineHeight = getGoldenLineHeight(fontSize, width)
  return `Line height ${formatPx(lineHeight)} (${round(lineHeight / fontSize)} unitless). The golden width for ${fontSize}px type is ${formatPx(getGoldenWidth(fontSize))}.`
}

const PARAGRAPH =
  'Your eye jumps from the end of one line back to the start of the next. The longer the line, the farther it travels, and the more room it needs between lines to land on the right one. Too much room, and the paragraph falls apart into stripes.'

/** A paragraph whose line height follows the golden ratio formula as the size and width change. */
export function LineHeightDemo() {
  const [fontSize, setFontSize] = useState(BROWSER_DEFAULT)
  const [width, setWidth] = useState(600)
  const lineHeight = getGoldenLineHeight(fontSize, width)
  return (
    <>
      <p
        className={styles.paragraph}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${lineHeight}px`,
          maxWidth: `min(100%, ${width}px)`,
        }}
      >
        {PARAGRAPH}
      </p>
      <Controls>
        <Slider label="Font size" max={24} min={12} onChange={setFontSize} value={fontSize} />
        <Slider label="Line width" max={800} min={300} onChange={setWidth} value={width} />
      </Controls>
      <Caption>{describeLineHeight(fontSize, width)}</Caption>
    </>
  )
}

/** The calculator's headline numbers for a font size and a line width. */
export function getResults(fontSize: number, width: number) {
  const system = getTypeSystem(fontSize, width)
  return [
    {
      label: 'Line height',
      value: `${formatPx(system.lineHeight)} (${round(system.lineHeight / fontSize)})`,
    },
    { label: `Best width for ${fontSize}px`, value: formatPx(system.goldenWidth) },
    { label: `Best size for ${width}px`, value: formatPx(system.goldenSize) },
    {
      label: `Width for a ${system.wholeLineHeight}px line height`,
      value: formatPx(system.tunedWidth),
    },
  ]
}

const TYPEFACES = [
  { id: 'sans', name: 'Sans' },
  { id: 'serif', name: 'Serif' },
] as const

type Typeface = (typeof TYPEFACES)[number]['id']

/** What the preview sets at each level, in order. */
const SAMPLE = [
  { level: 'h1', text: 'Golden ratio typography' },
  {
    level: 'body',
    text: 'Every paragraph has three dimensions: font size, line height, and line width. Change one, and the other two have to move with it.',
  },
  { level: 'h2', text: 'Wider lines need more room' },
  {
    level: 'body',
    text: 'Your eye sweeps back to the start of each line. The longer the trip, the more space it needs to land on the right one.',
  },
  { level: 'h3', text: 'Headings get their own' },
  { level: 'small', text: 'Small print gets one too.' },
] as const

const COPIED_FOR = 2000

/**
 * A golden ratio typography calculator. A body font size and a line width go
 * in; out come the line height, the best width and size for each other, a
 * heading scale with its own line heights, spacing, a preview, and the CSS.
 */
export function CalculatorDemo() {
  const [fontSize, setFontSize] = useState(BROWSER_DEFAULT)
  const [width, setWidth] = useState(680)
  const [typeface, setTypeface] = useState<Typeface>('sans')
  const [status, setStatus] = useState('')
  const reset = useRef<ReturnType<typeof setTimeout>>(undefined)
  const system = getTypeSystem(fontSize, width)
  const css = buildSystemCss(fontSize, width)
  const levels = new Map(system.levels.map((level) => [level.name, level]))
  const space = new Map(system.spacing.map((step) => [step.name, step.px]))
  function choose(next: Typeface) {
    playSound('select')
    setTypeface(next)
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(css)
      playSound('copy')
      setStatus('Copied')
    } catch {
      setStatus("Couldn't copy")
    }
    clearTimeout(reset.current)
    reset.current = setTimeout(() => setStatus(''), COPIED_FOR)
  }
  return (
    <>
      <Controls>
        <Slider label="Font size" max={32} min={10} onChange={setFontSize} value={fontSize} />
        <Slider label="Line width" max={1200} min={300} onChange={setWidth} value={width} />
      </Controls>
      <dl className={styles.results}>
        {getResults(fontSize, width).map((result) => (
          <div className={styles.result} key={result.label}>
            <dt className={styles.size}>{result.label}</dt>
            <dd className={styles.answer}>{result.value}</dd>
          </div>
        ))}
      </dl>
      <div
        className={styles.sheet}
        data-typeface={typeface}
        style={{ maxWidth: `min(100%, calc(${width}px + 2 * var(--space-5) + 2px))` }}
      >
        {SAMPLE.map(({ level, text }, i) => {
          const style = levels.get(level)!
          const heading = level.startsWith('h')
          const before = i === 0 ? 0 : heading ? space.get('l')! : 0
          const after = i === SAMPLE.length - 1 ? 0 : heading ? space.get('s')! : space.get('m')!
          return (
            <p
              className={heading ? styles.sheetHeading : undefined}
              key={text}
              style={{
                fontSize: `${style.px}px`,
                lineHeight: `${style.lineHeight}px`,
                marginBlock: `${before}px ${after}px`,
              }}
            >
              {text}
            </p>
          )
        })}
      </div>
      <Controls label="Preview">
        {TYPEFACES.map((option) => (
          <DemoButton
            aria-pressed={option.id === typeface}
            key={option.id}
            onClick={() => choose(option.id)}
            variant="secondary"
          >
            {option.name}
          </DemoButton>
        ))}
      </Controls>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Style</th>
            <th scope="col">Size</th>
            <th scope="col">Line height</th>
          </tr>
        </thead>
        <tbody>
          {system.levels.map((level) => (
            <tr key={level.name}>
              <td>{level.name}</td>
              <td>
                <code>{toRem(level.px)}</code> {formatPx(level.px)}
              </td>
              <td>
                <code>{round(level.lineHeight / level.px)}</code> {formatPx(level.lineHeight)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.spacing}>
        {system.spacing.map((step) => (
          <div className={styles.space} key={step.name}>
            <span className={styles.size}>{`space-${step.name} ${formatPx(step.px)}`}</span>
            <span className={styles.bar} style={{ width: `${step.px}px` }} />
          </div>
        ))}
      </div>
      <pre className={styles.code}>
        <code>{css}</code>
      </pre>
      <Controls>
        <DemoButton onClick={copy}>{status || 'Copy CSS'}</DemoButton>
      </Controls>
    </>
  )
}

/** The rem values the converter lists. */
export const REM_VALUES = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3] as const

/** What the converter says about a root size, with the `html` rule that sets it. */
export function describeRoot(root: number): string {
  const rule = `html { font-size: ${round((root / BROWSER_DEFAULT) * 100, 2)}% }`
  if (root === BROWSER_DEFAULT)
    return `${rule} is the browser default, so 1rem is 16px and nothing needs dividing by hand.`
  if (root === 10)
    return `${rule} makes 1rem 10px, so the math is easy. Now every rem in a library or embed you didn't write renders at 62.5% of the size its author meant.`
  return `${rule} makes 1rem ${root}px.`
}

/** A root font size slider and the px each rem value works out to. */
export function RemDemo() {
  const [root, setRoot] = useState(BROWSER_DEFAULT)
  function preset(next: number) {
    playSound('select')
    setRoot(next)
  }
  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">rem</th>
            <th scope="col">px at a {root}px root</th>
          </tr>
        </thead>
        <tbody>
          {REM_VALUES.map((rem) => (
            <tr key={rem}>
              <td>
                <code>{rem}rem</code>
              </td>
              <td>{formatPx(rem * root)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Controls label="Root">
        <DemoButton
          aria-pressed={root === BROWSER_DEFAULT}
          onClick={() => preset(BROWSER_DEFAULT)}
          variant="secondary"
        >
          16px default
        </DemoButton>
        <DemoButton aria-pressed={root === 10} onClick={() => preset(10)} variant="secondary">
          62.5%
        </DemoButton>
      </Controls>
      <Controls>
        <Slider label="Root size" max={24} min={8} onChange={setRoot} value={root} />
      </Controls>
      <Caption>{describeRoot(root)}</Caption>
    </>
  )
}

/** The fluid h1: 2rem on a 320px phone, up to 3.5rem on a 1440px desktop. */
export const FLUID_H1: Fluid = { min: 32, max: 56, from: 320, to: 1440 }

const HEADLINE = 'Golden ratio typography'

/** What the fluid type demo says about a screen width. */
export function describeFluid(screen: number): string {
  return `On a ${screen}px screen, the fixed headline is ${formatPx(FLUID_H1.max)} and the fluid one is ${formatPx(getFluidSize(FLUID_H1, screen))}.`
}

/** A column that narrows like a screen, with a fixed headline beside a `clamp()` one. */
export function FluidDemo() {
  const [screen, setScreen] = useState(390)
  return (
    <>
      <div className={styles.column} style={{ maxWidth: `min(100%, ${screen}px)` }}>
        <span className={styles.size}>Fixed 3.5rem</span>
        <p className={styles.headline} style={{ fontSize: `${FLUID_H1.max}px` }}>
          {HEADLINE}
        </p>
        <span className={styles.size}>Fluid clamp()</span>
        <p className={styles.headline} style={{ fontSize: `${getFluidSize(FLUID_H1, screen)}px` }}>
          {HEADLINE}
        </p>
      </div>
      <Controls>
        <Slider label="Screen width" max={1440} min={320} onChange={setScreen} value={screen} />
      </Controls>
      <Caption>{describeFluid(screen)}</Caption>
      <pre className={styles.code}>
        <code>{`h1 {\n  font-size: ${buildClamp(FLUID_H1)};\n}`}</code>
      </pre>
    </>
  )
}
