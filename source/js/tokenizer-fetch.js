import {
    t,
    importLocalFile,
    extensionName,
    extensionFolderPath,
    AutoTokenizer,
    transformersEnv,
} from '../../index.js';

export {
    processChatTemplate,
};

async function processChatTemplate() {
    try {
        const model_id = $('#jinja-parser-model-id').val() || '';
        const isOfflineMode = $('#jinja-parser-offline-mode').prop('checked');
        const chatTemplatePath = isOfflineMode ? `./${extensionFolderPath}/tokenizers/${model_id}/chat_template.jinja` : 'jinja-parser-chat-template';

        if (!model_id) return toastr.error(t`Provide a valid model ID`, extensionName);

        const fullModelId = isOfflineMode ? `./${extensionFolderPath}/tokenizers/${model_id}` : model_id;
        transformersEnv.allowLocalModels = isOfflineMode;

        JinjaParser.log({model_id, fullModelId, isOfflineMode, chatTemplatePath, transformersEnv});

        const tokenizer = await AutoTokenizer.from_pretrained(fullModelId);

        if (!tokenizer.chat_template) tokenizer.chat_template = await importLocalFile(chatTemplatePath, {isLocalPath: isOfflineMode});
        if (!tokenizer.chat_template) return toastr.error(t`The tokenizer doesn't provide a chat template`, extensionName);

        JinjaParser.log({tokenizer}, typeof tokenizer, Object.entries(tokenizer));

        const chat = [
            { role: 'system', content: 'You\'re an AI assistant.' },
            { role: 'user', content: 'Hello, how are you?' },
            { role: 'assistant', content: 'I\'m doing great. How can I help you today?' },
            { role: 'user', content: 'I\'d like to show off how chat templating works!' },
            { role: 'assistant', content: 'Ok, this is how the output is looking' },
        ];

        const result = tokenizer.apply_chat_template(chat, { tokenize: false });
        const tokenIds = tokenizer.apply_chat_template(chat, { tokenize: true, return_tensor: false });

        $('#jinja-parser-output-box')
            .find('.jinja-parser-output')
            .text(result);

        $('#jinja-parser-output-box')
            .find('.jinja-parser-token-ids')
            .text(tokenIds);
    } catch (err) {
        toastr.error(t`The tokenizer and/or the template could not be loaded`, extensionName);
        JinjaParser.error(err);
    }
}