import { Devvit } from '@devvit/public-api';
import { LoadingState } from './components/LoadingState.js';
import { Service } from './service/Service.js';
import Settings from './settings.json';
import { Router } from './posts/Router.js';
import { getTodaysDate } from './utils/datetime.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
  http: true,
});

Devvit.addCustomPostType({
  name: 'Rouleddit',
  description: 'Predict which letter will be first from a randomly chosen post Reddit post!',
  height: 'tall',
  render: Router,
});

/*
 * Installation
 */
Devvit.addMenuItem({
  label: '[Install] Rouleddit',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { ui, reddit } = context;
    const service = new Service(context);
    const community = await reddit.getCurrentSubreddit();

    // Check if post flairs are enabled in the subreddit
    if (!community.postFlairsEnabled) {
      ui.showToast('Enable post flairs first');
      return;
    }

    // Create the pinned post
    const post = await reddit.submitPost({
      title: Settings.pinnedPost.title,
      subredditName: community.name,
      preview: <LoadingState />,
    });

    const existingFlairs = await reddit.getUserFlairTemplates(community.name);

    const getOrCreateFlair = async (text: string, backgroundColor: string) => {
      let flair = existingFlairs.find((f) => f.text === text);
      if (!flair) {
        console.log(`Creating flair: ${text}`);
        flair = await reddit.createUserFlairTemplate({
          subredditName: community.name,
          text,
          textColor: 'dark',
          backgroundColor,
        });
      }
      return flair;
    };

    const [topPlayer1Flair, topPlayer2Flair, topPlayer3Flair, topPlayer4Flair, topPlayer5Flair] = await Promise.all([
      getOrCreateFlair('Rank #1', '#FFD700'), // Gold
      getOrCreateFlair('Rank #2', '#C0C0C0'), // Silver
      getOrCreateFlair('Rank #3', '#CD7F32'), // Bronze
      getOrCreateFlair('Rank #4', '#FF4500'), // Orange
      getOrCreateFlair('Rank #5', '#FF6347'), // Tomato
    ]);

    const [_sticky, _storeData, gameFlair] = await Promise.all([
      // Pin the post
      await post.sticky(),

      // Store the pinned post id
      await service.savePinnedPost(post.id),

      // Create the game "Game" flair for the primary post
      await reddit.createPostFlairTemplate({
        subredditName: community.name,
        text: 'Game',
        textColor: 'dark',
        backgroundColor: '#FF4500',
      }),

      await reddit.createPostFlairTemplate({
        subredditName: community.name,
        text: 'Daily Post',
        textColor: 'dark',
        backgroundColor: '#ADD8E6',
      }),

      // We want to create user flairs for the top 10 players
    ]);

    await Promise.all([
      // Update the post with the game flair
      await reddit.setPostFlair({
        subredditName: community.name,
        postId: post.id,
        flairTemplateId: gameFlair.id,
      }),

      // Save the flair ids for the top 5 players
      await service.initSaveTopFlairs(topPlayer1Flair.id, topPlayer2Flair.id, topPlayer3Flair.id, topPlayer4Flair.id, topPlayer5Flair.id),
    ]);

    ui.showToast('Installed Rouleddit!');
  },
});

Devvit.addMenuItem({
  label: '[Uninstall] Rouleddit',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { ui, reddit } = context;
    const service = new Service(context);
    const community = await reddit.getCurrentSubreddit();

    const pinnedPostId = await service.getPinnedPostId();
    const pinnedPost = await reddit.getPostById(pinnedPostId);

    // Unpin the post
    await pinnedPost.unsticky();

    // Delete the post
    await pinnedPost.delete();

    // Delete the pinned post data
    await service.deletePinnedPost();

    // Delete the Associated Post Flairs
    const flairs = await reddit.getPostFlairTemplates(community.name);
    const gameFlair = flairs.find((flair) => flair.text === 'Game');
    if (gameFlair) {
      await gameFlair.delete();
    }

    // Delete all the User Flairs
    const userFlairs = await reddit.getUserFlairTemplates(community.name);
    await Promise.all(userFlairs.map(async (flair) => {
      await flair.delete();
      console.log(`Deleted flair: ${flair.text}`);
    }));

    ui.showToast('Uninstalled Rouleddit!');
  },
});

/*
 * Scheduled
 */
const UPDATE_TOP_PLAYERS_FLAIRS = 'updateTopPlayersFlairs';
const POST_DAILY = 'postDaily';

