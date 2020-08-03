#include "SerialMessageWriteBuffer.h"
#include <unity.h>
#include "IMockableSerial.h"
#include "IRingBuffer.h"

#ifndef ARDUINO
#include <single_header/standalone/fakeit.hpp>
using namespace fakeit;

namespace SerialMessageWriteBufferTests {

    template <unsigned char TBufferSize>
    void prepareBufferTake(Mock<phishpi::IRingBuffer<char,TBufferSize>> & ringBuffer,unsigned char expectedMaximumCount,const char * stringToWrite) {
        When(Method(ringBuffer,take)).Do(
            [stringToWrite,expectedMaximumCount](char * destination,unsigned char maximumCount) -> unsigned char {
                TEST_ASSERT_EQUAL(expectedMaximumCount,maximumCount);
                if(stringToWrite != nullptr) {
                    size_t stringLength = strlen(stringToWrite);
                    size_t bytesToCopy = stringLength > maximumCount ? maximumCount : stringLength+1;
                    memcpy(destination,stringToWrite,bytesToCopy);
                    destination[bytesToCopy-1] = 0;
                    return bytesToCopy;
                } else {
                    return 0;
                }
            });
        When(Method(ringBuffer,availableForTake)).Do(
            [stringToWrite]() -> unsigned char {
                if(stringToWrite != nullptr) {
                    size_t stringLength = strlen(stringToWrite);
                    return stringLength+1;
                } else {
                    return 0;
                }
            });
    }
    void prepareSerialWrite(Mock<phishpi::IMockableSerial> & mockSerial,const char * expectedCharacters,size_t expectedCount,size_t charactersWritten) {
        When(Method(mockSerial,write)).Do(
            [expectedCharacters,expectedCount,charactersWritten](char * characters,size_t count)->size_t {
                TEST_ASSERT_EQUAL_STRING(expectedCharacters,characters);
                TEST_ASSERT_EQUAL(expectedCount,count);
                return charactersWritten;
            });
        
    }

    void givenNoMessagesInBufferAndAvailable_ThenTrySendMessagesDoesNotWrite() {
        Mock<phishpi::IMockableSerial> mockSerial;
        Mock<phishpi::IRingBuffer<char,10>> mockBuffer;
        phishpi::SerialMessageWriteBuffer<10> target(mockSerial.get(),mockBuffer.get());
        
        prepareBufferTake<10>(mockBuffer,4,nullptr);

        target.trySendMessages();

        Verify(Method(mockBuffer,take)).Never();
        Verify(Method(mockSerial,write)).Never();
        Verify(Method(mockSerial,availableForWrite)).Never();
    }

    void givenMessageInBufferIsSmallerThanSerialAvailableForWrite_ThenTrySendMessagesWrites() {
        Mock<phishpi::IMockableSerial> mockSerial;
        Mock<phishpi::IRingBuffer<char,10>> mockBuffer;
        phishpi::SerialMessageWriteBuffer<10> target(mockSerial.get(),mockBuffer.get());
        
        When(Method(mockSerial,availableForWrite)).Return(10);
        prepareBufferTake<10>(mockBuffer,4,"ABC");
        prepareSerialWrite(mockSerial,"ABC",4,4);

        target.trySendMessages();

        Verify(Method(mockBuffer,take)).Once();
        Verify(Method(mockSerial,write)).Once();
    }

    void givenMessageInBufferIsLargerThanSerialAvailableForWrite_ThenTrySendMessagesWritesPartOfBuffer() {
        Mock<phishpi::IMockableSerial> mockSerial;
        Mock<phishpi::IRingBuffer<char,10>> mockBuffer;
        phishpi::SerialMessageWriteBuffer<10> target(mockSerial.get(),mockBuffer.get());
        
        When(Method(mockSerial,availableForWrite)).Return(2);
        prepareBufferTake<10>(mockBuffer,2,"ABCD");
        prepareSerialWrite(mockSerial,"A",2,2);

        target.trySendMessages();

        Verify(Method(mockBuffer,take)).Once();
        Verify(Method(mockSerial,write)).Once();
    }

    void givenMessageInBufferAndZeroAvailableForWrite_ThenTrySendMessagesDoesNotWrite() {
        Mock<phishpi::IMockableSerial> mockSerial;
        Mock<phishpi::IRingBuffer<char,10>> mockBuffer;
        phishpi::SerialMessageWriteBuffer<10> target(mockSerial.get(),mockBuffer.get());
        
        When(Method(mockSerial,availableForWrite)).Return(0);
        When(Method(mockBuffer,availableForTake)).Return(4);

        target.trySendMessages();

        Verify(Method(mockBuffer,take)).Never();
        Verify(Method(mockSerial,write)).Never();
    }
}

#endif
