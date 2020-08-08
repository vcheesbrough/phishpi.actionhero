#ifndef _ArduinoSerial_
#define _ArduinoSerial_
#include <Arduino.h>
#include "IMockableSerial.h"

namespace phishpi {
    class ArduinoSerial : public IMockableSerial {
        public:
        virtual int available() {
            return Serial.available();
        }
        
        virtual int read() {
            return Serial.read();
        };

        virtual size_t write(char * character,size_t count) {
            return Serial.write(character,count);
        };

        virtual size_t availableForWrite() {
            return Serial.availableForWrite();
        };
    };
}

#endif