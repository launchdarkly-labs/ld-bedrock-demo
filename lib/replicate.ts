import Replicate from "replicate";

export async function replicateCall(query: any) {
    console.log("Running prompt: " + query.prompt)
  const replicate = new Replicate({
    auth: process.env.REPLICATE_TOKEN,
  });

  const output = await replicate.run(
    "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
    {
      input: {
        prompt: query.prompt
      }
    }
  );

  await console.log(output)

  return output;
}