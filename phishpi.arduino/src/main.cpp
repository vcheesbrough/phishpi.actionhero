#include <Arduino.h>
#include "ArduinoSerial.h"
#include "SerialMessageReadBuffer.h"
#include "SerialMessageWriteBuffer.h"

#define READ_BUFFER_SIZE  32
#define WRITE_BUFFER_SIZE  100

phishpi::ArduinoSerial arduinoSerial;
phishpi::SerialMessageReadBuffer SerialMessageReadBuffer(arduinoSerial, READ_BUFFER_SIZE);
phishpi::RingBuffer<char,WRITE_BUFFER_SIZE> serialWriteRingBuffer;
phishpi::SerialMessageWriteBuffer<WRITE_BUFFER_SIZE> serialMessageWriteBuffer(arduinoSerial,serialWriteRingBuffer);

void setup() {
  Serial.begin(115200);
  serialMessageWriteBuffer.addMessage("Started");
}

void cStringToUpper(char * text) {
  for(int i=0;text[i]!=0;i++)
  if(text[i]<='z' && text[i]>='a')
    text[i]-=32;
}

void dispatchCommand(char * command) {
  cStringToUpper(command);
  size_t commandLength = strlen(command);
  if(commandLength >= 1) {
    char * commandArguments = command+1;
    switch (command[0]) 
    {
    case 'M':
      Serial.print("M ");
      Serial.println(commandArguments);
      break;
    
    default:
      Serial.print("ERROR ");
      Serial.println(command);
      break;
    }
  }
}

void loop() {
  serialMessageWriteBuffer.trySendMessages();
  char * command = SerialMessageReadBuffer.tryGetNextCommand();
  if(command != nullptr) {
    dispatchCommand(command);
  }
}

