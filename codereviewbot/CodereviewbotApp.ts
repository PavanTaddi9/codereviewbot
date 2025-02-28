import {
    IAppAccessors,
    IConfigurationExtend,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
 } from "@rocket.chat/apps-engine/definition/accessors"
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { Analysepr } from "./src/commands/Analysepr";
export class CodereviewbotApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }
    
     public async extendConfiguration(configuration: IConfigurationExtend) {
        configuration.slashCommands.provideSlashCommand(new Analysepr())
  
        
     }
}
