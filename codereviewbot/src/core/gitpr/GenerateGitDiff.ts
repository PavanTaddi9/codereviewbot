import { IHttp } from '@rocket.chat/apps-engine/definition/accessors';
import { GitHubPRFetcher } from './GitHubPRFetcher';

export class GenerateGitDiff {
  private http: IHttp;
  private owner: string;
  private repo: string;
  private githubToken: string;

  constructor(http: IHttp, owner: string, repo: string, githubToken: string) {
    this.http = http;
    this.owner = owner;
    this.repo = repo;
    this.githubToken = githubToken;
  }

  public async generateDiffForLatestPR(): Promise<{ 
    prNumber: number;
    prTitle: string;
    prDescription: string;
    diff: string;
  }> {
    try {
      // Instantiate the GitHubPRFetcher to fetch PR and issue details
      const prFetcher = new GitHubPRFetcher(this.http, this.owner, this.repo, this.githubToken);

      // Get the latest PR details
      const prData = await prFetcher.getLatestPRDetails();

      // Extract the necessary information from PR details
      const { prNumber, prTitle, prDescription, diff } = prData;

      // Return the PR details along with the Git diff
      return {
        prNumber,
        prTitle,
        prDescription,
        diff
      };
    } catch (error) {
      throw new Error(`Error generating diff for the latest PR: ${error}`);
    }
  }
}
