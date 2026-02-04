"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Upload, Play, Square, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LeatherCube } from "@/components/leather-cube"
import { GlassCard } from "@/components/glass-card"

// ✅ Change only this one line to update IP
const BACKEND_URL = "http://172.20.10.5:9001"

export default function HomePage() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [lastPrediction, setLastPrediction] = useState<{
    status: "defective" | "non-defective" | null
    timestamp: string
  }>({ status: null, timestamp: "" })

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isDetecting) {
      fetch(`${BACKEND_URL}/stream/start`, { method: "POST" })

      interval = setInterval(async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/get_latest`)
          const data = await res.json()
          const status = data.pred === "Non-Defective" ? "non-defective" : "defective"
          setLastPrediction({
            status,
            timestamp: new Date().toLocaleTimeString(),
          })
        } catch (error) {
          console.error("Error fetching prediction:", error)
        }
      }, 5000)
    } else {
      fetch(`${BACKEND_URL}/stream/stop`, { method: "POST" })
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isDetecting])

  const toggleDetection = () => {
    setIsDetecting(!isDetecting)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-4 font-mono tracking-wider">
            LEATHER DEFECT
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-mono tracking-wider">
            DETECTION AI
          </h2>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
            <span className="text-gray-400 font-mono text-sm tracking-widest">PRECISION QUALITY CONTROL</span>
            <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          <div className="flex justify-center">
            <LeatherCube />
          </div>

          <div className="space-y-6">
            <GlassCard className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6 font-mono tracking-wide">CONTROL PANEL</h3>

              <div className="grid gap-4">
                <Link href="/upload">
                  <Button className="w-full h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border border-blue-400/30 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-105 group">
                    <Upload className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                    <span className="text-lg font-mono tracking-wide">UPLOAD IMAGE</span>
                  </Button>
                </Link>

                <Button
                  onClick={toggleDetection}
                  className={`w-full h-16 border shadow-lg transition-all duration-300 hover:scale-105 group ${
                    isDetecting
                      ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-red-400/30 shadow-red-500/25 hover:shadow-red-500/40"
                      : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 border-green-400/30 shadow-green-500/25 hover:shadow-green-500/40"
                  }`}
                >
                  {isDetecting ? (
                    <>
                      <Square className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                      <span className="text-lg font-mono tracking-wide">STOP DETECTION</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                      <span className="text-lg font-mono tracking-wide">START DETECTION</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-8 p-4 rounded-lg bg-black/20 border border-gray-700/30">
                <h4 className="text-sm font-mono text-gray-400 mb-3 tracking-widest">SYSTEM STATUS</h4>

                {isDetecting && (
                  <div className="mb-4">
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30 animate-pulse">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-ping"></div>
                      DETECTING...
                    </Badge>
                  </div>
                )}

                {lastPrediction.status && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-500 tracking-widest">LAST PREDICTION:</span>
                      <span className="text-xs font-mono text-gray-500">{lastPrediction.timestamp}</span>
                    </div>

                    {lastPrediction.status === "non-defective" ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30 shadow-lg shadow-green-500/20 animate-fade-in">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        NON-DEFECTIVE
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-400/30 shadow-lg shadow-red-500/20 animate-fade-in animate-pulse">
                        <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-ping"></div>
                        DEFECTIVE
                      </Badge>
                    )}
                  </div>
                )}

                {!lastPrediction.status && !isDetecting && (
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-400/30">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    STANDBY
                  </Badge>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}