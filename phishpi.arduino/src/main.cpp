#include <Arduino.h>
#include "ArduinoSerial.h"
#include "SerialMessageReadBuffer.h"
#include "SerialMessageWriteBuffer.h"
#include "MessageDispatcher.h"
#include <array>
#include <initializer_list>
#include "TextMessageHandler.h"
#include "MasterModeController.h"
#include "IMasterMode.h"
#include "OffMode.h"
#include "LedController.h"
#include "ManualMode.h"

#define READ_BUFFER_SIZE  32
#define WRITE_BUFFER_SIZE  100

phishpi::ArduinoSerial arduinoSerial;
phishpi::SerialMessageReadBuffer<READ_BUFFER_SIZE> serialMessageReadBuffer(arduinoSerial);
phishpi::RingBuffer<char,WRITE_BUFFER_SIZE> serialWriteRingBuffer;
phishpi::SerialMessageWriteBuffer<WRITE_BUFFER_SIZE> serialMessageWriteBuffer(arduinoSerial,serialWriteRingBuffer);

phishpi::LedController whiteLedController('w',9,serialMessageWriteBuffer);
phishpi::LedController blueLedController('b',10,serialMessageWriteBuffer);
phishpi::LedController redLedController('r',11,serialMessageWriteBuffer);

std::array<phishpi::LedController*,3> allLeds = {
  &whiteLedController,
  &blueLedController,
  &redLedController
};

phishpi::OffMode offMode(allLeds);
phishpi::ManualMode manualMode(allLeds);

phishpi::TextMessageHandler textMessageHandler(serialMessageWriteBuffer);
phishpi::MasterModeController masterModeController(serialMessageWriteBuffer,
{
  & offMode,
  & manualMode
});

phishpi::MessageDispatcher messageDispatcher({
  & textMessageHandler,
  & masterModeController,
  & manualMode
});

void setup() {
  Serial.begin(115200);
  textMessageHandler.sendTextMessage("Started");
  masterModeController.start();
  for(auto led : allLeds) {
    led->start();
  }
}

void loop() {
  serialMessageWriteBuffer.trySendMessages();
  char * command = serialMessageReadBuffer.tryGetNextCommand();
  if(command != nullptr) {
    messageDispatcher.dispatchRawMessage(command);
  }
}

