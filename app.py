from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from PIL import Image
from ultralytics import YOLO
import numpy as np
import cv2, io, threading, time, requests

app = Flask(__name__)
CORS(app)

# Load YOLOv8 model
model = YOLO('leather_defect_final_model.pt')

# Global state
latest = "-"
latest_confidence = 0.0
running = False
capture = None

# ESP32 IP (Optional)
ESP32_IP = 'xyz' # Replace with actual IP or leave as None'

# Prediction function
def predict(img: Image.Image):
    results = model.predict(img, imgsz=640, conf=0.25)
    boxes = results[0].boxes

    if boxes is None or len(boxes) == 0:
        return "Non-Defective", float(0.0)

    scores = boxes.conf.cpu().numpy()
    confidence = float(scores[0] * 100)
    return "Defective", confidence

# Trigger ESP32 LED
def trigger_device(status):
    try:
        color = "green" if status == "Non-Defective" else "red"
        url = f"http://{ESP32_IP}/led?status={color}"
        res = requests.get(url, timeout=2)
        print("ESP32 Trigger:", res.text)
    except Exception as e:
        print("ESP32 Error:", e)

# Streaming loop
def stream_loop():
    global running, capture, latest, latest_confidence
    while running:
        ret, frame = capture.read()
        if not ret:
            print("Camera read error.")
            time.sleep(1)
            continue
        img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        cls, confidence = predict(img)
        latest, latest_confidence = cls, confidence
        print(f"[INFO] Prediction: {cls} ({confidence:.2f}%)")
        trigger_device(cls)
        time.sleep(5)

# Routes
@app.route('/')
def home():
    return '<h1>Leather Defect Detection (YOLOv8)</h1>'

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    cls = None
    if request.method == 'POST':
        f = request.files.get('file')
        if f:
            img = Image.open(io.BytesIO(f.read()))
            cls, confidence = predict(img)
            trigger_device(cls)
    return render_template_string(
        '''<form method=post enctype=multipart/form-data>
               <input type=file name=file>
               <input type=submit value=Go>
           </form>
           {% if cls %}
           <h2>Classification: {{cls}}</h2>
           {% endif %}
           <a href="/">Back</a>''', cls=cls)

@app.route('/stream_ui')
def stream_ui():
    return render_template_string('''
        <h1>Live Stream & Prediction</h1>
        <h2 id="status">Status: Inactive</h2>
        <h2 id="pred">Prediction: -</h2>
        <button onclick="start()">Start Stream</button>
        <button onclick="stop()">Stop Stream</button>
        <script>
          function start(){
            fetch('/stream/start', {method: 'POST'});
            document.getElementById('status').innerText = 'Status: Active';
          }
          function stop(){
            fetch('/stream/stop', {method: 'POST'});
            document.getElementById('status').innerText = 'Status: Inactive';
          }
          setInterval(() => {
            fetch('/get_latest')
              .then(r => r.json())
              .then(d => {
                document.getElementById('pred').innerText = 'Prediction: ' + d.pred + ' (' + d.confidence + '%)';
              });
          }, 1000);
        </script>
        <a href="/">Back</a>
    ''')

@app.route('/stream/start', methods=['POST'])
def stream_start():
    global running, capture
    if not running:
        capture = cv2.VideoCapture(0)
        if not capture.isOpened():
            return "Camera not found", 500
        running = True
        threading.Thread(target=stream_loop, daemon=True).start()
    return "Started"

@app.route('/stream/stop', methods=['POST'])
def stream_stop():
    global running, capture
    running = False
    if capture:
        capture.release()
        capture = None
    return "Stopped"

@app.route('/get_latest')
def get_latest():
    global latest, latest_confidence
    return jsonify(pred=latest, confidence=float(round(latest_confidence, 2)))

@app.route('/predict-leather', methods=['POST'])
def predict_leather():
    global latest, latest_confidence
    f = request.files.get('image')
    if not f:
        return jsonify(error='no image'), 400
    img = Image.open(io.BytesIO(f.read()))
    cls, confidence = predict(img)
    latest, latest_confidence = cls, confidence
    trigger_device(cls)
    return jsonify(pred=cls, confidence=float(round(confidence, 2)))

# Alias route to support frontend expectation
@app.route('/predict', methods=['POST'])
def alias_predict():
    return predict_leather()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9001)