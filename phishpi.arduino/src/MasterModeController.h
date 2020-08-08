#ifndef _MasterModeController_
#define _MasterModeController_

#include "InboundMessageHandler.h"
#include "SerialMessageWriteBuffer.h"
#include "IMasterMode.h"
#include <string.h>
#include <vector>
#include <initializer_list>

namespace phishpi {

    class MasterModeController : public phishpi::InboundMessageHandler 
    {
        public:
        MasterModeController(phishpi::ISerialMessageSender& messageSender,std::initializer_list<phishpi::IMasterMode*> modes) :
            messageSender(messageSender),
            modes(modes)
        {
        }

        virtual char messageTypeIdentifier() {
            return 'm';
        };

        void start() {
            changeMode(this->modes[0]);
        }

        virtual void handleMessage(char * messageParameters) {
            size_t length = strlen(messageParameters);
            if(length == 1) {
                if(messageParameters[0] == '?') {
                    sendCurrentModeMessage();
                } else {
                    for(auto mode : modes) {
                        if(mode->modeIdentifier() == messageParameters[0]) {
                            changeMode(mode);
                            break;
                        }
                    }
                }
            }
        };

        private:
        void sendCurrentModeMessage() {
            char outboundMessage[4] = "m:?";
            outboundMessage[2] = currentMode->modeIdentifier();
            messageSender.addMessage(outboundMessage);
        }

        void changeMode(phishpi::IMasterMode* newMode) {
            if(newMode != currentMode) {
                if(currentMode != nullptr) {
                    currentMode->onEndMode();
                }
                currentMode = newMode;
                currentMode->onBeginMode();
                sendCurrentModeMessage();
            }
        }

        phishpi::ISerialMessageSender& messageSender;
        std::vector<phishpi::IMasterMode*> modes;
        phishpi::IMasterMode* currentMode=nullptr;
    };
}

#endif