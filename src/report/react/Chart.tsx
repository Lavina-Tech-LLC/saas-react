import { useMemo } from 'react'
import { ShadowHost } from '../../react/ShadowHost'
import { useSaaSContext } from '../../react/context'
import type { Appearance } from '../../core/types'

export interface ChartProps {
  type: 'bar' | 'line' | 'pie'
  data: { labels: string[]; values: number[] }
  title?: string
  width?: number
  height?: number
  appearance?: Appearance
}

function generateColors(count: number, base = '#6366f1'): string[] {
  const hue = parseInt(base.replace('#', '').slice(0, 2), 16)
  const colors: string[] = []
  for (let i = 0; i < count; i++) {
    const h = (hue + i * Math.floor(360 / Math.max(count, 1))) % 360
    colors.push(`hsl(${h}, 65%, 55%)`)
  }
  return colors
}

function BarChart({ labels, values, w, h, colors }: { labels: string[]; values: number[]; w: number; h: number; colors: string[] }) {
  const max = Math.max(...values, 1)
  const pad = 40
  const chartW = w - pad * 2
  const chartH = h - pad * 2
  const barW = Math.max(1, chartW / labels.length - 4)

  return (
    <g>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#ccc" strokeWidth={1} />
      {values.map((v, i) => {
        const barH = (v / max) * chartH
        const x = pad + (chartW / labels.length) * i + 2
        const y = h - pad - barH
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={colors[i % colors.length]} rx={2} />
            <text x={x + barW / 2} y={h - pad + 14} textAnchor="middle" fontSize={10} fill="#666">
              {labels[i].length > 8 ? labels[i].slice(0, 8) + '...' : labels[i]}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function LineChart({ labels, values, w, h, colors }: { labels: string[]; values: number[]; w: number; h: number; colors: string[] }) {
  const max = Math.max(...values, 1)
  const pad = 40
  const chartW = w - pad * 2
  const chartH = h - pad * 2
  const step = labels.length > 1 ? chartW / (labels.length - 1) : 0

  const points = values.map((v, i) => {
    const x = pad + step * i
    const y = h - pad - (v / max) * chartH
    return `${x},${y}`
  })

  return (
    <g>
      {[0.25, 0.5, 0.75, 1].map((f) => {
        const y = h - pad - f * chartH
        return <line key={f} x1={pad} y1={y} x2={w - pad} y2={y} stroke="#eee" strokeWidth={1} />
      })}
      <polyline points={points.join(' ')} fill="none" stroke={colors[0]} strokeWidth={2} />
      {values.map((v, i) => {
        const x = pad + step * i
        const y = h - pad - (v / max) * chartH
        return <circle key={i} cx={x} cy={y} r={4} fill={colors[0]} />
      })}
    </g>
  )
}

function PieChart({ labels, values, w, h, colors }: { labels: string[]; values: number[]; w: number; h: number; colors: string[] }) {
  const total = values.reduce((s, v) => s + v, 0) || 1
  const cx = w / 2
  const cy = h / 2 - 20
  const r = Math.min(w, h) / 2 - 40
  const circ = 2 * Math.PI * r

  let offset = 0
  const segments = values.map((v, i) => {
    const pct = v / total
    const dash = pct * circ
    const seg = { dash, offset, color: colors[i % colors.length], label: labels[i], pct }
    offset += dash
    return seg
  })

  return (
    <g>
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={seg.color}
          strokeWidth={r * 0.6}
          strokeDasharray={`${seg.dash} ${circ - seg.dash}`}
          strokeDashoffset={-seg.offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      ))}
      <g transform={`translate(${cx - labels.length * 30}, ${h - 20})`}>
        {segments.slice(0, 6).map((seg, i) => (
          <g key={i} transform={`translate(${i * 60}, 0)`}>
            <rect width={10} height={10} fill={seg.color} rx={2} />
            <text x={14} y={9} fontSize={9} fill="#666">
              {seg.label.length > 6 ? seg.label.slice(0, 6) + '..' : seg.label}
            </text>
          </g>
        ))}
      </g>
    </g>
  )
}

export function Chart({ type, data, title, width = 400, height = 300, appearance: localAppearance }: ChartProps) {
  const { appearance: globalAppearance } = useSaaSContext()
  const appearance = localAppearance ?? globalAppearance

  const colors = useMemo(() => generateColors(data.labels.length), [data.labels.length])

  return (
    <ShadowHost appearance={appearance}>
      <div className="ss-chart-container">
        {title && <h3 className="ss-chart-title">{title}</h3>}
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: width }}>
          {type === 'bar' && <BarChart labels={data.labels} values={data.values} w={width} h={height} colors={colors} />}
          {type === 'line' && <LineChart labels={data.labels} values={data.values} w={width} h={height} colors={colors} />}
          {type === 'pie' && <PieChart labels={data.labels} values={data.values} w={width} h={height} colors={colors} />}
        </svg>
      </div>
    </ShadowHost>
  )
}
