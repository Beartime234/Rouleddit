import { Devvit } from '@devvit/public-api';
import Settings from '../settings.json';

interface ShadowProps {
  height: Devvit.Blocks.SizeString;
  width: Devvit.Blocks.SizeString;
  children: JSX.Element;
  color?: string;
  onPress?: () => void;
}

export const Shadow = (props: ShadowProps): JSX.Element => {
  const { height, width, children, color = 'black', onPress } = props;

  return (
    <zstack alignment="start top" onPress={onPress}>
      {/* Shadow */}
      <vstack width="100%" height="100%">
        <spacer height="4px" />
        <hstack width="100%" height="100%">
          <spacer width="4px" />
          <hstack height={height} width={width} backgroundColor={color} cornerRadius='none' />
        </hstack>
      </vstack>
      {/* Card */}
      {children}
    </zstack>
  );
};
