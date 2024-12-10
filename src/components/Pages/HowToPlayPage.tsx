import type { Context } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';

import { StyledText } from '../StyledText.js';
import Settings from '../../settings.json';
import { BackButton, StyledButton } from '../StyledButton.js';

interface HowToPlayProps {
  onClose: () => void;
}

export const HowToPlayPage = (props: HowToPlayProps, _context: Context): JSX.Element => (
  <vstack width="100%" height="100%">
    <spacer height="24px" />

    {/* Header */}
    <hstack width="100%" alignment="middle">
      <spacer width="24px" />
      <BackButton onPress={props.onClose} />
      <spacer grow />
      <image url="howtoplay_logo.png" imageWidth="200px" imageHeight="50px" description="How To Play Logo"/>
      <spacer width="20px" />
    </hstack>
    <spacer height="20px" />

    <hstack grow>
      <spacer width="24px" />
      <zstack alignment="start top" grow>
        {/* Shadow */}
        <vstack width="100%" height="100%">
          <spacer height="4px" />
          <hstack grow>
            <spacer width="4px" />
            <hstack grow backgroundColor='red' />
          </hstack>
        </vstack>

        {/* Card */}
        <vstack width="100%" height="100%">
          <hstack grow>
            <vstack grow backgroundColor="white">
              <spacer height="4px" />
              <vstack grow alignment="center middle">
                <StyledText>123</StyledText>
                <spacer height="4px" />
                <StyledText>123</StyledText>
                <spacer height="16px" />
                <StyledText>If you run out of money</StyledText>
                <spacer height="4px" />
                <StyledText color={Settings.theme.red}>will be first in the post title</StyledText>
              </vstack>
              <spacer height="4px" />
            </vstack>
            <spacer width="4px" />
          </hstack>
          <spacer height="4px" />
        </vstack>
      </zstack>
      <spacer width="20px" />
    </hstack>

    <spacer height="20px" />
  </vstack>
);
