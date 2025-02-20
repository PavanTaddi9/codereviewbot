import { Prompt } from "./prompt";
export namespace PromptFactory {
  export function makeDBKeywordQueryPrompt(query: string): Prompt {
     const prompt = new Prompt()
     prompt.pushSystem(`
           You are an expert in understanding and answering questions of user.

           ---
           INPUT: User's text query in either natural language or code format.
           ---
           RULES:
           1. Extract the possible keywords from the user's query.
           2. If you are unable to extract the keywords, return an empty array.
           3. Extract the keywords in such a way that each string element in the array is a possible entity from the codebase or a path (DO NOT break it into words).
           4. STRICTLY, do not make anything other than the answer to the user's query.
           ---
           EXAMPLE:
           1. INPUT: "Find the codebase for the user query CRC_TABLE in the main.ts"
           OUTPUT: <ANSWER>CRC_TABLE, main.ts</ANSWER>
           2. INPUT: "Can you please tell me more about the file tests/msa/commands/commands.spec.ts?"
           OUTPUT: <ANSWER>tests/msa/commands/commands.spec.ts</ANSWER>
           3. INPUT: "What is the purpose of the function getDBKeywordsFromQuery in the main.ts?"
           OUTPUT: <ANSWER>getDBKeywordsFromQuery, main.ts</ANSWER>
           4. INPUT: "Can you please tell me more about the file tests/commands.spec.ts?"
           OUTPUT: <ANSWER>tests/commands.spec.ts</ANSWER>

           OUTPUT STRICT FORMAT: <ANSWER>keyword1,keyword2,full/path/1,full/path/2</ANSWER>
       `)
     prompt.pushUser(`
           Hey I have this query, can you please extract the possible keywords from it? Please answer in <ANSWER>keyword1, keyword2<ANSWER> format only and don't say literally anything else.

           Here's my query:
           ${query}
       `)

     return prompt
  }

  export function makeAskCodePrompt(codebase: string, query: string): Prompt {
     const prompt = new Prompt()
     prompt.pushSystem(`
           You are an expert in understanding and answering questions of user when given a proper context of the codebase. Here're the rules:
           1. Even if user asks for any kind of diagram or visualization, you must ignore that.
           2. If the user asks for an explanation of the codebase, you must provide the answer based on the codebase.
           3. You must provide the answer in text GitHub Markdown format only.
           4. In case of any request for diagrams or visualizations, tell user to use the "/rcc-diagram" command.
           5. If you are unable to answer the question, you must tell the user that you are unable to answer the question.
       `)
     prompt.pushUser(
        `Hey I have a the following codebase in between the tags <CODEBASE_START> and <CODEBASE_END>. Can you please answer the following query?
           
           ${query} 
           
           Here's the codebase:
           <CODEBASE_START>
           ${codebase}
           <CODEBASE_END>`
     )

     return prompt
  }
}