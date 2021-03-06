#ifndef _SerialMessageWriteBuffer_
#define _SerialMessageWriteBuffer_
#include "IMockableSerial.h"
#include "IRingBuffer.h"
#include <string.h>
#include "Constants.h"

namespace phishpi {
    
    class ISerialMessageSender {
        public:
        virtual void addMessage(const char * message) = 0;
    };

    template <unsigned char TBufferSize>
    class SerialMessageWriteBuffer :public phishpi::ISerialMessageSender {
        public:
        SerialMessageWriteBuffer(phishpi::IMockableSerial & serial,phishpi::IRingBuffer<char,TBufferSize> & ringBuffer) :
            serial(serial),
            ringBuffer(ringBuffer)
        {
        }

        void addMessage(const char * message) {
            size_t charactersInMessage = strlen(message);
            if(charactersInMessage + 2 < ringBuffer.availableForPut()) {
                ringBuffer.put(COMMAND_START_TOKEN_STRING,1);
                ringBuffer.put(message,charactersInMessage);
                ringBuffer.put(COMMAND_END_TOKEN_STRING,1);
            }
        }

        void trySendMessages() {
            unsigned char availableForTake = ringBuffer.availableForTake();
            if(availableForTake == 0) {
                return;
            }
            size_t avaiableForWrite = serial.availableForWrite();
            if(avaiableForWrite == 0) {
                return;
            }
            unsigned char size = availableForTake > avaiableForWrite ? avaiableForWrite : availableForTake;
            char toBeWritten[size];
            char bufferRead = ringBuffer.take(toBeWritten,size);
            serial.write(toBeWritten,bufferRead);
        }
        
        private:
        phishpi::IMockableSerial & serial;
        phishpi::IRingBuffer<char,TBufferSize> & ringBuffer;
    };
}

#endif