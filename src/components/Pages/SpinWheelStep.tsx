import { Devvit, Context, useState, useInterval, useAsync } from '@devvit/public-api';
import { StyledText } from '../StyledText.js';
import { Bet, PayoutData } from '../../types/BetData.js';
import { ChosenPostData } from '../../types/BetData.js';
import { StyledButton } from '../StyledButton.js';
import { formatScore } from '../../utils/formatNumbers.js';

interface SpinWheelProps {
  username?: string;
  bet: Bet;
  chosenPost: ChosenPostData;
  payoutData: PayoutData;
  userScore: number;
  setUserScore: (score: number) => void;
  playAgain: () => void;
}

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_';
const oddsToShowGreen = 0.05;


export const SpinWheelStep = (
  props: SpinWheelProps, context: Context
): JSX.Element => {
  const { chosenPost } = props;
  const { subreddit, postTitle, winningLetter } = chosenPost;
  const { isWin, payoutAmount } = props.payoutData;

  const [revealWinningPost, setRevealWinningPost] = useState<boolean>(false);
  const [revealingWinningSubreddit, setCurrentRevealedSubreddit] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [hitCount, setHitCount] = useState<number>(0);
  const [targetHitCount, setTargetHitCount] = useState<number>(Math.floor(Math.random() * 3) + 1);
  const [finishedRevealingSubreddit, setFinishedRevealingSubreddit] = useState<boolean>(false);
  const revealSubredditIntervalLength = 500 / subreddit.length;

  const revealSubredditInterval = useInterval(() => {
    // Keep going until we've revealed the entire subreddit
    if (currentIndex < subreddit.length && !finishedRevealingSubreddit) {
      if (hitCount < targetHitCount) {
        // Remove the last letter and add a random letter
        setCurrentRevealedSubreddit(
          subreddit.substring(0, currentIndex) +
          letters[Math.floor(Math.random() * letters.length)]
        );
        setHitCount((prev) => prev + 1);
      } else {
        setCurrentRevealedSubreddit(
          subreddit.substring(0, currentIndex) +
          subreddit[currentIndex]
        );
        setHitCount(0);
        setTargetHitCount(Math.floor(Math.random() * 5) + 1);
        setCurrentIndex((prev) => prev + 1);
      }
    } else {
      if (!revealWinningPost) {
        console.log('Stopping interval Subreddit');
        revealSubredditInterval.stop(); 
        revealPostInterval.start();
        setRevealWinningPost(true);
        setCurrentRevealedSubreddit(subreddit);
        setFinishedRevealingSubreddit(true);
      }
    }
  }, revealSubredditIntervalLength);


  const [questionMarkColor, setQuestionMarkColor] = useState<string>('black');
  const [colorChangeCount, setColorChangeCount] = useState<number>(0);
  const [finishedRevealingPost, setFinishedRevealingPost] = useState<boolean>(false);

  const revealPostInterval = useInterval(() => {
    if (questionMarkColor === 'black') {
      setQuestionMarkColor(Math.random() < oddsToShowGreen ? 'green' : 'red');
    } else if (questionMarkColor === 'red') {
      setQuestionMarkColor(Math.random() < oddsToShowGreen ? 'green' : 'black');
    } else {
      setQuestionMarkColor('black');
    }
    setColorChangeCount((prev) => prev + 1);
    if (colorChangeCount >= 8) {
      console.log('Stopping interval Post');
      revealPostInterval.stop();
      setFinishedRevealingPost(true);
      props.setUserScore(props.userScore + (isWin ? props.payoutData.payoutAmount : 0));
    }
  }, 250);

  revealSubredditInterval.start();

  return (
    <vstack width="100%" height="100%" alignment="center middle">
      <spacer height="128px" />
      <hstack width="100%" grow>
        <vstack gap="none" height="100%" grow alignment="center">
          <hstack border='thin' borderColor='black' backgroundColor="white" width="65%" padding='small' height="96px">
            <vstack grow>
            <hstack>
              <StyledText 
                color='blue' 
                size='large' 
                onPress={() => {
                if (finishedRevealingSubreddit) {
                  context.ui.navigateTo(`https://www.reddit.com/r/${subreddit}`);
                }
                }}
              >
                r/{revealingWinningSubreddit}
              </StyledText>
              <spacer grow />
            </hstack>
            <spacer minHeight='12px' />
            {!finishedRevealingSubreddit ? null : !finishedRevealingPost ? (
              <StyledText size='xlarge' color={questionMarkColor}>??? ??? ???</StyledText>
            ) : (
              <StyledText
              color='blue'
              onPress={() => {
              context.ui.navigateTo(`https://www.reddit.com${chosenPost.postLink}`);
              }} size='xlarge'>
              {postTitle}
              </StyledText>
            )}
            <hstack>
              <spacer grow />
              {finishedRevealingPost && (
                <StyledText size='medium'>⬆ {chosenPost.upvotes.toString()}</StyledText>
              )}
            </hstack>
            </vstack>
          </hstack>
          <spacer height="16px" />
          {finishedRevealingPost && (
            <StyledText size='large'>Winning Letter: {winningLetter}</StyledText>
          )}
          <spacer height="16px" />
          {finishedRevealingPost && (
            isWin ? (
              <>
              <StyledText size='large'>Congratulations!</StyledText>
              <StyledText size='large'>You won {formatScore(payoutAmount)} points!</StyledText>
              </>
            ) : (
              <StyledText size='large'>Better luck next time!</StyledText>
            )
          )}
          <spacer height="16px" />
          {finishedRevealingPost && (
            <hstack gap="small">
            <StyledButton width="100px" height="32px" appearance="back" label="Play Again" onPress={props.playAgain} />
            </hstack>
          )}
        </vstack>
      </hstack> 
    </vstack>
  );
};
