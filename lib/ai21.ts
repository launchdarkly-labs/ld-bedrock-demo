import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

export async function jurassic(query: any) {
    const client = new BedrockRuntimeClient({region: "us-west-2"});

    const { prompt } = query;

    const input = {
        modelId: "ai21.j2-ultra-v1",
        contentType: "application/json",
        accept: "*/*",
        body: JSON.stringify({"prompt":prompt,"maxTokens":200,"temperature":0.7,"topP":1,"stopSequences":[],"countPenalty":{"scale":0},"presencePenalty":{"scale":0},"frequencyPenalty":{"scale":0}}),
    };

    const command = new InvokeModelCommand(input);
    try {
        const response = await client.send(command);
        let decoder = new TextDecoder();
        let jsontext = await JSON.parse(decoder.decode(response.body));
        console.log(jsontext.completions[0].data)
        return jsontext.completions[0].data;
    } catch (error: any) {
        console.log(error);
        throw new Error(error.message);
    }
}
