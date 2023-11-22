import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

export async function anthropic(query: any) {
    const client = new BedrockRuntimeClient({region: "us-west-2"});

    const { prompt } = query;

    const input = {
        modelId: "anthropic.claude-v2",
        contentType: "application/json",
        accept: "*/*",
        body: JSON.stringify({
            "prompt": `\n\nHuman: ${prompt}\n\nAssistant:`,
            "max_tokens_to_sample": 300,
            "temperature": 0.5,
            "top_k": 250,
            "top_p": 1,
            "stop_sequences": [
              "\n\nHuman:"
            ],
            "anthropic_version": "bedrock-2023-05-31"
          }),
    };

    const command = new InvokeModelCommand(input);
    try {
        const response = await client.send(command);
        let decoder = new TextDecoder();
        let jsontext = await JSON.parse(decoder.decode(response.body));
        let newJson = { "text": jsontext.completion };
        console.log(newJson)
        return newJson;
    } catch (error: any) {
        console.log(error);
        throw new Error(error.message);
    }
}
