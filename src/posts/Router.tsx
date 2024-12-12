import type { Context } from '@devvit/public-api';
import { Devvit, useAsync } from '@devvit/public-api';

import { LoadingState } from '../components/LoadingState.js'
import { PINNED_POST_TYPE, DAILY_REVEAL_POST_TYPE, Service  } from '../service/Service.js';
import type {
  DailyResultPostData,
  PostData,
} from '../types/PostData.js';
import { UserData } from '../types/UserData.js';
import { PinnedPost } from './PinnedPost/PinnedPost.js';
import { DailyResultPost } from './DailyResultPost/DailyResultPost.js';

/*
 * Page Router
 *
 * This is the post type router and the main entry point for the custom post.
 * It handles the initial data loading and routing to the correct page based on the post type.
 */

export const Router: Devvit.CustomPostComponent = (context: Context) => {
  const service = new Service(context);

  const { data: username, loading: usernameLoading } = useAsync<string>(async () => {
    const user = await context.reddit.getCurrentUser();
    return user?.username ?? '';
  });

  const { data: postData, loading: postDataLoading } = useAsync<
    PostData | DailyResultPostData
  >(async () => {
    const postType = await service.getPostType(context.postId!);
    switch (postType) {
      case DAILY_REVEAL_POST_TYPE:
        return await service.getDailyRevealPost(context.postId!);
      default:
        return await service.getPostData(context.postId!);
    }
  });

  const { data: userData, loading: userDataLoading } = useAsync<UserData>(
    async () => {
      return await service.getUser(username!);
    },
    {
      depends: [username],
    }
  );

  if (
    username === null ||
    usernameLoading ||
    postData === null ||
    postDataLoading ||
    userData === null ||
    userDataLoading
  ) {
    return <LoadingState />;
  }

  const postType = postData.postType;
  const postTypes: Record<string, JSX.Element> = {
    [PINNED_POST_TYPE]: (
      <PinnedPost
        postData={postData as PostData}
        userData={userData}
        username={username}
      />
    ),
    [DAILY_REVEAL_POST_TYPE]: (
      <DailyResultPost
        chosenPost={(postData as DailyResultPostData).chosenPost}
        date={(postData as DailyResultPostData).date}
        username={username}
      />
    ),
    // Add more post types here
  };


  return (
    <zstack width="100%" height="100%" alignment="top start">
      <image
        imageHeight={1024}
        imageWidth={2048}
        height="100%"
        width="100%"
        url="background.png"
        description="Rouleddit Background"
        resizeMode="cover"
      />
      {postTypes[postType] || (
        <vstack alignment="center middle" grow>
          <text>Error: Unknown post type</text>
        </vstack>
      )}
    </zstack>
  );
};
