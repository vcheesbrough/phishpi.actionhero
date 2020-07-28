#ifndef _SimpleComponentTests_
#define _SimpleComponentTests_

#include <AUnitVerbose.h>
#include "../src/SimpleComponent.h"

class SimpleComponentTests : public aunit::TestOnce {
  protected:
    void setup() override {
      TestOnce::setup();
    }

    void teardown() override {
      TestOnce::teardown();
    }

    phishpi::SimpleComponent target;
};

testF(SimpleComponentTests,example) {
    assertEqual(target.thisReturnsTrue(), true);
}
#endif