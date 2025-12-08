"use client"

import { useEffect } from "react"

export function ScrollActivity() {
  useEffect(() => {
    let t: number | undefined
    const onScroll = () => {
      document.documentElement.classList.add("scrolling")
      if (t) window.clearTimeout(t)
      t = window.setTimeout(() => {
        document.documentElement.classList.remove("scrolling")
      }, 600)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("wheel", onScroll, { passive: true })
    window.addEventListener("touchmove", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("wheel", onScroll)
      window.removeEventListener("touchmove", onScroll)
    }
  }, [])
  return null
}

