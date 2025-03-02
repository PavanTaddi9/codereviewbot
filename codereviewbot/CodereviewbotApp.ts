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
import { IEnvironmentRead } from "@rocket.chat/apps-engine/definition/accessors";
import { settings } from "./settings";
export class CodereviewbotApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
        await Promise.all(
            settings.map((setting) =>
                configuration.settings.provideSetting(setting)
            )
        );
        const analyseCommand = new Analysepr(this);
        configuration.slashCommands.provideSlashCommand(analyseCommand);
    }
}


