#pragma once

#include "IMasterMode.h"
#include "LedController.h"
#include "InboundMessageHandler.h"
#include <string.h>

namespace phishpi {
    class ManualMode : public phishpi::IMasterMode, public phishpi::InboundMessageHandler{
        public:
        ManualMode(std::array<phishpi::LedController*,3> leds) : 
            leds(leds),
            intensities({0,0,0})
        {
        }

        virtual char modeIdentifier() {
            return 'm';
        };

        virtual void handleMessage(char * messageParameters) {
            size_t length = strlen(messageParameters);
            if(length == 3) {
                unsigned int intensity;
                char ledIdentifier;
                sscanf(messageParameters,"%c%02x",&ledIdentifier,&intensity);
                if(intensity <= 0xff) {
                    for(size_t i=0 ; i < leds.size() ; i++) {
                        if(leds[i]->getIdentifier() == ledIdentifier) {
                            if(intensities[i] != intensity) {
                                intensities[i] = intensity;
                                if(isActive()) {
                                    leds[i]->setIntensity(intensity);
                                }
                            }
                        }
                    }
                }
            }
        };

        virtual void onBeginMode() {
            IMasterMode::onBeginMode();
            for(size_t i=0 ; i < leds.size() ; i++) {
                leds[i]->setIntensity(intensities[i]);
            }
        };


        virtual char messageTypeIdentifier() {
            return 'i';
        };

        private:
        std::array<phishpi::LedController*,3> leds;
        std::array<unsigned char,3> intensities;
    };
}