Devvit.addSchedulerJob({
  name: UPDATE_TOP_PLAYERS_FLAIRS,
  onRun: async (_, context) => {
    const service = new Service(context);
    await service.updateTopPlayerFlairs()
  },
});

Devvit.addSchedulerJob({
  name: POST_DAILY,
  onRun: async (_, context) => {
    // @ts-ignore
    await executeDailyPost(context); 
  },
});

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_, context) => {
    try {
      await context.scheduler.runJob({
        cron: '0 17 * * *', // Midday America/New_York
        name: POST_DAILY,
        data: {},
      });
      await context.scheduler.runJob({
        cron: '*/15 * * * *',  // Every 15 minutes
        name: UPDATE_TOP_PLAYERS_FLAIRS,
        data: {},
      });
    } catch (e) {
      console.log('error was not able to schedule:', e);
      throw e;
    }
  },
});

/*
 * Test
*/
Devvit.addMenuItem({
  label: '[Test] Manually Perform Daily Post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    await executeDailyPost(context);
  }
});

Devvit.addMenuItem({
  label: '[Test] Manual Update Top Players Flairs',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const service = new Service(context);
    await service.updateTopPlayerFlairs();
    context.ui.showToast('Updated top players flairs');
  }
});

Devvit.addMenuItem({
  label: '[Test] Reset Player Gift',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const service = new Service(context);
    const user = await context.reddit.getCurrentUser();
    await service.resetDailyGift(user!.username);
    context.ui.showToast('Reset player gift');
  }
});

Devvit.addMenuItem({
  label: '[Test] Give Yourself Points',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const service = new Service(context);
    const user = await context.reddit.getCurrentUser();
    await service.addToUserScore(user!.username, 1000);
    context.ui.showToast('Gave 1000 to yourself');
  }
});

Devvit.addMenuItem({
  label: '[Test] Show Scheduled Jobs',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const jobs = await context.scheduler.listJobs();
    context.ui.showToast(`Scheduled Jobs: ${jobs.length} - ${jobs.map((job) => job.name).join(', ')}`);
  }
});

Devvit.addMenuItem({
  label: '[Test] Reset Player',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const service = new Service(context);
    const user = await context.reddit.getCurrentUser();
    await service.resetPlayer(user!.username);
    context.ui.showToast('Reset player');
  }
});


export default Devvit;


/**
 * Executes the daily post routine for the subreddit.
 *
 * This function performs the following steps:
 * 1. Retrieves the current subreddit.
 * 2. Gets today's date.
 * 3. Initializes the service with the provided context.
 * 4. Retrieves all daily bets and logs the count.
 * 5. Selects a random post and logs the chosen post.
 * 6. Pays out the daily winners based on the chosen post's winning letter.
 * 7. Creates a daily post in the subreddit with the winning details.
 * 8. Saves the daily post information.
 * 9. Updates the post with the "Daily Reveal" flair if available.
 * 10. Shows a toast notification and navigates to the created post.
 *
 * @param {Devvit.Context} context - The context object containing the Reddit API and UI utilities.
 * @returns {Promise<void>} A promise that resolves when the daily post routine is complete.
 */
async function executeDailyPost(context: Devvit.Context) {
  const { reddit } = context;
  const community = await reddit.getCurrentSubreddit();
  const todaysDate = getTodaysDate();
  const service = new Service(context);

  const dailyBets = await service.getAllDailyBets();
  console.log('there are', dailyBets.length, 'daily bets');

  const chosenPost = await service.getRandomPost();
  console.log('chosen post', chosenPost);

  await service.payoutDailyWinners(chosenPost.winningLetter, dailyBets);
  console.log('payout done');

  const post = await reddit.submitPost({
    title: `Rouleddit: Daily - ${todaysDate}`,
    subredditName: community.name,
    textFallback: {
      text: `Daily Bet: ${todaysDate}. \n\nThe winning letter is: ${chosenPost.winningLetter} \n\nThe winning post is: ${chosenPost.postTitle} \n\nFrom The Subreddit: ${chosenPost.subreddit}`,
    },
    preview: <LoadingState />,
  });
  await service.saveDailyPost(post.id, chosenPost);
  console.log('daily post created', post.title);


  const flairs = await reddit.getPostFlairTemplates(community.name);
  const dailyRevealFlair = flairs.find((flair) => flair.text === 'Daily Post');
  if (dailyRevealFlair) {
    await reddit.setPostFlair({
      subredditName: community.name,
      postId: post.id,
      flairTemplateId: dailyRevealFlair.id,
    });
  }

  context.ui.showToast('Performed daily post');
  context.ui.navigateTo(post.url);
}
