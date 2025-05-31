#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>

using namespace websockets;

const char* ssid = "Robolab124";
const char* password = "wifi123123123";
const char* websocket_server = "ws://192.168.0.151:8080";
const char* deviceId = "123"; // Должен совпадать с ID в клиенте

WebsocketsClient client;
unsigned long lastReconnectAttempt = 0;

void onMessageCallback(WebsocketsMessage message) {
  Serial.print("Received: ");
  Serial.println(message.data());

  DynamicJsonDocument doc(256);
  DeserializationError error = deserializeJson(doc, message.data());

  if (!error) {
    const char* command = doc["command"];
    if (command) {
      if (strcmp(command, "forward") == 0) {
        Serial.println("Executing: FORWARD");
      }
      else if (strcmp(command, "backward") == 0) {
        Serial.println("Executing: BACKWARD");
      }
      else if (strcmp(command, "servo") == 0) {
        int angle = doc["params"]["angle"];
        Serial.printf("Setting servo angle to: %d\n", angle);
      }
    }
  }
}

void onEventsCallback(WebsocketsEvent event, String data) {
  if (event == WebsocketsEvent::ConnectionOpened) {
    Serial.println("Connected to server!");

    // Идентификация устройства
    DynamicJsonDocument doc(128);
    doc["type"] = "identify";
    doc["deviceId"] = deviceId;
    String output;
    serializeJson(doc, output);
    client.send(output);
  }
  else if (event == WebsocketsEvent::ConnectionClosed) {
    Serial.println("Connection closed");
  }
}

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");

  client.onMessage(onMessageCallback);
  client.onEvent(onEventsCallback);

  if (client.connect(websocket_server)) {
    Serial.println("WebSocket connected");
  } else {
    Serial.println("WebSocket connection failed!");
  }
}

void loop() {
  if (!client.available()) {
    if (millis() - lastReconnectAttempt > 5000) {
      lastReconnectAttempt = millis();
      if (client.connect(websocket_server)) {
        Serial.println("Reconnected to WebSocket");
      }
    }
  } else {
    client.poll();
  }
}