#include <AUnitVerbose.h>
#include "tests/SimpleComponentTests.h"

void setup() {
  Serial.begin(115200);
  while (! Serial); // Wait until Serial is ready - Leonardo/Micro
  aunit::TestRunner::setVerbosity(aunit::Verbosity::kAll);
}

void loop() {
  aunit::TestRunner::run();
}
