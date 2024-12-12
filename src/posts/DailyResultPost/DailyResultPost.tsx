import { Context, Devvit, useAsync, useInterval, useState } from '@devvit/public-api';
import { StyledText } from '../../components/StyledText.js';
import { ChosenPostData } from '../../types/BetData.js';

interface DailyResultPostProps {
  chosenPost: ChosenPostData;
  date: string;
  username?: string;
}

export const DailyResultPost = (
  props: DailyResultPostProps, context: Context
): JSX.Element => {
  const { chosenPost, date } = props;
  const { subreddit, postTitle, winningLetter } = chosenPost;

  return (
    <vstack width="100%" height="100%" alignment="center middle">
      <spacer height="32px" />
      <hstack width="100%" grow>
        <vstack gap="none" height="100%" grow alignment="center">
          <image resizeMode='cover' url="daily_logo.png" imageWidth="200px" imageHeight="100px" description="Daily Logo"/>
          <StyledText size='xlarge'>{date}</StyledText>
          <spacer height="12px" />
          <image url={`win_letters/pulsing_${winningLetter.toLowerCase()}.gif`} imageHeight='120px' imageWidth='120px' description="Letter Animation" />
          <hstack border='thin' borderColor='black' backgroundColor="white" width="65%" padding='small' height="96px">
            <vstack grow>
            <hstack>
              <StyledText 
                color='blue' 
                size='large' 
                onPress={() => {
                  context.ui.navigateTo(`https://www.reddit.com/r/${subreddit}`);
                }}
              >
                r/{chosenPost.subreddit}
              </StyledText>
              <spacer grow />
            </hstack>
            <spacer minHeight='12px' />
              <StyledText
              color='blue'
              onPress={() => {
              context.ui.navigateTo(`https://www.reddit.com${chosenPost.postLink}`);
              }} size='xlarge'>
              {postTitle}
              </StyledText>
            <hstack>
              <spacer grow />
                <StyledText size='medium'>⬆ {chosenPost.upvotes.toString()}</StyledText>
            </hstack>
            </vstack>
          </hstack>
          <spacer height="24px" />
        </vstack>
      </hstack> 
    </vstack>
  );
};
