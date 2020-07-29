#include "SimpleComponent.h"
#include <unity.h>

namespace SimpleComponentTests
{
    void thisReturnsTrue() {
        phishpi::SimpleComponent target;

        TEST_ASSERT_TRUE(target.thisReturnsTrue());
    }
}

