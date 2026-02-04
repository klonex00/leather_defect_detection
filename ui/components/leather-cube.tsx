"use client"

export function LeatherCube() {
  return (
    <div className="perspective-1000">
      <div className="leather-cube animate-rotate-3d">
        <div className="cube-face cube-front">
          <div className="leather-texture"></div>
        </div>
        <div className="cube-face cube-back">
          <div className="leather-texture"></div>
        </div>
        <div className="cube-face cube-right">
          <div className="leather-texture"></div>
        </div>
        <div className="cube-face cube-left">
          <div className="leather-texture"></div>
        </div>
        <div className="cube-face cube-top">
          <div className="leather-texture"></div>
        </div>
        <div className="cube-face cube-bottom">
          <div className="leather-texture"></div>
        </div>
      </div>
    </div>
  )
}
