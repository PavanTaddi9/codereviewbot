import { IHttp, IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { ISlashCommand, SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { PromptFactory } from "../core/promptfactory";
import { Llama3_70B } from "../core/llm/llama3";
import { handleCommandResponse } from "../utils/handleResponse";
import { GenerateGitDiff } from "../core/gitpr/GenerateGitDiff";
import { GitHubPRFetcher } from "../core/gitpr/GitHubPRFetcher";
require('dotenv').config();

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
        pr = await getpr.getLatestPRDetails();  // Add error handling for PR fetching
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
      return answer;
    } catch (error) {
      console.error("Error in processing PR analysis:", error);
      throw new Error("Failed to process PR analysis");
    }
  }
  

  // Executor method for handling slash command execution
  public async executor(
    context: SlashCommandContext,
    read: IRead,
    modify: IModify,
    http: IHttp
  ): Promise<void> {
    try {
      const query = context.getArguments().join(" ");
      if (!query) return; // Ignore empty queries

      // Send an edited message to the user
      const sendEditedMessage = await handleCommandResponse(
        query,
        context.getSender(),
        context.getRoom(),
        modify,
        this.command
      );
      if (!Gittoken || !ghrepo || !ghowner) {
        console.error("GitHub token is missing.");
        await sendEditedMessage("Error: Missing GitHub token.");
        return;
      }
      // Process the PR and send the response
      const res = await this.process(http, Gittoken, ghrepo, ghowner);
      await sendEditedMessage(res);
    } catch (error) {
      console.error("Error in executing slash command:", error);
    
    }
  }
}
