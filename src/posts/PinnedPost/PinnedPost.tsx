import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { LoadingState } from '../../components/LoadingState.js';
import { StyledButton } from '../../components/StyledButton.js';
import { Service } from '../../service/Service.js';
import { HowToPlayPage } from '../../components/Pages/HowToPlayPage.js';
import { LeaderboardPage } from '../../components/Pages/LeaderboardPage.js';
import { PlaceBetStep } from '../../components/Pages/PlaceBetStep.js';
import type { PostData } from '../../types/PostData.js';
import { UserData } from '../../types/UserData.js';
import { AppHeader } from '../../components/AppHeader.js';

const menuButtonWidth = '200px';
const menuButtonHeight = '62px';

interface PinnedPostProps {
  postData: PostData;
  userData: UserData;
  username?: string;
  activeFlairId?: string;
}

export const PinnedPost = (props: PinnedPostProps, context: Context): JSX.Element => {
  const service = new Service(context);
  const [page, setPage] = useState('menu');

  const { data: user, loading } = useAsync<{
    rank: number;
    score: number;
  }>(async () => {
    return await service.getUserScore(props.username);
  });

  if (user === null || loading) {
    return <LoadingState />;
  }

  const [score, setScore] = useState<number>(props.userData.score);

  const Menu = (
    <>
    <AppHeader userScore={score} />
    <vstack width="100%" height="100%" alignment="center middle">
      {/* Logo Image */}
      <image
        url={
      `data:image/svg+xml,
        <svg height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
             viewBox="0 0 511.984 511.984" xml:space="preserve">
        <path style="fill:#FFCE54;" d="M491.859,156.355c-12.891-30.483-31.342-57.857-54.857-81.372
            c-23.5-23.5-50.889-41.952-81.357-54.858C324.084,6.782,290.553,0,255.992,0c-34.554,0-68.083,6.781-99.645,20.125
            c-30.483,12.906-57.865,31.358-81.373,54.858c-23.499,23.515-41.959,50.889-54.85,81.372C6.774,187.916,0,221.447,0,255.992
            c0,34.56,6.773,68.091,20.125,99.652c12.89,30.484,31.351,57.857,54.85,81.373c23.507,23.5,50.889,41.967,81.373,54.857
            c31.562,13.344,65.091,20.109,99.645,20.109c34.561,0,68.092-6.766,99.652-20.109c30.469-12.891,57.857-31.357,81.357-54.857
            c23.516-23.516,41.967-50.889,54.857-81.373c13.344-31.561,20.125-65.092,20.125-99.652
            C511.984,221.447,505.203,187.916,491.859,156.355z"/>
        <path style="fill:#ED5564;" d="M406.83,105.154c-40.279-40.296-93.856-62.483-150.838-62.483s-110.551,22.187-150.847,62.482
            c-40.287,40.296-62.482,93.872-62.482,150.839c0,56.982,22.195,110.558,62.482,150.853c40.295,40.297,93.864,62.482,150.847,62.482
            s110.559-22.186,150.838-62.482c40.297-40.295,62.498-93.871,62.498-150.853C469.328,199.025,447.127,145.449,406.83,105.154z"/>
        <g>
            <path style="fill:#434A54;" d="M174.315,453.189c25.546,10.594,53.186,16.139,81.677,16.139v-213.32L174.315,453.189z"/>
            <path style="fill:#434A54;" d="M337.678,58.811c-25.562-10.593-53.188-16.14-81.686-16.14v213.337L337.678,58.811z"/>
            <path style="fill:#434A54;" d="M337.678,453.189c25.545-10.578,49.014-26.203,69.152-46.344L255.992,256.008L337.678,453.189z"/>
            <path style="fill:#434A54;" d="M174.315,58.811c-25.554,10.578-49.022,26.202-69.17,46.343l150.847,150.854L174.315,58.811z"/>
        </g>
        <path style="fill:#A0D468;" d="M453.189,337.678c10.576-25.547,16.139-53.186,16.139-81.685H255.992L453.189,337.678z"/>
        <g>
            <path style="fill:#434A54;" d="M58.795,174.323c-10.585,25.546-16.132,53.186-16.132,81.669h213.329L58.795,174.323z"/>
            <path style="fill:#434A54;" d="M453.189,174.323c-10.578-25.562-26.203-49.014-46.359-69.169L255.992,255.992L453.189,174.323z"/>
            <path style="fill:#434A54;" d="M58.795,337.678c10.585,25.561,26.21,49.029,46.35,69.168l150.847-150.854L58.795,337.678z"/>
        </g>
        <path style="fill:#FFCE54;" d="M350.926,256.008c0,52.419-42.498,94.933-94.934,94.933s-94.942-42.514-94.942-94.933
            c0-52.436,42.507-94.95,94.942-94.95S350.926,203.572,350.926,256.008z"/>
        <path style="fill:#E6E9ED;" d="M348.863,135.543c-4.156,4.171-10.92,4.171-15.092,0c-4.156-4.156-4.156-10.922,0-15.078
            c4.172-4.172,10.936-4.172,15.092,0C353.019,124.621,353.019,131.387,348.863,135.543z"/>
        <g>
            <path style="fill:#434A54;" d="M255.992,319.99c-5.89,0-10.664-4.766-10.664-10.656V202.666c0-5.891,4.773-10.671,10.664-10.671
                c5.891,0,10.664,4.781,10.664,10.671v106.668C266.656,315.224,261.883,319.99,255.992,319.99z"/>
            <path style="fill:#434A54;" d="M309.334,266.664H202.658c-5.891,0-10.664-4.766-10.664-10.671c0-5.875,4.773-10.656,10.664-10.656
                h106.676c5.875,0,10.656,4.781,10.656,10.656C319.99,261.898,315.209,266.664,309.334,266.664z"/>
        </g>
        <path style="fill:#656D78;" d="M255.992,223.993c-17.648,0-31.999,14.358-31.999,31.999c0,17.656,14.351,31.998,31.999,31.998
            c17.656,0,31.998-14.342,31.998-31.998C287.99,238.352,273.648,223.993,255.992,223.993z"/>
        </svg>`
      }
        imageHeight={128}
        imageWidth={128}
        width="64px"
        height="64px"
        description="Roullette wheel"
      />
      <spacer height="16px" />

      {/* Logo Text */}
      <image url="menu_logo.png" imageWidth="200px" imageHeight="50px" description="Menu Logo"/>
      <spacer height={"12px"} />

      {/* Menu */}
      <vstack alignment="center middle" gap="small">
        <StyledButton
          width={menuButtonWidth}
          appearance="black"
          height={menuButtonHeight}
          onPress={() => setPage('placeBet')}
          label="Play"
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
    </>
  );

  const onClose = (): void => {
    setPage('menu');
  };

  const pages: Record<string, JSX.Element> = {
    menu: Menu,
    rules: <HowToPlayPage onClose={onClose} />,
    placeBet: <PlaceBetStep setUserScore={setScore} userScore={score} {...props} onBack={onClose} />,
    leaderboard: <LeaderboardPage onClose={onClose} username={props.username} />,
  };

  return pages[page] || Menu;
};
