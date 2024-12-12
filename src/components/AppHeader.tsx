import { Devvit } from '@devvit/public-api';
import { StyledButton } from './StyledButton.js';
import { formatScore } from '../utils/formatNumbers.js';

interface AppHeaderProps {
  userScore: number;
  onBack?: () => void;
}

export const AppHeader = (props: AppHeaderProps): JSX.Element => {
  const { userScore: score } = props;

  return (
    <>
      <hstack width="100%" alignment="middle">
      <spacer height="72px" />
      <hstack width="100%" alignment="middle">
        <spacer width="24px" height="36px" />
        {props.onBack && (
          <vstack alignment="middle" onPress={props.onBack}>
            <StyledButton
              width="100px"
              height="32px"
              appearance="back"
              label="Back"
            />
          </vstack>
        ) || <spacer width="24px" />} 
        <spacer grow />
        <vstack alignment="middle">
        <StyledButton width="100px" height="32px" appearance="score" label={`${formatScore(score)}`} />
        </vstack>
        <spacer width="24px" />
      </hstack>
    </hstack>
    </>
  );
}
