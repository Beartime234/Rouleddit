import { Context, Devvit, useAsync, useInterval, useState } from '@devvit/public-api';
import { LoadingState } from '../../components/LoadingState.js';
import { StyledButton } from '../../components/StyledButton.js';
import { Service } from '../../service/Service.js';
import { HowToPlayPage } from '../../components/Pages/HowToPlayPage.js';
import { LeaderboardPage } from '../../components/Pages/LeaderboardPage.js';
import { PlaceBetStep } from '../../components/Pages/PlaceBetStep.js';
import type { PostData } from '../../types/PostData.js';
import { UserData } from '../../types/UserData.js';
import { AppHeader } from '../../components/AppHeader.js';
import { convertSecondsToTimeRemaining, getSecondsUntilMidday } from '../../utils/datetime.js';
import { StyledText } from '../../components/StyledText.js';
import { Shadow } from '../../components/Shadow.js';
import { DailyPlaceBet } from '../../components/Pages/DailyPlaceBet.js';

const menuButtonWidth = '150px';
const menuButtonHeight = '48px';

interface PinnedPostProps {
  postData: PostData;
  userData: UserData;
  username?: string;
}

export const PinnedPost = (props: PinnedPostProps, context: Context): JSX.Element => {
  const service = new Service(context);
  const [page, setPage] = useState('menu');

  const { data, loading } = useAsync(async () => {
    const userScore = await service.getUserScore(props.username);
    const hasClaimedDailyGift = await service.hasClaimedTheDailyGift(props.username!);
    const hasPlacedDailyBet = await service.hasPlacedDailyBet(props.username!);
    return { userScore, hasClaimedDailyGift, hasPlacedDailyBet };
  });

  const user = data?.userScore;
  const dailyGift = data?.hasClaimedDailyGift;
  const placedDailyBet = data?.hasPlacedDailyBet;

  if (user === null || dailyGift === null || placedDailyBet === null || loading) {
    return <LoadingState />;
  }

  const [score, setScore] = useState<number>(props.userData.score);
  const [hasPlacedDailyBet, setHasPlacedDailyBet] = useState<boolean>(placedDailyBet ?? true);
  const [hasClaimedDailyGift, setHasClaimedDailyGift] = useState<boolean>(dailyGift ?? true);
  const [countdown, setCountdown] = useState<number>(getSecondsUntilMidday());

  const countdownInterval = useInterval(() => {
    setCountdown((prev) => prev - 1);
  }, 1000);

  countdownInterval.start();

  const Menu = (
    <>
    <AppHeader userScore={score} />
    <vstack width="100%" height="100%" alignment="center middle">

      <image url="menu_logo.png" imageWidth="250px" imageHeight="80px" description="Menu Logo"/>
      <spacer height={"32px"} />

      <vstack alignment="center middle" gap="small">
        <StyledButton
          width={menuButtonWidth}
          appearance="black"
          height={menuButtonHeight}
          onPress={() => setPage('placeBet')}
          label="Standard"
        />
        <StyledButton
          width={menuButtonWidth}
          appearance={hasPlacedDailyBet ? 'disabled' : 'black'}
          height={menuButtonHeight}
          onPress={hasPlacedDailyBet ? undefined : () => setPage('placeDailyBet')}
          label={hasPlacedDailyBet ? `Daily Drawn In` : 'Daily'}
          microLabel={hasPlacedDailyBet ? convertSecondsToTimeRemaining(countdown) : undefined}
        />
        <StyledButton
          width={menuButtonWidth}
          appearance="red"
          height={menuButtonHeight}
          onPress={() => setPage('rules')}
          label="How To Play"
        />
        <StyledButton
          width={menuButtonWidth}
          appearance="red"
          height={menuButtonHeight}
          onPress={() => setPage('leaderboard')}
          label="Leaderboard"
        />
      </vstack>
    </vstack>
    <hstack height='100%' width='100%' alignment='bottom start' padding='small'>
    <spacer height='24px' width='24px'/>
    {hasClaimedDailyGift ? (
      <Shadow height='12px' width='12px'>
        <hstack backgroundColor='white'>
          <StyledText>{`Gift Available: ${convertSecondsToTimeRemaining(countdown)}`}</StyledText>
        </hstack>
      </Shadow>
      ) : (
        <StyledButton
          width="150px"
          height="48px"
          appearance="score"
          label="Redeem Daily Gift"
          onPress={async () => {
            const giftAmount = await service.giveDailyGift(props.username!);
            context.ui.showToast(`You got ${giftAmount} points`)
            setScore(score + giftAmount);
            setHasClaimedDailyGift(true);
            countdownInterval.start();
          }}
        />
      )}
    </hstack>
    </>
  );

  const onClose = (): void => {
    setPage('menu');
  };

  const pages: Record<string, JSX.Element> = {
    menu: Menu,
    rules: <HowToPlayPage onClose={onClose} />,
    placeBet: <PlaceBetStep setUserScore={setScore} userScore={score} {...props} onBack={onClose} />,
    placeDailyBet: <DailyPlaceBet setHasPlacedDailyBet={setHasPlacedDailyBet} setUserScore={setScore} userScore={score} {...props} onBack={onClose} />,
    leaderboard: <LeaderboardPage onClose={onClose} username={props.username} />,
  };

  return pages[page] || Menu;
};
