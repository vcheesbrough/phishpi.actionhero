#include <Arduino.h>
#include "ArduinoSerial.h"
#include "SerialCommandReadBuffer.h"

void setup() {
  Serial.begin(115200);
  Serial.write("Hello World!!");
}


phishpi::ArduinoSerial arduinoSerial;
phishpi::SerialCommandReadBuffer serialCommandReadBuffer(arduinoSerial, 32);

void loop() {
  char * command = serialCommandReadBuffer.tryGetNextCommand();
  if(command != nullptr) {
    Serial.println(command);
  }
  
}