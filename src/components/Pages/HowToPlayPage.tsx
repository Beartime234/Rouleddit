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
        <vstack width="100%" height="100%">
          <spacer height="4px" />
          <hstack grow>
            <spacer width="4px" />
            <hstack grow backgroundColor={Settings.theme.red} />
          </hstack>
        </vstack>

        <vstack width="100%" height="100%">
          <hstack grow>
            <vstack grow backgroundColor="white">
              <spacer height="4px" />
              <vstack grow alignment="center middle">
                <StyledText size='large'>A random top subreddit post will be chosen</StyledText>
                <spacer height="4px" />
                <StyledText size='large'>Bet on the first letter of the post title!</StyledText>
                <spacer height="32px" />
                <StyledText size='xlarge' color={Settings.theme.red}>-Standard Mode-</StyledText>
                <StyledText size='large' color={Settings.theme.black}>Endless Gameplay. Bet as often as you like </StyledText>
                <StyledText size='large' color={Settings.theme.black}>provided you have the points to spend</StyledText>
                <spacer height="24px" />
                <StyledText size='xlarge' color={Settings.theme.red}>-Daily Mode-</StyledText>
                <StyledText size='large' color={Settings.theme.black}>Place your daily bet to win extra points!</StyledText>      
                <StyledText size='large' color={Settings.theme.black}>Resets midday GMT-5</StyledText>                      
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
