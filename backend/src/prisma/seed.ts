import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default prisma;

async function seedAPIKeyType() {
    const name = "OpenRouter";
    const description = "Clef d'API pour OpenRouter";

    // First, try to find the APIKeyType by name
    const existing = await prisma.aPIKeyType.findFirst({
        where: { name },
    });

    if (existing) {
        await prisma.aPIKeyType.update({
            where: { id: existing.id },
            data: { description },
        });
    } else {
        await prisma.aPIKeyType.create({
            data: { name, description },
        });
    }
}

seedAPIKeyType()
    .then(() => {
        console.log('APIKeyType "OpenRouter" seeded.');
        return prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

// Models
async function seedModels() {
    const models = [
        {
            slug: "mistralai/mistral-small-3.2-24b-instruct",
            name: "Mistral Small 3.2 24B Instruct",
            contextLength: 128000,
            cost_inputMil: 0.05,
            cost_outputMil: 0.10,
            description: "Mistral-Small-3.2-24B-Instruct-2506 is an updated 24B parameter model from Mistral optimized for instruction following, repetition reduction, and improved function calling. Compared to the 3.1 release, version 3.2 significantly improves accuracy on WildBench and Arena Hard, reduces infinite generations, and delivers gains in tool use and structured output tasks. It supports image and text inputs with structured outputs, function/tool calling, and strong performance across coding (HumanEval+, MBPP), STEM (MMLU, MATH, GPQA), and vision benchmarks (ChartQA, DocVQA)."

        },
        {
            slug: "mistralai/mistral-medium-3",
            name: "Mistral Medium 3",
            contextLength: 131072,
            cost_inputMil: 0.40,
            cost_outputMil: 2.00,
            description: "Mistral Medium 3 is a high-performance enterprise-grade language model designed to deliver frontier-level capabilities at significantly reduced operational cost. It balances state-of-the-art reasoning and multimodal performance with 8x lower cost compared to traditional large models, making it suitable for scalable deployments across professional and industrial use cases. The model excels in domains such as coding, STEM reasoning, and enterprise adaptation. It supports hybrid, on-prem, and in-VPC deployments and is optimized for integration into custom workflows. Mistral Medium 3 offers competitive accuracy relative to larger models like Claude Sonnet 3.5/3.7, Llama 4 Maverick, and Command R+, while maintaining broad compatibility across cloud environments."
        },
        {
            slug: "mistralai/mistral-large",
            name: "Mistral Large",
            contextLength: 128000,
            cost_inputMil: 2.00,
            cost_outputMil: 6.00,
            description: "This is Mistral AI's flagship model, Mistral Large 2 (version mistral-large-2407). It's a proprietary weights-available model and excels at reasoning, code, JSON, chat, and more. Read the launch announcement here . It supports dozens of languages including French, German, Spanish, Italian, Portuguese, Arabic, Hindi, Russian, Chinese, Japanese, and Korean, along with 80+ coding languages including Python, Java, C, C++, JavaScript, and Bash. Its long context window allows precise information recall from large documents."
        },
        {
            slug: "openai/gpt-4o-mini",
            name: "GPT-4o-mini",
            contextLength: 128000,
            cost_inputMil: 0.15,
            cost_outputMil: 0.60,
            description: "GPT-4o mini is OpenAI's newest model after GPT-4 Omni, supporting both text and image inputs with text outputs. As their most advanced small model, it is many multiples more affordable than other recent frontier models, and more than 60% cheaper than GPT-3.5 Turbo. It maintains SOTA intelligence, while being significantly more cost-effective. GPT-4o mini achieves an 82% score on MMLU and presently ranks higher than GPT-4 on chat preferences common leaderboards . Check out the launch announcement to learn more."
        },
        {
            slug: "openai/gpt-4.1",
            name: "GPT-4.1",
            contextLength: 1050000,
            cost_inputMil: 2.00,
            cost_outputMil: 8.00,
            description: "GPT-4.1 is a flagship large language model optimized for advanced instruction following, real-world software engineering, and long-context reasoning. It supports a 1 million token context window and outperforms GPT-4o and GPT-4.5 across coding (54.6% SWE-bench Verified), instruction compliance (87.4% IFEval), and multimodal understanding benchmarks. It is tuned for precise code diffs, agent reliability, and high recall in large document contexts, making it ideal for agents, IDE tooling, and enterprise knowledge retrieval."
        },
        {
            slug: "openai/gpt-4.1-mini",
            name: "GPT-4.1 Mini",
            contextLength: 1050000,
            cost_inputMil: 0.40,
            cost_outputMil: 1.60,
            description: "GPT-4.1 Mini is a mid-sized model delivering performance competitive with GPT-4o at substantially lower latency and cost. It retains a 1 million token context window and scores 45.1% on hard instruction evals, 35.8% on MultiChallenge, and 84.1% on IFEval. Mini also shows strong coding ability (e.g., 31.6% on Aider's polyglot diff benchmark) and vision understanding, making it suitable for interactive applications with tight performance constraints."
        },
        {
            slug: "openai/gpt-4.1-nano",
            name: "GPT-4.1 Nano",
            contextLength: 1050000,
            cost_inputMil: 0.10,
            cost_outputMil: 0.40,
            description: "For tasks that demand low latency, GPT-4.1 nano is the fastest and cheapest model in the GPT-4.1 series. It delivers exceptional performance at a small size with its 1 million token context window, and scores 80.1% on MMLU, 50.3% on GPQA, and 9.8% on Aider polyglot coding - even higher than GPT-4o mini. It's ideal for tasks like classification or autocompletion."
        },
        {
            slug: "google/gemini-2.0-flash-001",
            name: "Gemini 2.0 Flash",
            contextLength: 1050000,
            cost_inputMil: 0.10,
            cost_outputMil: 0.40,
            cost_inputImg: 0.026,
            description: "Gemini Flash 2.0 offers a significantly faster time to first token (TTFT) compared to Gemini Flash 1.5, while maintaining quality on par with larger models like Gemini Pro 1.5. It introduces notable enhancements in multimodal understanding, coding capabilities, complex instruction following, and function calling. These advancements come together to deliver more seamless and robust agentic experiences"
        },
        {
            slug: "google/gemini-2.5-pro",
            name: "Gemini 2.5 Pro",
            contextLength: 1050000,
            cost_inputMil: 1.25,
            cost_outputMil: 10.00,
            cost_inputImg: 5.16,
            description: "Gemini 2.5 Pro is Google's state-of-the-art AI model designed for advanced reasoning, coding, mathematics, and scientific tasks. It employs “thinking” capabilities, enabling it to reason through responses with enhanced accuracy and nuanced context handling. Gemini 2.5 Pro achieves top-tier performance on multiple benchmarks, including first-place positioning on the LMArena leaderboard, reflecting superior human-preference alignment and complex problem-solving abilities."
        },
        {
            slug: "google/gemini-2.5-flash-preview-05-20",
            name: "Gemini 2.5 Flash Preview 05-20",
            contextLength: 1050000,
            cost_inputMil: 0.15,
            cost_outputMil: 0.60,
            cost_inputImg: 0.619,
            description: "Gemini 2.5 Flash May 20th Checkpoint is Google's state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in thinking capabilities, enabling it to provide responses with greater accuracy and nuanced context handling. Note: This model is available in two variants: thinking and non-thinking. The output pricing varies significantly depending on whether the thinking capability is active. If you select the standard variant (without the :thinking suffix), the model will explicitly avoid generating thinking tokens. To utilize the thinking capability and receive thinking tokens, you must choose the :thinking variant, which will then incur the higher thinking-output pricing. Additionally, Gemini 2.5 Flash is configurable through the max tokens for reasoning parameter, as described in the documentation (https://openrouter.ai/docs/use-cases/reasoning-tokens#max-tokens-for-reasoning )."
        },
        {
            slug: "google/gemini-2.5-flash-preview-05-20",
            name: "Gemini 2.5 Flash Preview 05-20",
            contextLength: 1050000,
            cost_inputMil: 0.15,
            cost_outputMil: 0.60,
            cost_inputImg: 0.619,
            description: "Gemini 2.5 Flash May 20th Checkpoint is Google's state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in thinking capabilities, enabling it to provide responses with greater accuracy and nuanced context handling. Note: This model is available in two variants: thinking and non-thinking. The output pricing varies significantly depending on whether the thinking capability is active. If you select the standard variant (without the :thinking suffix), the model will explicitly avoid generating thinking tokens. To utilize the thinking capability and receive thinking tokens, you must choose the :thinking variant, which will then incur the higher thinking-output pricing. Additionally, Gemini 2.5 Flash is configurable through the max tokens for reasoning parameter, as described in the documentation (https://openrouter.ai/docs/use-cases/reasoning-tokens#max-tokens-for-reasoning )."
        },
        {
            slug: "google/gemma-3-27b-it",
            name: "Gemma 3 27B",
            contextLength: 131072,
            cost_inputMil: 0.09,
            cost_outputMil: 0.17,
            cost_inputImg: 0.026,
            description: "Gemma 3 introduces multimodality, supporting vision-language input and text outputs. It handles context windows up to 128k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities, including structured outputs and function calling. Gemma 3 27B is Google's latest open source model, successor to Gemma 2"
        },
        {
            slug: "google/gemma-3-4b-it",
            name: "Gemma 3 4B",
            contextLength: 131072,
            cost_inputMil: 0.02,
            cost_outputMil: 0.04,
            description: "Gemma 3 introduces multimodality, supporting vision-language input and text outputs. It handles context windows up to 128k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities, including structured outputs and function calling."
        },
        {
            slug: "anthropic/claude-sonnet-4",
            name: "Claude Sonnet 4",
            contextLength: 200000,
            cost_inputMil: 15.00,
            cost_outputMil: 4.80,
            description: "Claude Sonnet 4 significantly enhances the capabilities of its predecessor, Sonnet 3.7, excelling in both coding and reasoning tasks with improved precision and controllability. Achieving state-of-the-art performance on SWE-bench (72.7%), Sonnet 4 balances capability and computational efficiency, making it suitable for a broad range of applications from routine coding tasks to complex software development projects. Key enhancements include improved autonomous codebase navigation, reduced error rates in agent-driven workflows, and increased reliability in following intricate instructions. Sonnet 4 is optimized for practical everyday use, providing advanced reasoning capabilities while maintaining efficiency and responsiveness in diverse internal and external scenarios. Read more at the blog post here"
        },
    ];

    for (const model of models) {
        const existingModel = await prisma.model.findFirst({
            where: { slug: model.slug },
        });

        if (existingModel) {
            await prisma.model.update({
                where: { slug: existingModel.slug },
                data: model,
            });
        } else {
            await prisma.model.create({
                data: model,
            });
        }
    }      
}

seedModels()
    .then(() => {
        console.log('Models seeded successfully.');
        return prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
