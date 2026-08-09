'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { SONIC_MOTION, SONIC_REVEAL_EASE } from './sonic-motion'

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
    up: { x: 0, y: SONIC_MOTION.revealDistance },
    left: { x: -SONIC_MOTION.revealDistance, y: 0 },
    right: { x: SONIC_MOTION.revealDistance, y: 0 },
    scale: { x: 0, y: 0, scale: 0.96 },
  }[direction]

  return (
    <motion.div
      className={['sonic-reveal', className].filter(Boolean).join(' ')}
      initial={reduceMotion ? false : { opacity: 0, ...offset }}
      whileInView={reduceMotion ? undefined : { opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: SONIC_MOTION.revealViewportAmount }}
      transition={reduceMotion ? undefined : { duration: SONIC_MOTION.reveal, delay, ease: SONIC_REVEAL_EASE }}
    >
      {children}
    </motion.div>
  )
}
