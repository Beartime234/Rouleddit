import { Devvit } from '@devvit/public-api';


// The 'children' type is gross. The text gets wrapped in an array, but string[] throws an error in vscode :()
interface StyledTextProps {
  children: string | string[];
  size?: 'xsmall' | 'small' | 'medium' | 'large'  | 'xlarge' | 'xxlarge';
  color?: string;
  onPress?: () => void;
  overflow?: 'clip' | 'ellipsis';
}

export function StyledText(props: StyledTextProps): JSX.Element {
  const { children, size = 'large', color = 'black', overflow = 'ellipsis' } = props;

  return (
    <text
      weight='bold'
      color={color}
      size={size}
      onPress={props.onPress}
      overflow={overflow}
    >
      {children}
    </text>
  );
}
