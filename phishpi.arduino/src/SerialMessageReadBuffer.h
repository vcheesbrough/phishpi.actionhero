#pragma once
#include "IMockableSerial.h"
#include "Constants.h"

namespace phishpi {
    template <unsigned char TBufferSize>
    class SerialMessageReadBuffer {
        public:

        SerialMessageReadBuffer(IMockableSerial& mockableSerial) 
            : mockableSerial(mockableSerial) { }

        char * tryGetNextCommand() {
            while(mockableSerial.available() > 0) {
                char singleByte = mockableSerial.read();
                if(inCommand) {
                    if(singleByte == COMMAND_END_TOKEN) {
                        serialReadBuffer[nextReadBufferIndex] = 0;
                        reset();
                        return serialReadBuffer;
                    } else {
                        if(nextReadBufferIndex < TBufferSize) {
                            serialReadBuffer[nextReadBufferIndex++] = singleByte;
                        } else {
                            reset();
                            return nullptr;
                        }
                        
                    }
                } else {
                    if(singleByte == COMMAND_START_TOKEN) {
                        inCommand = true;
                        nextReadBufferIndex = 0;
                    }
                }
                
            }
            return nullptr;
        }

        private:
        void reset() {
            inCommand = false;
            nextReadBufferIndex = 0;
        }

        IMockableSerial& mockableSerial;
        char  serialReadBuffer[TBufferSize];
        unsigned char nextReadBufferIndex=0;
        bool inCommand = false;

    };
}
