import { IHttp, IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { ISlashCommand, SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { PromptFactory } from "../core/promptfactory";
import { Llama3_70B } from "../core/llm/llama3";
import { GitHubPRFetcher } from "../core/gitpr/GitHubPRFetcher";
import * as dotenv from 'dotenv';


dotenv.config();

// Ensure environment variables are loaded correctly
const Gittoken = process.env.GITHUB_TOKEN;
const ghrepo = process.env.REPO_NAME;
const ghowner = process.env.REPO_OWNER;

if (!Gittoken || !ghrepo || !ghowner) {
  console.error("Missing required environment variables: GITHUB_TOKEN, REPO_NAME, REPO_OWNER.");
  process.exit(1);
}

export class Analysepr implements ISlashCommand {
  public command = "rcc-analysepr";
  public i18nParamsExample = "";
  public i18nDescription = "";
  public providesPreview = false;

  private async process(http: IHttp, Gittoken: string, ghrepo: string, ghowner: string): Promise<any> {
    try {
      const getpr = new GitHubPRFetcher(http, ghowner, ghrepo, Gittoken);
      const llm = new Llama3_70B(http);

      let pr;
      try {
        pr = await getpr.getLatestPRDetails();
      } catch (prError) {
        console.error("Error fetching PR details:", prError);
        throw new Error("Failed to fetch PR details");
      }

      const prtitle = pr.prTitle;
      const prdesc = pr.prDescription;
      const issuetitle = pr.issueTitle;
      const issuedesc = pr.issueDescription;
      const diff = pr.diff;

      const prompt = PromptFactory.makeAskCodePrompt(prtitle, prdesc, issuetitle, issuedesc, diff);
      const answer = await llm.ask(prompt);
      
      console.log("LLM Response:", answer);
    } catch (error) {
      console.error("Error in processing PR analysis:", error);
    }
  }

  public async executor(
    context: SlashCommandContext,
    read: IRead,
    modify: IModify,
    http: IHttp
  ): Promise<void> {
    try {
      const query = context.getArguments().join(" ");
      if (!query) return;

      if (!Gittoken || !ghrepo || !ghowner) {
        console.error("GitHub token is missing.");
        return;
      }
      
      await this.process(http, Gittoken, ghrepo, ghowner);
    } catch (error) {
      console.error("Error in executing slash command:", error);
    }
  }
}
