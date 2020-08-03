#ifndef _IRingBuffer_
#define _IRingBuffer_
#include <string.h>

namespace phishpi
{
    template <class TElement,unsigned char TBufferSize>
    class IRingBuffer {
        public:
        virtual unsigned char availableForPut() =0;
        virtual unsigned char availableForTake() =0;
        virtual unsigned char take(TElement* destination, unsigned char maximumCount) = 0;
        virtual void put(const TElement* source, unsigned char count) = 0;
        virtual void clear() = 0;
    };

    template <class TElement,unsigned char TBufferSize>
    class RingBuffer : public IRingBuffer<TElement,TBufferSize> {

        public:
        RingBuffer() {
            clear();
        }

        virtual unsigned char availableForPut() {
            return availableToPutCount;
        };

        virtual unsigned char availableForTake() {
            return availableToTakeCount;
        };

        virtual unsigned char take(TElement* destination, unsigned char maximumCount) 
        {
            unsigned char totalCopyCount = maximumCount > availableToTakeCount ? availableToTakeCount : maximumCount;
            if(totalCopyCount == 0) {
                return 0;
            }

            unsigned char firstCopyCount = (TBufferSize - (virtualNextTakeIndex % TBufferSize));
            firstCopyCount = firstCopyCount > totalCopyCount ? totalCopyCount : firstCopyCount;

            memcpy(destination, buffer+(virtualNextTakeIndex % TBufferSize),sizeof(TElement) * firstCopyCount);

            unsigned char secondCopyCount = totalCopyCount - firstCopyCount;
            if(secondCopyCount > 0) {
                memcpy(destination+firstCopyCount,buffer,sizeof(TElement) * secondCopyCount);
            }
            virtualNextTakeIndex += totalCopyCount;
            availableToTakeCount -= totalCopyCount;
            availableToPutCount += totalCopyCount;

            if(virtualNextTakeIndex == virtualNextPutIndex) {
                clear();
            }
            return totalCopyCount;
        };

        virtual void put(const TElement* source, unsigned char count) {
            if(count > availableForPut()) {
                return;
            }
            unsigned char firstCopyCount = (TBufferSize - (virtualNextPutIndex % TBufferSize));
            firstCopyCount = firstCopyCount > count ? count : firstCopyCount;

            memcpy(buffer+(virtualNextPutIndex % TBufferSize),source,sizeof(TElement) * firstCopyCount);
            unsigned char secondCopyCount = count - firstCopyCount;
            if(secondCopyCount > 0) {
                memcpy(buffer,source+firstCopyCount,sizeof(TElement) * secondCopyCount);
            }
            virtualNextPutIndex += count;
            availableToTakeCount += count;
            availableToPutCount -= count;
        };

        virtual void clear() {
            virtualNextTakeIndex = 0;
            virtualNextPutIndex = 0;
            availableToTakeCount = 0;
            availableToPutCount = TBufferSize;
        }

        private:
        TElement buffer[TBufferSize];
        int virtualNextTakeIndex;
        int virtualNextPutIndex;
        unsigned char availableToTakeCount;
        unsigned char availableToPutCount;
    };
} 

#endif