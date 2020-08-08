#pragma once

namespace phishpi {
    class IMasterMode {
        public:
        virtual char modeIdentifier() = 0;
        
        virtual void onBeginMode() {
            active = true;
        };

        virtual void onEndMode()  {
            active = false;
        };

        bool isActive() {return active;}

        private:
        bool active = false;
    };
}