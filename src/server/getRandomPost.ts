import { Post, RedditAPIClient } from '@devvit/public-api';
import { ChosenPostData } from "../types/BetData.js";
import Settings from '../settings.json';


// export async function getRandomPost(reddit: RedditAPIClient): Promise<ChosenPostData> {
//     const maxAttempts = 10;
//     let attempts = 0;
//     while (attempts < maxAttempts) {
//       try {
//         const randomPost = await selectRandomPost(reddit);
//         const scrubbedPostTitle = randomPost.title.toUpperCase().replace(/[^A-Z]/g, '');
//         if (isValidPost(randomPost, scrubbedPostTitle)) {
//           const firstLetter = scrubbedPostTitle[0];
//           return {
//             subreddit: randomPost.subredditName,
//             postTitle: randomPost.title,
//             winningLetter: firstLetter,
//             postLink: randomPost.permalink
//           }
//         } else {
//           console.log('Skipping invalid post:', randomPost.title);
//         }
//       } catch (error) {
//         console.error('Error selecting random post:', error);
//       }
      
//       attempts++;
//     }

//     throw new Error(`Failed to select a valid random post after ${maxAttempts} attempts`);
// }


// function isValidPost(post: Post, scrubbedPostTitle: string): boolean {
//     return !post.isNsfw() && !post.isSpoiler() && !post.isLocked() && scrubbedPostTitle.length > 0;
// }

export async function selectRandomPost(reddit: RedditAPIClient): Promise<Post> {
    // Select a random subreddit from the list
    const subreddits = Settings.game.searchSubreddits;
    const chosenSubredditName = subreddits[Math.floor(Math.random() * subreddits.length)];
    console.log('Chosen Random Subreddit: ', chosenSubredditName);

    // Select a random post from the chosen subreddit
    const topPosts = await getPostsFromSubreddit(reddit, chosenSubredditName);

    if (!topPosts) {
        throw new Error('Failed to fetch top posts');
    }

    return topPosts[Math.floor(Math.random() * topPosts.length)];
}

async function getPostsFromSubreddit(reddit: RedditAPIClient, subredditName: string): Promise<Post[]> {
    const topPosts = await reddit.getTopPosts({
        timeframe: 'week',
        subredditName: subredditName,
        limit: 10,
    }).all();

    if (!topPosts) {
        throw new Error('Failed to fetch top posts');
    }

    return topPosts;
}