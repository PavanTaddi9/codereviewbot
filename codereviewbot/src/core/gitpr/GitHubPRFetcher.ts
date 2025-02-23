import { IHttp } from '@rocket.chat/apps-engine/definition/accessors';

export class GitHubPRFetcher {
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

  public async getLatestPRDetails(): Promise<{ 
    prNumber: number;
    prTitle: string;
    prDescription: string;
    issueNumber?: number;
    issueTitle?: string;
    issueDescription?: string;
    issueUrl?: string;
    diff: string;
  }> {
    try {
      // GraphQL query to fetch latest PR details and linked issue
      const query = `
        query {
          repository(owner: "${this.owner}", name: "${this.repo}") {
            pullRequests(first: 1, states: OPEN, orderBy: {field: CREATED_AT, direction: DESC}) {
              nodes {
                number
                title
                body
                closingIssuesReferences(first: 1) {
                  nodes {
                    number
                    title
                    body
                    url
                  }
                }
              }
            }
          }
        }
      `;

      // Fetch PR and issue details using GraphQL
      const response = await this.http.post('https://api.github.com/graphql', {
        headers: {
          'Authorization': `Bearer ${this.githubToken}`,
          'Content-Type': 'application/json'
        },
        data: { query }
      });

      if (!response.data) {
        throw new Error('Failed to fetch PR and issue details.');
      }

      const pullRequest = response.data.data.repository.pullRequests.nodes[0];

      if (!pullRequest) {
        throw new Error('No open pull requests found.');
      }

      const issue = pullRequest.closingIssuesReferences.nodes[0];

      // ✅ Fetch Git diff using GitHub REST API (Corrected)
      const diffUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/pulls/${pullRequest.number}`;
      const diffResponse = await this.http.get(diffUrl, {
        headers: {
          'Authorization': `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3.diff'  // Request diff format
        }
      });

      if (!diffResponse.content) {
        throw new Error('Failed to fetch PR diff.');
      }

      return {
        prNumber: pullRequest.number,
        prTitle: pullRequest.title,
        prDescription: pullRequest.body,
        issueNumber: issue ? issue.number : undefined,
        issueTitle: issue ? issue.title : undefined,
        issueDescription: issue ? issue.body : undefined,
        issueUrl: issue ? issue.url : undefined,
        diff: diffResponse.content
      };
    } catch (error) {
      throw new Error(`Error fetching latest PR details: ${error}`);
    }
  }
}
