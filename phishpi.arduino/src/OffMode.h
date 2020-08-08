#pragma once

#include "IMasterMode.h"
#include "LedController.h"

namespace phishpi {
    class OffMode : public phishpi::IMasterMode {

        public:
        OffMode(std::array<phishpi::LedController*,3> leds) : leds(leds) {
        }

        virtual char modeIdentifier() {
            return '-';
        };

        virtual void onBeginMode() {
            IMasterMode::onBeginMode();
            for(auto led : leds) {
                led->setIntensity(0);
            }
        };

        private:
        std::array<LedController*,3> leds;
    };
}
