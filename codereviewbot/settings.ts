import { ISetting, SettingType } from "@rocket.chat/apps-engine/definition/settings";


export const settings: ISetting[] = [
    {
        id: "gittoken",
        type: SettingType.STRING,
        i18nLabel: "gittoken",
        i18nDescription: 'GITHUB_TOKEN_DESCRIPTION',
        required: true,
        public: false,
        packageValue: '',
    },
    {
        id: "repowner",
        type: SettingType.STRING,
        i18nLabel: "repowner",
        i18nDescription: 'REPO_OWNER_DESCRIPTION',
        required: true,
        public: true,
        packageValue: '',
    },
    {
        id: "reponame",
        type: SettingType.STRING,
        i18nLabel: "reponame",
        i18nDescription: 'REPO_NAME_DESCRIPTION',
        required: true,
        public: true,
        packageValue: '',
    },
];