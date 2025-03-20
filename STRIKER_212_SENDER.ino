#include <WiFi.h>
#include <OOCSI.h>

#define WIFI_SSID "your_wifi_ssid"   // 🔹 Replace with your WiFi SSID
#define WIFI_PASS "your_wifi_password"      // 🔹 Replace with your WiFi password
#define OOCSI_SERVER "oocsi.id.tue.nl"  // 🔹 OOCSI server address

OOCSI oocsi;
int counter = 0;

// 🔹 Define potentiometer pins
const int pot1 = 32;  
const int pot2 = 33;
const int pot3 = 35;

const int redLED = 26;    // Red LED pin
const int greenLED = 27;  // Green LED pin

// Blinking red LED control
bool safeCracked = false;
bool ledState = LOW;
unsigned long previousMillis = 0;
const long interval = 500; // Blink interval

void setup() {
    Serial.begin(115200);
    
    // 🔹 Connect to OOCSI (unique name to prevent conflicts)
    String deviceName = "STRIKER_ESP32_" + String(random(1000, 9999));
    oocsi.connect(deviceName.c_str(), OOCSI_SERVER, WIFI_SSID, WIFI_PASS);

    pinMode(redLED, OUTPUT);
    pinMode(greenLED, OUTPUT);
    
    // 🔹 Start with red blinking
    digitalWrite(redLED, HIGH);
    digitalWrite(greenLED, LOW);
}

void loop() {
    // 🔹 Read potentiometer values (0-4095 range for ESP32)
    int val1 = analogRead(pot1);
    int val2 = analogRead(pot2);
    int val3 = analogRead(pot3);

    // Normalize values (0-18 range) like in Processing
    int norm1 = val1 / 227;
    int norm2 = val2 / 227;
    int norm3 = val3 / 227;

    // 🔹 Print values for debugging
    Serial.print("Pot1: "); Serial.print(norm1);
    Serial.print(" | Pot2: "); Serial.print(norm2);
    Serial.print(" | Pot3: "); Serial.println(norm3);

    // 🔹 Send potentiometer data to OOCSI
    oocsi.newMessage("your_channel_name");
    oocsi.addInt("counter", counter);
    oocsi.addInt("pot1", val1);
    oocsi.addInt("pot2", val2);
    oocsi.addInt("pot3", val3);
    oocsi.sendMessage();

    counter++;  // Increment the counter

    // Check if the combination is correct (748)
    if (norm1 == 7 && norm2 == 4 && norm3 == 8) {
        if (!safeCracked) {
            Serial.println("Safe Cracked! Turning on green LED.");
            safeCracked = true;
            digitalWrite(redLED, LOW);  // Stop blinking red
            digitalWrite(greenLED, HIGH); // Turn on green LED
        }
    } else {
        if (safeCracked) {
            Serial.println("Incorrect combination! Resetting LEDs.");
            safeCracked = false;
            digitalWrite(greenLED, LOW);
        }
        // Blinking red LED logic
        unsigned long currentMillis = millis();
        if (currentMillis - previousMillis >= interval) {
            previousMillis = currentMillis;
            ledState = !ledState;  // Toggle LED state
            digitalWrite(redLED, ledState);
        }
    }

    delay(1000);  // Wait 1 second before sending again
}
