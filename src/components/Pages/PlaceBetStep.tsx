import { Devvit, useForm, Context, useState, useAsync } from '@devvit/public-api';
import { StyledText } from '../StyledText.js';
import { StyledButton } from '../StyledButton.js';
import { AppHeader } from '../AppHeader.js';
import { Service } from '../../service/Service.js';
import { Bet, BetType, BetTypeMultiplier } from '../../types/BetData.js';
import { UserData } from '../../types/UserData.js';
import { SpinWheelStep } from './SpinWheelStep.js';
import { ChosenPostData, PayoutData } from '../../types/BetData.js';

interface PlaceBetProps {
  username?: string;
  userData: UserData;
  userScore: number;
  setUserScore: (score: number) => void;
  onBack: () => void;
}

const isValidBet = (bet: number, score: number, context: Context): boolean => {
  if (bet > score) {
    context.ui.showToast('Not enough money');
    return false;
  }
  if (bet % 1 !== 0) {
    context.ui.showToast('Please enter a whole number');
    return false;
  }
  if (bet <= 0 || isNaN(bet)) {
    context.ui.showToast('Please enter a valid bet');
    return false;
  }
  return true;
}

const SingleLetterFormField = {
  type: 'string' as const,
  name: 'letter',
  label: 'Letter',
  defaultValue: 'A',
  required: true,
};

const BetAmountFormField = {
  type: "number" as const,
  name: 'bet',
  label: 'Bet',
  defaultValue: 0,
  required: true,
}

const singleLetterButtonWidth = 280;
const letterRangeButtonWidth = 90;
const vowelConsonantButtonWidth = 136;
  
export const PlaceBetStep = (
  props: PlaceBetProps, context: Context
): JSX.Element => {
  const score = props.userScore;
  const setUserScore = props.setUserScore;
  const service = new Service(context)

  const [betType, setBetType] = useState<BetType | null>(null);
  
  const [betPlaced, setBetPlaced] = useState(false);
  const [chosenPost, setChosenPost] = useState<ChosenPostData | null>(null);

  const [payoutData, setPayoutData] = useState<PayoutData | null>(null);
  const [userBet, setUserBet] = useState<Bet | null>(null);

  const standardGuessForm = useForm(
    {
      title: 'Place Bet',
      description: "How much would you like to bet?",
      acceptLabel: 'Confirm',
      fields: [
        BetAmountFormField
      ],
    },
    // @ts-ignore
    async (values: { bet: number }) => {
      if (!isValidBet(values.bet, score, context)) {
        context.ui.showForm(standardGuessForm);
        return;
      }
      await processBet(values);
    }
  );

  const singleLetterGuessForm = useForm(
    {
      title: 'Place Bet',
      description: "How much would you like to bet?",
      acceptLabel: 'Confirm',
      fields: [
        SingleLetterFormField,
        BetAmountFormField
      ],
    },
    // @ts-ignore
    async (values: { bet: number, letter?: string }) => {
      if (values.letter!.length !== 1 || !/^[a-zA-Z]+$/.test(values.letter!)) {
        context.ui.showToast('Please enter a single letter');
        context.ui.showForm(singleLetterGuessForm);
        return;
      }
      if (!isValidBet(values.bet, score, context)) {
        context.ui.showForm(singleLetterGuessForm);
        return;
      }
      await processBet(values);
    }
  );

  async function processBet(values: { bet: number, letter?: string }) {
    const bet: Bet = {
      amount: values.bet,
      type: betType!,
    };
    if (values.letter && betType === BetType.SingleLetter) {
      bet.letter = values.letter;
    }
    setUserBet(bet);
    try {
      const randomPost = await service.getRandomPost();
      setChosenPost(randomPost);
      const payoutData = await service.handleBet(bet, props.username!, randomPost.winningLetter);
      setPayoutData(payoutData);
    } catch (error) {
      if (error instanceof Error) {
        context.ui.showToast(error.message);
      } else {
        context.ui.showToast('An unknown error occurred');
      }
      return;
    }
    setUserScore(score - values.bet);
    setBetPlaced(true);
  }

  if (betPlaced) {
    return (
      <>
      <AppHeader userScore={score}/>
      <SpinWheelStep playAgain={() => setBetPlaced(false)} setUserScore={setUserScore} userScore={score} bet={userBet!} chosenPost={chosenPost!} payoutData={payoutData!} />
      </>
    );
  }

  return (
    <>
    <AppHeader userScore={score} onBack={props.onBack} />
    <vstack width="100%" height="100%" alignment="center middle">
      <spacer height="128px" />
      <image url="placebet_logo.png" imageWidth="200px" imageHeight="50px" description="Menu Logo"/>
      <spacer height="24px" />
      {/* Bet Buttons */}
      <hstack width="100%" grow>
      <spacer width="24px" />
      <vstack gap="none" height="100%" grow alignment="center">
        <hstack gap="none">
        <StyledButton width={`${singleLetterButtonWidth}px`} appearance="green" height="48px" label="Single Letter" microLabel={`x${BetTypeMultiplier[BetType.SingleLetter]}`} onPress={() => {
          setBetType(BetType.SingleLetter);
          context.ui.showForm(singleLetterGuessForm)
        }} />
        </hstack>
        <hstack gap="none">
        <StyledButton width={`${letterRangeButtonWidth}px`} appearance="red" height="48px" label="A to I" microLabel={`x${BetTypeMultiplier[BetType.AtoI]}`} onPress={() => {
          setBetType(BetType.AtoI);
          context.ui.showForm(standardGuessForm)
        }} />
        <StyledButton width={`${letterRangeButtonWidth}px`} appearance="black" height="48px" label="J to R" microLabel={`x${BetTypeMultiplier[BetType.JtoR]}`}  onPress={() => {
          setBetType(BetType.JtoR);
          context.ui.showForm(standardGuessForm)
        }} />
        <StyledButton width={`${letterRangeButtonWidth}px`} appearance="red" height="48px" label="S to Z" microLabel={`x${BetTypeMultiplier[BetType.StoZ]}`}  onPress={() => {
          setBetType(BetType.StoZ);
          context.ui.showForm(standardGuessForm)
        }} />
        </hstack>
        <hstack gap="none">
        <StyledButton width={`${vowelConsonantButtonWidth}px`} appearance="black" height="48px" label="Vowel" microLabel={`x${BetTypeMultiplier[BetType.Vowel]}`}  onPress={() => {
          setBetType(BetType.Vowel);
          context.ui.showForm(standardGuessForm)
        }} />
        <StyledButton width={`${vowelConsonantButtonWidth}px`} appearance="black" height="48px" label="Consonant" microLabel={`x${BetTypeMultiplier[BetType.Consonant]}`} onPress={() => {
          setBetType(BetType.Consonant);
          context.ui.showForm(standardGuessForm)
        }} />
        </hstack>
      </vstack>
      <spacer width="24px" />
      </hstack> 
    </vstack>
    </>
  );
};
