"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface GSAPRevealProps {
  children: React.ReactNode
  direction?: "up" | "down" | "left" | "right"
  delay?: number
  duration?: number
}

export function GSAPReveal({ children, direction = "up", delay = 0, duration = 0.8 }: GSAPRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const x = direction === "left" ? -50 : direction === "right" ? 50 : 0
    const y = direction === "up" ? 50 : direction === "down" ? -50 : 0

    gsap.fromTo(
      element,
      {
        opacity: 0,
        x,
        y,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        delay,
        duration,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      },
    )
  }, [direction, delay, duration])

  return <div ref={elementRef}>{children}</div>
}
