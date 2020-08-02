#include "SerialMessageReadBuffer.h"
#include <unity.h>
#include "IMockableSerial.h"

#ifndef ARDUINO
#include "fakeit.h"
using namespace fakeit;

namespace SerialMessageReadBufferTests {

    void givenNoAvailable_thenReadNotCalled() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer target(mockSerial.get(),20);

        When(Method(mockSerial,available)).Return(0);

        target.tryGetNextCommand();

        Verify(Method(mockSerial,read)).Never();
    }

    void givenCommandLongerThanBuffer_commandNotReturned() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer target(mockSerial.get(),3);

        When(Method(mockSerial,available)).Return(6,5,4,3,2,1,0);
        When(Method(mockSerial,read)).Return('<','A','B','C','D','>');

        char * nextCommand = target.tryGetNextCommand();

        TEST_ASSERT_NULL(nextCommand);
    }

    void givenCommandSameSizeAsBuffer_commandReturned() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer target(mockSerial.get(),4);

        When(Method(mockSerial,available)).Return(6,5,4,3,2,1,0);
        When(Method(mockSerial,read)).Return('<','A','B','C','D','>');

        char * nextCommand = target.tryGetNextCommand();

        TEST_ASSERT_EQUAL_STRING("ABCD",nextCommand);
    }

    void givenSeveralAvailableWithoutMarkCharacters_thenReadCalled() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer target(mockSerial.get(),20);

        When(Method(mockSerial,available)).Return(3,2,1,0);
        When(Method(mockSerial,read)).Return('A','B','C');

        char* nextCommand = target.tryGetNextCommand();

        TEST_ASSERT_NULL(nextCommand);
        Verify(Method(mockSerial,read)).Exactly(3);
    }

    void givenCommandAvailableSuroundedByJunk_thenCommandReturned() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer target(mockSerial.get(),20);

        When(Method(mockSerial,available)).Return(7,6,5,4,3,2,1,0);
        When(Method(mockSerial,read)).Return('X','<','C','D','E','>','F');

        char* nextCommand = target.tryGetNextCommand();

        TEST_ASSERT_EQUAL_STRING("CDE",nextCommand);
    }

    void givenTwoCommandAvailableSuroundedByJunk_thenFirstCommandReturned() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer target(mockSerial.get(),20);

        When(Method(mockSerial,available)).Return(7,6,5,4,3,2,1,0);
        When(Method(mockSerial,read)).Return('X','<','C','>','<','D','>');

        char* nextCommand = target.tryGetNextCommand();

        TEST_ASSERT_EQUAL_STRING("C",nextCommand);
    }

    void givenTwoCommandAvailableSuroundedByJunk_thenSecondCommandReturnedOnSecondInvocation() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer target(mockSerial.get(),20);

        When(Method(mockSerial,available)).Return(7,6,5,4,3,2,1,0);
        When(Method(mockSerial,read)).Return('X','<','C','>','<','D','>');

        target.tryGetNextCommand();
        char* nextCommand = target.tryGetNextCommand();

        TEST_ASSERT_EQUAL_STRING("D",nextCommand);
    }

    void givenHalfCommandAvailableOnFirstInvocationAndOtherHalfAvailableOnSecond_thenSecondInvocationReturnsCommand() {
        Mock<phishpi::IMockableSerial> mockSerial;
        phishpi::SerialMessageReadBuffer target(mockSerial.get(),20);

        When(Method(mockSerial,available)).Return(3,2,1,0);
        When(Method(mockSerial,read)).Return('<','C','D');

        target.tryGetNextCommand();

        When(Method(mockSerial,available)).Return(3,2,1,0);
        When(Method(mockSerial,read)).Return('E','F','>');

        char* nextCommand = target.tryGetNextCommand();

        TEST_ASSERT_EQUAL_STRING("CDEF",nextCommand);
    }
}


#endif
