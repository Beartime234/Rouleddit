import { ChosenPostData } from "./BetData.js";

export type PostData = {
  postId: string;
  postType: string;
};


export type DailyResultPostData = PostData & {
  chosenPost: ChosenPostData;
};