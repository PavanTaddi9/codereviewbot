import { IHttp, IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { ISlashCommand, SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import { PromptFactory } from "../core/promptfactory";
import { Llama3_70B } from "../core/llm/llama3";
import { GitHubPRFetcher } from "../core/gitpr/GitHubPRFetcher";
import { IMessageBuilder } from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { App } from "@rocket.chat/apps-engine/definition/App";

export class Analysepr implements ISlashCommand {
    public command = "rcc-analysepr";
    public i18nParamsExample = "";
    public i18nDescription = "ANALYSEPR_DESCRIPTION";
    public providesPreview = false;
    private readonly app: App;

    constructor(app: App) {
        this.app = app;
    }


    


    private async process(
        http: IHttp,
        Gittoken: string,
        ghrepo: string,
        ghowner: string,
        modify: IModify,
        context: SlashCommandContext
    ): Promise<void> {
        try {
            console.log("🔍 [process] Starting PR analysis...");

            const getpr = new GitHubPRFetcher(http, ghowner, ghrepo, Gittoken);
            const pr = await getpr.getLatestPRDetails();
            console.log("✅ [process] PR Fetched:", pr);

            const prompt = PromptFactory.makeAskCodePrompt(
                pr.prTitle,
                pr.prDescription,
                pr.issueTitle,
                pr.issueDescription,
                pr.diff
            );
            console.log("✅ [process] Prompt Generated");

            const llm = new Llama3_70B(http);
            const answer = await llm.ask(prompt);
            console.log("✅ [process] LLM Response Received");

            const room: IRoom = context.getRoom();
            const sender = context.getSender();
            const messageBuilder: IMessageBuilder = modify.getCreator()
                .startMessage()
                .setSender(sender)
                .setRoom(room)
                .setText(`✅ Analysis Result:\n${answer}`);

            await modify.getCreator().finish(messageBuilder);
            console.log("✅ [process] Response sent");

        } catch (error) {
            console.error("❌ [process] Error:", this.formatError(error));
            throw error;
        }
    }

    private formatError(error: unknown): string {
        try {
            if (error instanceof Error) {
                return JSON.stringify({
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                }, null, 2);
            }
            return JSON.stringify(error, null, 2);
        } catch {
            return String(error);
        }
    }

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp
    ): Promise<void> {
        try {
            console.log("🚀 [executor] Initializing...");
            
          
            
            const Gittoken: string = await this.app
            .getAccessors()
            .environmentReader.getSettings()
            .getValueById('gittoken');
            const ghowner: string = await this.app
            .getAccessors()
            .environmentReader.getSettings()
            .getValueById('repowner');
            const ghrepo: string = await this.app
            .getAccessors()
            .environmentReader.getSettings()
            .getValueById('reponame');

            

            await this.process(http, Gittoken, ghrepo, ghowner, modify, context);

        } catch (error) {
            console.error("❌ [executor] Critical error:", this.formatError(error));
            
            try {
                const errorText = `⚠️ Analysis Failed:\n\`\`\`json\n${this.formatError(error)}\n\`\`\``;
                const message = modify.getCreator()
                    .startMessage()
                    .setSender(context.getSender())
                    .setRoom(context.getRoom())
                    .setText(errorText);

                await modify.getCreator().finish(message);
            } catch (sendError) {
                console.error("❌ [executor] Error message delivery failed:", this.formatError(sendError));
            }
        }
    }
}