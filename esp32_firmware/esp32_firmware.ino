#include <SPI.h>
#include <max6675.h>
#include <HX711.h>

// --- Pin Assignments ---
// MAX6675 (Thermocouple)
#define MAX_SCK 18
#define MAX_CS 5
#define MAX_SO 19
MAX6675 thermocouple(MAX_SCK, MAX_CS, MAX_SO);

// Analog Sensors
#define MQ2_PIN 34
#define MQ135_PIN 35
#define MOISTURE_PIN 32

// HX711 (Load Cell 20kg)
#define HX711_DT 4
#define HX711_SCK 15
HX711 scale;

// HX710B (Pressure Sensor)
#define HX710B_DT 21
#define HX710B_SCK 22
HX711 pressureSensor;

// Relay
#define RELAY_PIN 23
bool relayState = false;

unsigned long lastReadTime = 0;

void setup() {
  Serial.begin(115200);

  // Initialize Pins
  pinMode(MQ2_PIN, INPUT);
  pinMode(MQ135_PIN, INPUT);
  pinMode(MOISTURE_PIN, INPUT);
  
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  // Initialize HX711
  scale.begin(HX711_DT, HX711_SCK);
  pinMode(HX711_DT, INPUT_PULLUP); // Prevent floating pin noise from freezing ESP32

  // Initialize HX710B
  pressureSensor.begin(HX710B_DT, HX710B_SCK);
  pinMode(HX710B_DT, INPUT_PULLUP); // Prevent floating pin noise
  
  // Give sensors time to warm up
  delay(1000);
}

void loop() {
  // Listen for incoming commands from the laptop (e.g. to toggle relay)
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    if (command == "RELAY_ON") {
      relayState = true;
      digitalWrite(RELAY_PIN, HIGH);
    } else if (command == "RELAY_OFF") {
      relayState = false;
      digitalWrite(RELAY_PIN, LOW);
    }
  }

  // Transmit sensor data every 2 seconds
  if (millis() - lastReadTime >= 2000) {
    lastReadTime = millis();

    float tempC = thermocouple.readCelsius();
    int mq2_val = analogRead(MQ2_PIN);
    int mq135_val = analogRead(MQ135_PIN);
    int moisture_val = analogRead(MOISTURE_PIN);
    
    float weight = 0.0;
    if (digitalRead(HX711_DT) == LOW && scale.is_ready()) {
      weight = scale.get_units(1); // Single read to prevent blocking
    }
    
    float pressure = 0.0;
    if (digitalRead(HX710B_DT) == LOW && pressureSensor.is_ready()) {
      pressure = pressureSensor.get_units(1); // Single read to prevent blocking
    }

    // Convert analog values
    float smoke = (mq2_val / 4095.0) * 100.0; 
    float airQuality = (mq135_val / 4095.0) * 100.0;
    // Most analog moisture sensors output Max voltage (4095) when dry, and Min (0) when wet.
    // By doing 100.0 - ..., bone dry air will read as 0.0% instead of 100.0%.
    float moisture_pct = 100.0 - ((moisture_val / 4095.0) * 100.0);

    // Sanitize values (prevent "nan" from breaking JSON.parse in the browser)
    if (isnan(tempC)) tempC = 0.0;
    if (isnan(smoke)) smoke = 0.0;
    if (isnan(airQuality)) airQuality = 0.0;
    if (isnan(moisture_pct)) moisture_pct = 0.0;
    if (isnan(weight)) weight = 0.0;
    if (isnan(pressure)) pressure = 0.0;

    // Build JSON string
    String json = "{";
    json += "\"temperature\":" + String(tempC) + ",";
    json += "\"smoke\":" + String(smoke) + ",";
    json += "\"airQuality\":" + String(airQuality) + ",";
    json += "\"moisture\":" + String(moisture_pct) + ",";
    json += "\"weight\":" + String(weight) + ",";
    json += "\"pressure\":" + String(pressure) + ",";
    json += "\"relay_on\":" + String(relayState ? "true" : "false");
    json += "}";

    // Print to Serial (Laptop reads this)
    Serial.println(json);
  }
}
