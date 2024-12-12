import { Devvit } from '@devvit/public-api';
import { StyledText } from './StyledText.js';
import { formatScore } from '../utils/formatNumbers.js';


export type LeaderboardRowProps = {
  rank: number;
  name: string;
  height: Devvit.Blocks.SizeString;
  score: number;
  emoji?: string;
  onPress?: () => void;
};

export const LeaderboardRow = (props: LeaderboardRowProps): JSX.Element => {
  const { rank, name, height, score, onPress } = props;

  return (
    <zstack height={height} onPress={onPress}>
      <hstack width="100%" height="100%" alignment="start middle">
        <spacer width="12px" />
        <StyledText>{`${rank}.`}</StyledText>
        <spacer width="8px" />
        <StyledText>{name}</StyledText>
      </hstack>

      <hstack width="100%" height="100%" alignment="end middle">
        <hstack backgroundColor="white" height="100%" alignment="middle">
          <spacer width="8px" />
          <StyledText>{formatScore(score)}</StyledText>
          <spacer width="8px" />
          <text>{props.emoji}</text>
          <spacer width="12px" />
        </hstack>
      </hstack>
    </zstack>
  );
};
