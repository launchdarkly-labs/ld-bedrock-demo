import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

export async function bedrockCall(query: any) {
    const client = new BedrockRuntimeClient({region: "us-west-2"});

    const { prompt } = query;

    const input = {
        modelId: "anthropic.claude-instant-v1",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            prompt: `\n\nHuman:${prompt}\n\nAssistant:`,
            max_tokens_to_sample: 500,
            temperature: 0.9,
            top_p: 1,
        }),
    };
    const command = new InvokeModelCommand(input);
    try {
        const response = await client.send(command);
        let decoder = new TextDecoder();
        let jsontext = JSON.parse(decoder.decode(response.body));
        console.log(jsontext)
        return jsontext;
    } catch (error: any) {
        console.log(error);
        throw new Error(error.message);
    }
}
