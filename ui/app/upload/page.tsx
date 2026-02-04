"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Camera, ArrowLeft, CheckCircle, XCircle, UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/glass-card"
import Link from "next/link"

// ✅ Change only this IP to switch network/backend
const BACKEND_URL = "http://172.20.10.5:9001"

interface PredictionResult {
  isDefective: boolean
  confidence: number
}

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setIsProcessing(true)

    const formData = new FormData()
    formData.append("image", file)

    try {
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      setPrediction({
        isDefective: data.pred !== "Non-Defective",
        confidence: data.confidence || 0,
      })
    } catch (error) {
      console.error("Prediction error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent font-mono tracking-wider">
            IMAGE UPLOAD
          </h1>
          <div className="w-32"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {!uploadedImage ? (
            <GlassCard className="p-8">
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/25"
                    : "border-gray-600 hover:border-blue-400/50 hover:bg-blue-500/5"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="space-y-6">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Camera className="w-12 h-12 text-white" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 font-mono">DROP YOUR LEATHER IMAGE HERE</h3>
                    <p className="text-gray-400 font-mono text-sm tracking-wide">
                      Or click to browse files • Supports JPG, PNG, WEBP
                    </p>
                  </div>

                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border border-blue-400/30 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40">
                    <UploadIcon className="w-5 h-5 mr-2" />
                    SELECT FILE
                  </Button>
                </div>
              </div>
            </GlassCard>
          ) : (
            <div className="space-y-6">
              <GlassCard className="p-6">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 font-mono tracking-wide">UPLOADED IMAGE</h3>
                    <div className="relative rounded-lg overflow-hidden shadow-2xl">
                      <img
                        src={uploadedImage}
                        alt="Uploaded leather sample"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {isProcessing ? (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                        <div>
                          <h4 className="text-lg font-bold text-white font-mono">ANALYZING...</h4>
                          <p className="text-gray-400 text-sm font-mono">AI processing in progress</p>
                        </div>
                      </div>
                    ) : (
                      prediction && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-bold text-white font-mono tracking-wide">ANALYSIS RESULTS</h4>

                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-mono text-gray-400 tracking-widest">DEFECT TYPE:</span>
                              <p className="text-white font-mono text-lg">
                                {prediction.isDefective ? "Defective" : "Non-Defective"}
                              </p>
                            </div>

                            {/* Confidence removed — uncomment below if needed */}
                            {/*
                            <div>
                              <span className="text-sm font-mono text-gray-400 tracking-widest">CONFIDENCE:</span>
                              <p className="text-white font-mono text-lg">
                                {prediction.confidence.toFixed(1)}%
                              </p>
                            </div>
                            */}

                            <div>
                              <span className="text-sm font-mono text-gray-400 tracking-widest">CLASSIFICATION:</span>
                              <div className="mt-2">
                                {prediction.isDefective ? (
                                  <Badge className="bg-red-500/20 text-red-400 border-red-400/30 shadow-lg shadow-red-500/20 text-lg px-4 py-2 animate-pulse">
                                    <XCircle className="w-5 h-5 mr-2" />
                                    DEFECTIVE
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-500/20 text-green-400 border-green-400/30 shadow-lg shadow-green-500/20 text-lg px-4 py-2">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    NON-DEFECTIVE
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </GlassCard>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => {
                    setUploadedImage(null)
                    setPrediction(null)
                    setIsProcessing(false)
                  }}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 border border-gray-400/30"
                >
                  Upload Another
                </Button>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border border-blue-400/30">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}