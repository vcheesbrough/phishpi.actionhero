#pragma once

#include "SerialMessageWriteBuffer.h"

namespace phishpi {
    class LedController {
        public:
        LedController(char identifier,unsigned char pinNumber,phishpi::ISerialMessageSender& messageSender) :
            identifier(identifier),
            pinNumber(pinNumber),
            messageSender(messageSender)
        {
            
        }

        virtual void setIntensity(unsigned char newValue) {
            if(newValue != intensity) {
                intensity = newValue;
                sendCurrentIntesityMessage();
            }
        }

        void start() {
            intensity = 0;
            sendCurrentIntesityMessage();
        }

        char getIdentifier() {
            return identifier;
        }

        private:
        void sendCurrentIntesityMessage() {
            char message[6];
            snprintf(message,6,"i:%c%02x",getIdentifier(),intensity);
            messageSender.addMessage(message);
        }

        const char identifier;
        unsigned const char pinNumber;
        unsigned char intensity;
        phishpi::ISerialMessageSender& messageSender;
    };
}