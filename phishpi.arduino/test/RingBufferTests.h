#include "IRingBuffer.h"
#include <unity.h>

namespace RingBufferTests {
    void givenBufferEmpty_ThenAvailableForPutReturnsBufferSize() {
        phishpi::RingBuffer<char,10> target;

        TEST_ASSERT_EQUAL(10,target.availableForPut());
    }

    void givenBufferEmptyAndPutWithMoreThanBufferSize_ThenAvailableForTakeReturnsZero() {
        phishpi::RingBuffer<char,4> target;
        target.put("ABCDEFGHI",5);

        TEST_ASSERT_EQUAL(0,target.availableForTake());
    }

    void givenBufferEmptyAndPutWithLessThanBufferSize_ThenAvailableForTakeReturnsPutSize() {
        phishpi::RingBuffer<char,10> target;

        target.put("ABCD",4);
            
        TEST_ASSERT_EQUAL(4,target.availableForTake());
    }

    void givenBufferEmptyAndPutWithLessThanBufferSize_ThenTakeGetsPutValues() {
        phishpi::RingBuffer<char,10> target;

        target.put("ABCD",4);

        char taken[10];
        unsigned char takenBytes = target.take(taken,10);
        TEST_ASSERT_EQUAL(4,takenBytes);
        TEST_ASSERT_EQUAL_CHAR_ARRAY("ABCD",taken,4);
    }


    void givenBufferEmptyAndPutTwice_ThenTakeGetsBothPutValues() {
        phishpi::RingBuffer<char,10> target;

        target.put("ABCD",4);
        target.put("EFG",3);

        char taken[10];
        unsigned char takenBytes = target.take(taken,10);
        TEST_ASSERT_EQUAL(7,takenBytes);
        TEST_ASSERT_EQUAL_CHAR_ARRAY("ABCDEFG",taken,7);
    }

    void givenBufferEmptyAndPut_ThenTakeWithLessThanPutGetsPartOfPut() {
        phishpi::RingBuffer<char,10> target;

        target.put("ABCDEFG",7);

        char taken[10];
        unsigned char takenBytes = target.take(taken,3);
        TEST_ASSERT_EQUAL(3,takenBytes);
        TEST_ASSERT_EQUAL_CHAR_ARRAY("ABC",taken,3);
    }

    void givenBufferEmptyAndPut_ThenTakeMultipleTimesCanGetPut() {
        phishpi::RingBuffer<char,10> target;

        target.put("ABCDEFG",7);

        char taken[10];
        target.take(taken,3);
        unsigned char takenBytes = target.take(taken,10);
        TEST_ASSERT_EQUAL(4,takenBytes);
        TEST_ASSERT_EQUAL_CHAR_ARRAY("DEFG",taken,4);
    }
    
    void givenBufferFull_ThenAvailableToPutIsZero() {
        phishpi::RingBuffer<char,7> target;

        target.put("ABCDEFG",7);

        TEST_ASSERT_EQUAL(0,target.availableForPut());
    }
    
    void givenBufferHasSomeContent_ThenAvailableToPutIsRemainingSpace() {
        phishpi::RingBuffer<char,10> target;

        target.put("ABCDEFG",7);

        TEST_ASSERT_EQUAL(3,target.availableForPut());
    }

    void givenContainsContentNotAtStartAndPutWillWrap_ThenTakeWillGetPutValue() {
        phishpi::RingBuffer<char,10> target;

        target.put("ABCDEFG-",8);
        char taken[10];
        target.take(taken,7);

        target.put("01234",5);

        unsigned char takenBytes = target.take(taken,5);
        TEST_ASSERT_EQUAL(5,takenBytes);
        TEST_ASSERT_EQUAL_CHAR_ARRAY("-0123",taken,5);
        TEST_ASSERT_EQUAL(9,target.availableForPut());
    }
    
        void givenIntegerBufferEmptyAndPutWithLessThanBufferSize_ThenTakeGetsPutValues() {
        phishpi::RingBuffer<int,10> target;

        int putValues[4] = {1,2,3,4};
        target.put(putValues,4);

        int taken[10];
        unsigned char takenInts = target.take(taken,10);
        TEST_ASSERT_EQUAL(4,takenInts);
        int expectedTaken[4] = {1,2,3,4};
        TEST_ASSERT_EQUAL_INT_ARRAY(expectedTaken,taken,4);
    }



}