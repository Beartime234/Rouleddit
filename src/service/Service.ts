import {
  ZRangeOptions,
  type Post,
  type RedditAPIClient,
  type RedisClient,
  type Scheduler,
} from '@devvit/public-api';
import type { PostData } from '../types/PostData.js';
import type { UserData } from '../types/UserData.js';
import type { Bet, ChosenPostData, PayoutData } from '../types/BetData.js';
import { BetTypeMultiplier, BetType } from '../types/BetData.js';
import Settings from '../settings.json';
import { ScoreBoardEntry } from '../types/ScoreBoardEntry.js';
import { FlairData, Flairs, FlairsRankingArray } from '../types/FlairData.js';


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

  // User Flairs
  async updateTopPlayerFlairs(): Promise<void> {
    const community = await this.reddit?.getCurrentSubreddit();
    
    // First we need to get the top 5 players
    let topScores = await this.getScores(5);

    // Remove any undefined
    topScores = topScores.filter(player => player.member !== undefined);
    
    // Get the top 5 flairs
    const flairs = await Promise.all(
      FlairsRankingArray.map(async (flair) => {
        return await this.getFlair(flair);
      })
    );

    // Loop through the top 5 players and update their flairs
    await Promise.all(
      topScores.map(async (player, index) => {
        const flairId = flairs[index].flairId;
        const username = player.member;

        console.log('Setting flair for', username, 'with flair id', flairId);

        // if the user is already assigned to the flair, skip
        if (flairs[index].assignedTo === username) {
          console.log('User already assigned to flair', username);
          return;
        }

        // Remove the old flair
        console.log('Removing flair for', username);
        await this.reddit!.removeUserFlair(community!.name, username);
        
        // Update the flair
        console.log('Setting flair for', username);
        await this.reddit!.setUserFlair({
          subredditName: community!.name,
          flairTemplateId: flairId,
          username: username,
        });

        // Save the flair data to the database
        await this.saveFlair(FlairsRankingArray[index], flairId, username);
      })
    );
  }

  #flairKey(flair: Flairs): string {
    return `userFlair:${flair}`;
  }

  async getFlair(flair: Flairs): Promise<FlairData> {
    const flairData = await this.redis.hGetAll(this.#flairKey(flair));
    if (!flairData.flairId) {
      throw new Error(`Flair ID for ${flair} not found`);
    }
    return {
      flairId: flairData.flairId,
      assignedTo: flairData.assignedTo,
    };
  }

  async saveFlair(flair: Flairs, flairId: string, username?: string): Promise<void> {
    await this.redis.hSet(this.#flairKey(flair), {
      flairId: flairId,
      assignedTo: username ?? '',
    });
  }

  async initSaveTopFlairs(flairOneId: string, flairTwoId: string, flairThreeId: string, flairFourId: string, flairFiveId: string): Promise<void> {
    console.log('Saving top flairs');
    await Promise.all([
      this.saveFlair(Flairs.First, flairOneId),
      this.saveFlair(Flairs.Second, flairTwoId),
      this.saveFlair(Flairs.Third, flairThreeId),
      this.saveFlair(Flairs.Fourth, flairFourId),
      this.saveFlair(Flairs.Fifth, flairFiveId),
    ]);
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

  async getScores(maxLength: number = 10): Promise<ScoreBoardEntry[]> {
    const options: ZRangeOptions = { reverse: true, by: 'rank' };
    return await this.redis.zRange(this.#scoreKey, 0, maxLength - 1, options);
  }

  async getUserScore(username?: string): Promise<{
    rank: number;
    score: number;
  }> {
    const defaultValue = { rank: -1, score: 100 };
    if (!username) return defaultValue;
    try {
      const [rank, score] = await Promise.all([
        this.redis.zRank(this.#scoreKey, username),
        // TODO: Remove .zScore when .zRank supports the WITHSCORE option
        this.redis.zScore(this.#scoreKey, username),
      ]);
      return {
        rank: rank === undefined ? -1 : rank,
        score: score === undefined  ? 0 : score,
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
  
  //** Post Picking */
  async getRandomPost(): Promise<ChosenPostData> {
    const maxAttempts = 10;
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        const randomPost = await this.selectRandomPost();
        const scrubbedPostTitle = randomPost.title.toUpperCase().replace(/[^A-Z]/g, '');
        if (this.isValidPost(randomPost, scrubbedPostTitle)) {
          const firstLetter = scrubbedPostTitle[0];
          console.log('Valid Random Post:', randomPost.title);
          return {
            subreddit: randomPost.subredditName,
            postTitle: randomPost.title,
            winningLetter: firstLetter,
            postLink: randomPost.permalink,
            upvotes: randomPost.score
          }
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
    const topPosts = await this.getPostsFromSubreddit(chosenSubredditName);
  
    if (!topPosts) {
        throw new Error('Failed to fetch top posts');
    }
  
    return topPosts[Math.floor(Math.random() * topPosts.length)];
  }

  private async getPostsFromSubreddit(subredditName: string): Promise<Post[]> {
    const topPosts = await this.reddit!.getTopPosts({
        timeframe: 'week',
        subredditName: subredditName,
        limit: 10,
    }).all();

    if (!topPosts) {
        throw new Error('Failed to fetch top posts');
    }

    return topPosts;
  }

  //** Betting and Payout  **/
  async handleBet(bet: Bet, username: string, winningLetter: string): Promise<PayoutData> {
    const userScore = await this.getUserScore(username);
    if (userScore.score < bet.amount) {
      throw new Error('Insufficient funds to place bet');
    }

    await this.removeFromUserScore(username, bet.amount);

    const isWin = this.isWin(bet.type, winningLetter, bet.letter);
    if (isWin) {
      const payoutAmount = Math.ceil(bet.amount * BetTypeMultiplier[bet.type]);
      await this.addToUserScore(username, payoutAmount);
      return { isWin, payoutAmount };
    } else {
      return { isWin, payoutAmount: 0 };
    }
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


  // Daily Gift
  #dailyGiftKey = (username: string) => `dailyGift:${username}`;

  async getDailyGiftExpiration(username: string): Promise<number | null> {
    const key = this.#dailyGiftKey(username);
    const expiration = await this.redis.expireTime(key);
    return expiration === -1 ? null : expiration;
  }

  async giveDailyGift(username: string): Promise<number> {
    if (await this.hasClaimedTheDailyGift(username)) {
      throw new Error('User has already claimed the daily gift');
    }
    const giftAmount = this.getDailyGiftAmount();
    await this.addToUserScore(username, giftAmount);
    await this.claimDailyGift(username);
    return giftAmount
  }

  async resetDailyGift(username: string): Promise<void> {
    const key = this.#dailyGiftKey(username);
    await this.redis.del(key);
  }

  private async hasClaimedTheDailyGift(username: string): Promise<boolean> {
    const key = this.#dailyGiftKey(username);
    const value = await this.redis.get(key);
    const expiration = await this.redis.expireTime(key);
    console.log('Daily Gift:', value, 'expires in', expiration, 'seconds');
    return value !== undefined;
  }

  private async claimDailyGift(username: string): Promise<void> {
    const key = this.#dailyGiftKey(username);
    await this.redis.set(key, 'claimed')
    await this.redis.expire(key, this.getGiftExpirationTime());
  }

  private getDailyGiftAmount(): number {
    return Math.floor(
      Math.random() * (Settings.game.dailyGift.max - Settings.game.dailyGift.min + 1) +
        Settings.game.dailyGift.min
    );
  }

  private getGiftExpirationTime(): number {
    const secondsUntilMidday = this.getSecondsUntilMidday();
    console.log('Daily Gift expires in', secondsUntilMidday, 'seconds');
    return secondsUntilMidday;
  }

  private getSecondsUntilMidday(): number {
    const now = new Date();
    const laTime = new Date(now.toLocaleString('en-US', { timeZone: Settings.game.dailyGift.timezone }));
    let midday = new Date(laTime);
    midday.setHours(12, 0, 0, 0);
    
    if (laTime > midday) {
      midday.setDate(midday.getDate() + 1);
    }
  
    return Math.floor((midday.getTime() - laTime.getTime()) / 1000);
  }
}



