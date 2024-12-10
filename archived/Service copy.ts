import {
  RichTextBuilder,
  User,
  type Post,
  type RedditAPIClient,
  type RedisClient,
  type Scheduler,
} from '@devvit/public-api';
import type { PostData } from '../types/PostData.js';
import type { UserData } from '../types/UserData.js';
import type { Bet } from '../types/BetData.js';
import { BetTypeMultiplier, BetType } from '../types/BetData.js';
import Settings from '../settings.json';


const PINNED_POST_ID_KEY = 'pinned';
export const PINNED_POST_TYPE = 'pinnedPost';
const DEFAULT_POST_TYPE = PINNED_POST_TYPE;


export class Service {
  readonly redis: RedisClient;
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;

  constructor(context: { redis: RedisClient; reddit?: RedditAPIClient; scheduler?: Scheduler }) {
    this.redis = context.redis;
    this.reddit = context.reddit;
    this.scheduler = context.scheduler;
  }

  //** Post Access */
  #postDataKey(postId: string): string {
      return `post:${postId}`;
  }

  #pinnedPostIdKey(): string {
    return this.#postDataKey(PINNED_POST_ID_KEY);
  }

  async getPostType(postId: string): Promise<string> {
    const key = this.#postDataKey(postId);
    const postType = await this.redis.hGet(key, 'postType');
    return postType ?? DEFAULT_POST_TYPE;
  }

  async getPostData(postId: string): Promise<PostData> {
    const key = this.#postDataKey(postId);
    const data = await this.redis.hGetAll(key);
    return {
      postId: data.postId,
      postType: data.postType,
    };
  }

  //* Pinned Post
  async savePinnedPost(postId: string): Promise<void> {
      // Set the Post Data
      await this.redis.hSet(this.#postDataKey(postId), {
        postId: postId,
        postType: PINNED_POST_TYPE,
      });
      // Set the Pinned Post ID 
      await this.redis.set(this.#pinnedPostIdKey(), postId);
  }

  async getPinnedPostId(): Promise<string> {
    const key = this.#pinnedPostIdKey();
    const postId = await this.redis.get(key);
    if (!postId) {
      throw new Error('Pinned post not found');
    }
    return postId;
  }

  async doesPinnedPostExist(): Promise<boolean> {
    const key = this.#pinnedPostIdKey();
    return await this.redis.get(key) !== null;
  }

  async deletePinnedPost(): Promise<void> {
    const postId = await this.getPinnedPostId();
    await this.redis.del(this.#postDataKey(postId));
    await this.redis.del(this.#pinnedPostIdKey());
  }


  //** User Scoring */
  readonly scoresKeyTag: string = 'default';
  readonly #scoreKey: string = `score:${this.scoresKeyTag}`;

  async getUserScore(username?: string): Promise<{
    rank: number;
    score: number;
  }> {
    const defaultValue = { rank: -1, score: 0 };
    if (!username) return defaultValue;
    try {
      const [rank, score] = await Promise.all([
        this.redis.zRank(this.#scoreKey, username),
        // TODO: Remove .zScore when .zRank supports the WITHSCORE option
        this.redis.zScore(this.#scoreKey, username),
      ]);
      return {
        rank: rank === undefined ? -1 : rank,
        score: score === undefined ? 0 : score,
      };
    } catch (error) {
      if (error) {
        console.error('Error fetching user score board entry', error);
      }
      return defaultValue;
    }
  }

  async addToUserScore(username: string, amount: number): Promise<void> {
    console.log('Adding', amount, 'to', username);
    await this.redis.zIncrBy(this.#scoreKey, username, amount);
  }

  async removeFromUserScore(username: string, amount: number): Promise<void> {
    console.log('Removing', amount, 'from', username);
    await this.redis.zIncrBy(this.#scoreKey, username, -amount);
  }


  //** User Access */
  readonly #userDataKey = (username: string) => `users:${username}`;

  async saveUserData(
    username: string,
    data: { [field: string]: string | number | boolean }
  ): Promise<void> {
    const key = this.#userDataKey(username);
    const stringConfig = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value)])
    );
    await this.redis.hSet(key, stringConfig);
  }

  async getUser(username: string): Promise<UserData> {
    const user = await this.getUserScore(username);
    const parsedData: UserData = {
      score: user.score,
    };
    return parsedData;
  }
  
  //** Pick Winner */
  
  /**
   * Posts the winning post to the current subreddit.
   *
   * This method selects a valid random post, retrieves the current subreddit,
   * and submits a new post announcing the daily pick winner.
   *
   * @returns {Promise<{ post: Post, winningLetter: string }>} A promise that resolves to the posted winning post and the winning letter.
   *
   * @throws {Error} If the current subreddit cannot be retrieved or if the post submission fails.
   */
  async postWinningPost(): Promise<{ post: Post, winningLetter: string }> {

    const { post: randomPost, firstLetter } = await this.selectValidRandomPost();

    console.log('Selected Random Post:', randomPost.title);

    const thisSubreddit = await this.reddit?.getCurrentSubreddit();

    if (!thisSubreddit) {
      throw new Error('Failed to get current subreddit so cannot post the winning post');
    }

    const text = new RichTextBuilder()
      .paragraph((cb) => cb.text({ text: '➺ Post: ' })
      .link({ url: randomPost.url, text: randomPost.title }))
      .paragraph((cb) => cb.text({ text: '➺ Subreddit: ' })
      .subredditLink({ showPrefix: true, subredditName: randomPost.subredditName }))
      .paragraph((cb) => cb.text({ text: `➺ Winning letter: ${firstLetter}` }))
      .paragraph((cb) => cb.text({ text: '⚁ ⚂ ⚄' }))
      .paragraph((cb) => cb.text({ text: 'Congratulations to all winners!' }));  
    
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const post = await this.reddit?.submitPost({
      subredditName: thisSubreddit.name,
      title: `Rouleddit: ${formattedDate}`,
      richtext: text,
    });

    if (!post) {
      throw new Error('Failed to post the winning post');
    }

    return { post, winningLetter: firstLetter };
  }

  private async selectValidRandomPost(): Promise<{ post: Post, firstLetter: string }> {
    const maxAttempts = 10;
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        const randomPost = await this.selectRandomPost();
        const scrubbedPostTitle = randomPost.title.toUpperCase().replace(/[^A-Z]/g, '');
        if (this.isValidPost(randomPost, scrubbedPostTitle)) {
          const firstLetter = scrubbedPostTitle[0];
          return { post: randomPost, firstLetter }; // Valid post found
        } else {
          console.log('Skipping invalid post:', randomPost.title);
        }
      } catch (error) {
        console.error('Error selecting random post:', error);
      }
      
      attempts++;
    }
    
    throw new Error(`Failed to select a valid random post after ${maxAttempts} attempts`);
  }

  private isValidPost(post: Post, scrubbedPostTitle: string): boolean {
    return !post.isNsfw() && !post.isSpoiler() && !post.isLocked() && scrubbedPostTitle.length > 0;
  }

  private async selectRandomPost(): Promise<Post> {
    // Select a random subreddit from the list
    const subreddits = Settings.game.searchSubreddits;
    const chosenSubredditName = subreddits[Math.floor(Math.random() * subreddits.length)];
    console.log('Chosen Random Subreddit: ', chosenSubredditName);

    // Select a random post from the chosen subreddit
    const topPosts = await this.reddit?.getTopPosts({
      timeframe: 'week',
      subredditName: chosenSubredditName,
      limit: Settings.game.searchTopPostsLimit,
    }).all();

    if (!topPosts) {
      throw new Error('Failed to fetch top posts');
    }

    return topPosts[Math.floor(Math.random() * topPosts.length)];
  }


  //** Bet */
  #betKey = (username: string) => `user:${username}:bet`;
  #activeBetsKey = 'activeBets';

  async placeBet(bet: Bet): Promise<void> {
    const betData: Bet = {
      username: bet.username,
      type: bet.type,
      amount: bet.amount,
    };
    if (bet.letter) {
      betData.letter = bet.letter;
    }
    const stringBetData = Object.fromEntries(
      Object.entries(betData).map(([key, value]) => [key, String(value)])
    );
    await Promise.all([
      this.removeFromUserScore(bet.username, bet.amount),
      this.redis.hSet(this.#betKey(bet.username), stringBetData),
      this.redis.zAdd(this.#activeBetsKey, { member: bet.username, score: bet.amount })
    ]);
  }

  async getAllBets(): Promise<Bet[]> {
    const response = await this.redis.zRange(this.#activeBetsKey, 0, -1);

    const bets = await Promise.all(response.map(async (key) => {
      const data = await this.redis.hGetAll(this.#betKey(key.member));
      return {
        username: data.username,
        type: data.type as BetType,
        letter: data.letter,
        amount: Number(data.amount),
      };
    }));

    return bets;
  }

  async getBet(username: string): Promise<Bet> {
    const data = await this.redis.hGetAll(this.#betKey(username));
    return {
      username: data.username,
      type: data.type as BetType,
      letter: data.letter,
      amount: Number(data.amount),
    };
  }


  //** Payout  **/
  async payoutWinners(winningLetter: string, bets: Bet[]): Promise<void> {
    const winningBets = bets.filter((bet) => this.isWin(bet.type, winningLetter, bet.letter));
    await Promise.all(winningBets.map((bet: Bet) => {
      const payoutAmount = bet.amount * BetTypeMultiplier[bet.type];
      return this.payoutWinner(bet.username, payoutAmount);
    }));
    // Clear all bets
    await Promise.all([
      this.redis.del(this.#activeBetsKey),
      ...bets.map((bet) => this.redis.del(this.#betKey(bet.username)))
    ]);
  }

  private async payoutWinner(username: string, amount: number): Promise<void> {
    console.log('Paying out', amount, 'to', username);
    await this.addToUserScore(username, amount);
  }

  private isWin(type: BetType, winningLetter: string, letter?: string): boolean {
    switch (type) {
      case BetType.SingleLetter:
        return letter === winningLetter;
      case BetType.AtoI:
        return winningLetter >= 'A' && winningLetter <= 'I';
      case BetType.JtoR:
        return winningLetter >= 'J' && winningLetter <= 'R';
      case BetType.StoZ:
        return winningLetter >= 'S' && winningLetter <= 'Z';
      case BetType.Vowel:
        return 'AEIOU'.includes(winningLetter);
      case BetType.Consonant:
        return 'BCDFGHJKLMNPQRSTVWXYZ'.includes(winningLetter);
      default:
        return false;
    }
  }
}


/**
 * Handles the winning post by performing several actions:
 * 1. Retrieves the current subreddit.
 * 2. Posts the winning post and retrieves the winning letter.
 * 3. Retrieves all bets and pays out the winners based on the winning letter.
 * 4. Sets the flair of the post to 'Result'.
 *
 * @param {RedditAPIClient} reddit - The Reddit API client used to interact with Reddit.
 * @param {Service} service - The service used to handle posting and betting operations.
 * @returns {Promise<Post>} A promise that resolves with the winning post when all actions are completed.
 */
async function handleWinningPost(reddit: RedditAPIClient, service: Service): Promise<Post> {
  const community = await reddit.getCurrentSubreddit();

  const { post, winningLetter } = await service.postWinningPost();
  console.log('Picked Winning Post - Winning Letter:', winningLetter);

  const bets = await service.getAllBets();
  console.log('There are', bets.length, 'bets');

  await service.payoutWinners(winningLetter, bets);
  console.log('Paid Out Winners for Letter:', winningLetter);

  const flairs = await reddit.getPostFlairTemplates(community.name);
  const resultFlair = flairs.find((flair) => flair.text === 'Result');
  if (!resultFlair) {
    console.error('Result flair not found');
  } else {
    await reddit.setPostFlair({
      subredditName: community.name,
      postId: post.id,
      flairTemplateId: resultFlair.id,
    });
  }

  // Return the winning post
  return post;
}