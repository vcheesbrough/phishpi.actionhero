#ifndef _SerialMessageReadBuffer_
#define _SerialMessageReadBuffer_
#include "IMockableSerial.h"

namespace phishpi {
    class SerialMessageReadBuffer {
        public:

        SerialMessageReadBuffer(IMockableSerial& mockableSerial,unsigned char bufferSize) 
            : mockableSerial(mockableSerial), 
            serialReadBuffer(new char[bufferSize+1]), 
            bufferSize(bufferSize+1) { }

        ~SerialMessageReadBuffer() {
            delete serialReadBuffer;
        }
        
        char * tryGetNextCommand() {
            while(mockableSerial.available() > 0) {
                char singleByte = mockableSerial.read();
                if(inCommand) {
                    if(singleByte == '>') {
                        serialReadBuffer[nextReadBufferIndex] = 0;
                        reset();
                        return serialReadBuffer;
                    } else {
                        if(nextReadBufferIndex < bufferSize - 1) {
                            serialReadBuffer[nextReadBufferIndex++] = singleByte;
                        } else {
                            reset();
                            return nullptr;
                        }
                        
                    }
                } else {
                    if(singleByte == '<') {
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
        char*  serialReadBuffer;
        const unsigned char bufferSize;
        unsigned char nextReadBufferIndex=0;
        bool inCommand = false;

    };
}
#endif