import { Devvit } from '@devvit/public-api';
import type { SupportedGlyphs } from './PixelSymbol.js';
import { Shadow } from './Shadow.js';
import Settings from '../settings.json';
import { StyledText } from './StyledText.js';

const styles = {
  red: {
    backgroundColor: 'white',
    color: 'black',
    shadowColor: Settings.theme.red,
  },
  black: {
    backgroundColor: 'white',
    color: 'black',
    shadowColor: Settings.theme.black,
  },
  green: {
    backgroundColor: 'white',
    color: 'black',
    shadowColor: Settings.theme.moneygreen,
  },
  score: {
    backgroundColor: Settings.theme.moneygreen,
    color: 'white',
    shadowColor: 'black',
  },
  back: {
    backgroundColor: Settings.theme.black,
    color: 'white',
    shadowColor: Settings.theme.red,
  },
  disabled: {
    backgroundColor: 'gray',
    color: 'black',
    shadowColor: 'black',
  },
};

interface StyledButtonProps {
  onPress?: () => void | Promise<void>;
  leadingIcon?: SupportedGlyphs;
  label?: string;
  microLabel?: string;
  trailingIcon?: SupportedGlyphs;
  appearance?: 'red' | 'black' | 'green' | 'score' | 'back' | 'disabled';
  width?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
}

export const StyledButton = (props: StyledButtonProps): JSX.Element => {
  const {
    onPress,
    label,
    microLabel,
    appearance,
    width = '100px',
    height = '40px',
  } = props;

  const style = styles[appearance || 'red'];
  return (
    <Shadow height={height} width={width} color={style.shadowColor}>
      <hstack
        height={height}
        width={width}
        {...(onPress ? { onPress } : {})}
        backgroundColor={style.backgroundColor}
        padding="none"
        cornerRadius='none'
        alignment='middle center'
      >
        <vstack alignment='middle center' gap='none'>
        {label ? <StyledText color={style.color}>{label}</StyledText> : null}
        {microLabel ? <StyledText size='xsmall' color={style.color}>{microLabel}</StyledText> : null}
        </vstack>
      </hstack>
    </Shadow>
  );
};



// Create a overridden for the Styled Button which is a specific back button

interface BackButtonProps {
  onPress?: () => void | Promise<void>;
}

export const BackButton = (props: BackButtonProps): JSX.Element => {
  return (
    <StyledButton
      appearance="back"
      width="64px"
      height="32px"
      label='Back'  
      onPress={props.onPress}
    />
  );
};