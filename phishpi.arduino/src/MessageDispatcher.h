#ifndef _MessageDispatcher_
#define _MessageDispatcher_

#include "InboundMessageHandler.h"
#include <initializer_list>
#include <vector>
#include <map>

namespace phishpi
{
    class MessageDispatcher {
        public:
        MessageDispatcher(std::initializer_list<phishpi::InboundMessageHandler*> handlers) : handlers(handlers)
        {
        }

        void dispatchRawMessage(char * message) {
            size_t messageLength = strlen(message);
            if(messageLength >= 2) {
                if(message[1] == ':') {
                    char messageType = message[0];
                    for(phishpi::InboundMessageHandler* handler : handlers) {
                        if(handler->messageTypeIdentifier() == messageType) {
                            handler->handleMessage(message+2);
                        }
                    }
                }
            }
        }

        private:
        std::vector<phishpi::InboundMessageHandler*> handlers;
    };
} 

#endif