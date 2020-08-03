#ifndef _TextMessageHandler_
#define _TextMessageHandler_

#include "InboundMessageHandler.h"
#include "SerialMessageWriteBuffer.h"

namespace phishpi {
    class TextMessageHandler : public phishpi::InboundMessageHandler {
        public:
        TextMessageHandler(phishpi::ISerialMessageSender& messageSender) :
            messageSender(messageSender)
        {
        }

        virtual char messageTypeIdentifier() {
            return 'T';
        };

        virtual void handleMessage(char * messageParameters) {
            sendTextMessage(messageParameters);
        };

        void sendTextMessage(const char * textMessage) {
            size_t length = strlen(textMessage);
            char outboundMessage[length+2] = "T:";
            memcpy(outboundMessage+2,textMessage,length+1);

            messageSender.addMessage(outboundMessage);
        }

        private:
        phishpi::ISerialMessageSender& messageSender;
    };
}

#endif