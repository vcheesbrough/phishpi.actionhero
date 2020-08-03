#include <Arduino.h>
#include "ArduinoSerial.h"
#include "SerialMessageReadBuffer.h"
#include "SerialMessageWriteBuffer.h"
#include "TextMessageHandler.h"
#include "MessageDispatcher.h"
#include <array>
#include <initializer_list>

#define READ_BUFFER_SIZE  32
#define WRITE_BUFFER_SIZE  100

phishpi::ArduinoSerial arduinoSerial;
phishpi::SerialMessageReadBuffer<READ_BUFFER_SIZE> serialMessageReadBuffer(arduinoSerial);
phishpi::RingBuffer<char,WRITE_BUFFER_SIZE> serialWriteRingBuffer;
phishpi::SerialMessageWriteBuffer<WRITE_BUFFER_SIZE> serialMessageWriteBuffer(arduinoSerial,serialWriteRingBuffer);

phishpi::TextMessageHandler textMessageHandler(serialMessageWriteBuffer);

phishpi::MessageDispatcher messageDispatcher({
  &textMessageHandler
});

void setup() {
  Serial.begin(115200);
  textMessageHandler.sendTextMessage("Started");
}

void loop() {
  serialMessageWriteBuffer.trySendMessages();
  char * command = serialMessageReadBuffer.tryGetNextCommand();
  if(command != nullptr) {
    messageDispatcher.dispatchRawMessage(command);
  }
}

