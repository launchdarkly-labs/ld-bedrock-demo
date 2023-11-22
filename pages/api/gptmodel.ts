import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerClient } from '../../utils/ld-server';
import { getCookie } from 'cookies-next';
import { bedrockCall } from '@/lib/bedrock';
import { jurassic } from '@/lib/ai21';
import { anthropic } from '@/lib/antrhopic';
import { cohere } from '@/lib/cohere';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const ldClient = await getServerClient(process.env.LD_SERVER_KEY || "");
  const clientContext: any = getCookie("ldcontext", { req, res });

  const json = decodeURIComponent(clientContext);
  const jsonObject = JSON.parse(json);

  if (req.method === 'POST') {

    const model = await ldClient.variation("aimodelprovider", jsonObject, 'AI21');

    console.log(model)
  
    const query = JSON.parse(req.body);

    if (model === 'AI21') {
      const data = await jurassic(query);
      try {
        console.log(data)
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ aimodelprovider: data.error.message })
      }
    } else if (model === 'anthropic') {
      const data = await anthropic(query);
      res.status(200).json(data);
    } else if (model === 'cohere') {
      const output = await cohere(query);
      res.status(200).json(output);
    }

  } else if (req.method === 'GET') {
    const model = await ldClient.variation("aimodelprovider", jsonObject, 'openai');
    res.status(200).json({ aimodelprovider: model })
  }
}
