'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type Direction = 'up' | 'left' | 'right' | 'scale'

type SonicRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  direction?: Direction
}

export default function SonicReveal({ children, className, delay = 0, direction = 'up' }: SonicRevealProps) {
  const reduceMotion = useReducedMotion()
  const offset = {
    up: { x: 0, y: 28 },
    left: { x: -28, y: 0 },
    right: { x: 28, y: 0 },
    scale: { x: 0, y: 0, scale: 0.96 },
  }[direction]

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, ...offset }}
      whileInView={reduceMotion ? undefined : { opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={reduceMotion ? undefined : { duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
