#include <WiFi.h>
#include <WebServer.h>

// Wi-Fi credentials
const char* ssid     = "wifi name";
const char* password = "your pass";

// GPIO pins
const int BUZZER_PIN = 26;     // Buzzer for Defective
const int GREEN_LED  = 27;     // LED for Non-Defective

WebServer server(80);

// Handle trigger request from Flask
void handleTrigger() {
  if (!server.hasArg("status")) {
    server.send(400, "text/plain", "Missing status parameter");
    return;
  }

  String status = server.arg("status");

  if (status == "red") {
    digitalWrite(BUZZER_PIN, HIGH);
    digitalWrite(GREEN_LED, LOW);
    server.send(200, "text/plain", "[BUZZER] ON - Defective");
    delay(3000);  // ON for 3 seconds
    digitalWrite(BUZZER_PIN, LOW);
  } else if (status == "green") {
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(GREEN_LED, HIGH);
    server.send(200, "text/plain", "[LED] GREEN ON - Non-Defective");
    delay(3000);  // ON for 3 seconds
    digitalWrite(GREEN_LED, LOW);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(GREEN_LED, LOW);
    server.send(200, "text/plain", "Devices OFF");
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(GREEN_LED, LOW);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected. IP address:");
  Serial.println(WiFi.localIP());

  server.on("/led", handleTrigger);
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}