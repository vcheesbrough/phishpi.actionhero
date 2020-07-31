#ifndef _IMockableSerial_
#define _IMockableSerial_

namespace phishpi
{
    class IMockableSerial {
        public:
        virtual int available() =0;
        virtual int read() = 0;
    };
} 

#endif