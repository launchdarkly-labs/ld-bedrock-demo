import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

export async function cohere(query: any) {
    const client = new BedrockRuntimeClient({region: "us-west-2"});

    const { prompt } = query;

    const input = {
        modelId: "cohere.command-text-v14",
        contentType: "application/json",
        accept: "*/*",
        body: JSON.stringify({"prompt":prompt,"max_tokens":400,"temperature":0.75,"p":0.01,"k":0,"stop_sequences":[],"return_likelihoods":"NONE","stream":false}),
    };

    const command = new InvokeModelCommand(input);
    try {
        const response = await client.send(command);
        let decoder = new TextDecoder();
        let jsontext = await JSON.parse(decoder.decode(response.body));
        // console.log(jsontext)
        let newJson = { "text": jsontext.generations[0].text };
        console.log(newJson)
        return newJson;
    } catch (error: any) {
        console.log(error);
        throw new Error(error.message);
    }
}
