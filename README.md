# 🧪 Leather Defect Detection System (YOLOv8 + Flask + ESP32)

An AI-powered system for real-time leather defect detection using computer vision and deep learning. This project identifies common defects like cuts, stains, and folds from images or live camera feed using the YOLOv8 object detection model.

## 🚀 Features

- 🔍 Detects leather defects: `cut`, `fold`, `stain`
- 📷 Supports real-time streaming via ESP32 Cam
- 🧠 Trained with YOLOv8s and YOLOv8m on 3000+ images
- 📊 Achieved 90%+ accuracy on validation set
- 🌐 Flask web interface with image upload and live preview
- 📟 Sends defect results to ESP32 to trigger LED/Buzzer
- 🔁 Uses data augmentation for small dataset enhancement

---

## 🛠️ Tech Stack

| Component         | Technology             |
|------------------|------------------------|
| Model Training    | YOLOv8 (Ultralytics)   |
| Backend Server    | Flask (Python)         |
| Real-time Vision  | OpenCV + ESP32         |
| Visualization     | React (optional UI)    |
| Microcontroller   | ESP32-CAM              |
| Communication     | HTTP via Flask ↔ ESP32 |

---

## 📁 Dataset

- 3,077 images labeled with bounding boxes (YOLOv8 format)
- Classes: `cut`, `fold`, `stain`
- Source: Roboflow
- Preprocessing:
  - Auto-orientation
  - Resized to 1024x1024
  - Data Augmentation (flip, brightness, exposure, noise)

---

## 📊 Training Summary

- Input size: `640x640`
- Epochs: 70 (best at 29)
- Optimizer: AdamW
- Batch size: 16
- Model size: YOLOv8m
- Validation mAP@0.5:  
  - `cut`: 79.9%  
  - `fold`: 87%  
  - `stain`: 89%  
  - Overall: 90%+

---

## 📦 Installation

```bash
git clone https://github.com/klonex00/leather_defect_detection.git
cd leather_defect_detection
pip install -r requirements.txt
