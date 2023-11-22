import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useFlags, useLDClient } from "launchdarkly-react-client-sdk";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThreeCircles } from "react-loader-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signIn, signOut } from "next-auth/react";
import { getCookie, setCookie } from "cookies-next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChat } from "ai/react";

interface AiPrompt {
  [key: string]: string;
}
export default function Home() {
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;
  const [setPrompt, setPromptState] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [aiResponse, setAIResponse] = useState<string>("");
  const [provider, setProvider] = useState("")
  const [loading, setLoading] = useState<boolean>(false);
  const [betaOptIn, setBetaOptIn] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState<string>("");

  const client = useLDClient();

  // Feature Flag Configuration in LaunchDarkly
  const { aiprompts, aimodelprovider, ssai } = useFlags();

  const setPromptInformation = useCallback(async () => {
    try {
      const prompt = await aiprompts.prompt;
      const model = await aimodelprovider;

      console.log(`The prompt is: ${prompt}`);

      switch (model) {
        case 'cohere':
          setProvider('cohere.command-text-v14');
          break;
        case 'anthropic':
          setProvider('anthropic.claude-v2');
          break;
        case 'AI21':
          setProvider('ai21.j2-ultra-v1');
          break;
        default:
          console.log('No provider matched');
      }

      setModel(model);
      setPromptState(prompt);

      return prompt;
    } catch (error) {
      console.error(
        "There was an error setting the prompt information: ",
        error
      );
    }
  }, [aiprompts, aimodelprovider]);

  useEffect(() => {
    setPromptInformation();
  }, [setPromptInformation]);

  const handleChange = useCallback((event: any) => {
    const value = event.target.value;
    setQuery(value);
  }, []);

  async function betaModelOptIn() {
    const context: any = client?.getContext();
    context.user.betaModel = !context.user.betaModel;
    await setBetaOptIn(context.user.betaModel);
    client?.identify(context);
    setCookie("ldcontext", context);
    return context;
  }

  const [modelUsage, setModelUsage] = useState<boolean>(false);

  async function modelUsageUI() {
    const context: any = client?.getContext();
    context.user.modelUsage = !context.user.modelUsage;
    await setModelUsage(context.user.modelUsage);
    client?.identify(context);
    setCookie("ldcontext", context);
    return context;
  }

  async function submitQuery(userPrompt: string, query: string) {
    try {
      setLoading(true);
      const response = await fetch("/api/gptmodel", {
        method: "POST",
        body: JSON.stringify({ prompt: userPrompt + query }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}. Check API Server Logs.`
        );
      }

      const data = await response.json();
      setAIResponse(data.text);
      console.log(data.text);
      return data;
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setLoading(false);
    }
  }

  const { messages } = useChat();

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  async function updateContext(contextUpdate: any) {
    const context: any = await client?.getContext();
    Object.assign(context.user, contextUpdate);
    await client?.identify(context);
    const parsedContext = JSON.stringify(context);
    setCookie("ldcontext", parsedContext);
  }

  async function login() {
    updateContext({});
    signIn("github");
  }

  async function logout() {
    updateContext({
      email: "",
      name: "anonymous",
      key: "0",
    });
    signOut();
  }

  useEffect(() => {
    console.log(aiprompts);
    try {
      if (status === "authenticated") {
        const context: any = getCookie("ldcontext");
        console.log(JSON.parse(context));
        const parsedContext = JSON.parse(context);
        parsedContext.user.email = session?.user?.email;
        parsedContext.user.name = session?.user?.name;
        parsedContext.user.key = session?.user?.email?.slice(0, 5);
        client?.identify(parsedContext);
        setCookie("ldcontext", JSON.stringify(parsedContext));
        setBetaOptIn(parsedContext.user.betaModel);
      } else {
        console.log("Not signed in");
        const context: any = getCookie("ldcontext");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  });

  return (
    <div className=" mx-2 xl:mx-32 pt-6 justify-center items-center">
      <div className="grid w-full place-items-center pt-8 pb-4">
        <p className="grid text-center text-6xl place-content-center font-bold banner">
          Iterating on AI with LaunchDarkly and <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">AWS Bedrock</span>
         </p>
        <p className="grid p-4 w-2/3 text-lg place-content-center text-muted-foreground text-center ">
          LaunchDarkly enables the control of integrations with AI providers at runtime, without requiring a code push to make changes every time. Iterate on releasing prompts or models, and measure the effectness of AI implementations.
        </p>
        {modelUsage && (
          <div className="grid w-1/2 m-2 border rounded-xl">
            <p className="text-xl lg:text-2xl font-sans text-muted-foreground mx-auto m-4">
              Current AWS Bedrock Model in Use
            </p>
            <p className="grid mb-4 font-bold text-2xl text-center lg:text-4xl uppercase bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              {model}
              
            </p>
            <p className="grid mb-4 text-xl text-center lg:text-xl uppercase bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">{provider}</p>
          </div>
        )}
      </div>
      <div className="absolute top-5 right-5 font-sans">
        {status === "authenticated" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-12 w-12">
                <AvatarImage src={session.user?.image || ""} alt="User" />
                <AvatarFallback>LD</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal font-sans">
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-medium leading-none">
                    {session.user?.name || ""}
                  </p>
                  <p className="text-md leading-none text-muted-foreground">
                    {session.user?.email || ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-lg" onClick={modelUsageUI}>
                  {modelUsage ? "Hide Model Usage" : "Show Model Usage"}
                </DropdownMenuItem>
                {ssai && (
                  <DropdownMenuItem
                    className="text-lg"
                    onClick={betaModelOptIn}
                  >
                    {betaOptIn ? "Disable Beta Model" : "Enable Beta Model"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-lg" onClick={() => logout()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="grid place-items-center place-content-center">
            <Button
              variant={"outline"}
              onClick={() => login()}
              className="w-full text-xl"
            >
              Login
            </Button>
          </div>
        )}
      </div>

      <div className="grid mx-auto overflow-y-auto rounded-[0.5rem] h-full xl:h-2/3 border bg-background shadow ">
        <Card className="h-full overflow-y-auto">
          <CardHeader className="text-2xl text-muted-foreground text-center">
            Current Prompt
            <div className="py-4">
              <Select
                onValueChange={(e) => {
                  setUserPrompt(e);
                }}
              >
                <SelectTrigger className="w-full xl:w-1/2 mx-auto text-xl">
                  <SelectValue
                    className="text-xl"
                    placeholder="Select Prompt"
                  />
                </SelectTrigger>
                <SelectContent
                  className="text-xl"
                  onSelect={(e) => {
                    console.log(e.currentTarget);
                  }}
                >
                  {aiprompts.map((prompt: AiPrompt, index: number) =>
                    Object.entries(prompt).map(
                      ([key, value]: [string, string], subIndex: number) => (
                        <SelectItem
                          className="text-xl"
                          key={`${index}-${subIndex}`}
                          value={value}
                        >
                          {key}
                        </SelectItem>
                      )
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          {status === "authenticated" && (
            <CardContent className="grid ">
              <div className="w-full h-full">
                <Textarea
                  className="w-full xl:w-1/2 mx-auto"
                  onChange={handleChange}
                  value={query || ""}
                  placeholder="Enter Request"
                />
                <Button
                  variant={"outline"}
                  className="flex mx-auto my-4 w-1/5 rounded-md text-lg"
                  onClick={() => submitQuery(userPrompt, query)}
                  type="submit"
                >
                  {loading ? (
                    <ThreeCircles
                      height="25"
                      width="25"
                      color="white"
                      wrapperStyle={{}}
                      wrapperClass=""
                      visible={true}
                      ariaLabel="three-circles-rotating"
                    />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
              <div className="h-full">
                {aiResponse && (
                  <Card className="h-full">
                    <ScrollArea className="h-48 2xl:h-96 w-full overflow-y-auto rounded-md">
                      <pre className="m-6 whitespace-pre-line">
                        {aiResponse}
                      </pre>
                    </ScrollArea>
                  </Card>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
