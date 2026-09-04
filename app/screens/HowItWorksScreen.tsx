import React from "react";
import ScreenContainer from "../components/ScreenContainer";
import HowItWorks from "../components/HowItWorks";

/** The same explanation the first run shows, kept reachable from Settings. */
const HowItWorksScreen: React.FC = () => (
  <ScreenContainer scroll>
    <HowItWorks />
  </ScreenContainer>
);

export default HowItWorksScreen;
