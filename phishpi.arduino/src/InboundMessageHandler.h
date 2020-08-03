#ifndef _InboundMessageHandler_
#define _InboundMessageHandler_

namespace phishpi {
    class InboundMessageHandler
    {
        public:
        virtual void handleMessage(char * messageParameters) = 0;
        virtual char messageTypeIdentifier() = 0;
    };
}

#endif