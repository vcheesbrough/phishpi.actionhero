#ifndef _IMockableSerial_
#define _IMockableSerial_

namespace phishpi
{
    class IMockableSerial {
        public:
        virtual int available() =0;
        virtual int read() = 0;
        virtual size_t write(char * character,size_t count) = 0;
        virtual size_t availableForWrite() = 0;
    };
} 

#endif