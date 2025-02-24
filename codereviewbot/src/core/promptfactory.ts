import { Prompt } from "./prompt";
export namespace PromptFactory {
   export function makeAskCodePrompt(PR: string,PRdes:string,issue:string,issdes:string,diff: string): Prompt {
     const prompt = new Prompt()
     prompt.pushSystem(`
           You are an expert code reviewer with deep knowledge of software development, best practices, performance optimization, security, and maintainability. Your task is to analyze the provided pull request (PR) and generate a review with actionable feedback. Based on your understanding of the PR, provide one of the following responses:

            1. If you understand the PR and issue well:  
               - Provide a structured, clear review covering functionality, code quality, performance, security, maintainability, and test coverage.  
               - Include specific feedback with line numbers if applicable.  
               - Suggest concrete improvements with clear explanations.  

            2. If the PR is unclear or lacks enough context:  
               - Return: "I haven't understood the pull request properly. Please provide more context or clarify the changes."  

            3. If the PR is well-written and requires no changes:  
               - Return: "The pull request looks good. No further improvements needed."  

         `)
     prompt.pushUser(
        `Hey, I have the following pull request details along with its associated issue and code changes. Can you please analyze the PR and provide a review based on the given details?  

         ### 🔹 Pull Request Details:
         - **PR Number:** {PR}  
         - **PR Title:** {PRdes}  

         ### 🔹 Associated Issue:
         - **Issue Number:** {issue}  
         - **Issue Description:** {issdes}  

         ### 🔍 Files Changed (Git Diff)
         `
     )

     return prompt
  }
}