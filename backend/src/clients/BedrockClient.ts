import {
    BedrockRuntimeClient,
    InvokeModelCommand,
    InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime';
import { BedrockError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * BedrockClient
 *
 * A thin, isolated wrapper around Amazon Bedrock. The rest of the app never
 * imports the AWS SDK for AI directly.
 *
 * The client sends *already-calculated facts* to the model (AnalyticsService
 * output) and asks it only to explain them in natural language. It never asks
 * the model to do arithmetic.
 */
export interface InvokeTextOptions {
    system?: string;
    prompt: string;
    maxTokens?: number;
    temperature?: number;
}

const DEFAULT_MODEL_ID =
    process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

export class BedrockClient {
    private readonly client: BedrockRuntimeClient;
    private readonly modelId: string;

    constructor(client?: BedrockRuntimeClient, modelId?: string) {
        this.client =
            client ||
            new BedrockRuntimeClient({
                region: process.env.BEDROCK_REGION || process.env.AWS_REGION || 'ap-south-1',
            });
        this.modelId = modelId || DEFAULT_MODEL_ID;
    }

    /**
     * Invokes Bedrock with a plain-text prompt and returns the model's text.
     *
     * Uses the Anthropic Messages API payload shape, which is the format most
     * commonly enabled for Bedrock. The request body is easily swapped for
     * another model family behind this method.
     */
    async invokeText(options: InvokeTextOptions): Promise<string> {
        const { system, prompt, maxTokens = 600, temperature = 0.2 } = options;

        const body: Record<string, unknown> = {
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: maxTokens,
            temperature,
            messages: [{ role: 'user', content: prompt }],
        };

        if (system) {
            body.system = system;
        }

        const input: InvokeModelCommandInput = {
            modelId: this.modelId,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(body),
        };

        try {
            const response = await this.client.send(new InvokeModelCommand(input));
            const decoded = new TextDecoder().decode(response.body);
            const parsed = JSON.parse(decoded) as {
                content?: Array<{ type: string; text?: string }>;
                completion?: string;
                outputText?: string;
            };

            if (Array.isArray(parsed.content)) {
                const text = parsed.content
                    .filter((c) => c.type === 'text' && c.text)
                    .map((c) => c.text)
                    .join('\n')
                    .trim();
                if (text) {
                    return text;
                }
            }

            if (parsed.completion) {
                return parsed.completion.trim();
            }
            if (parsed.outputText) {
                return parsed.outputText.trim();
            }

            throw new BedrockError('Bedrock returned an empty response.');
        } catch (err) {
            if (err instanceof BedrockError) {
                throw err;
            }
            logger.error('Bedrock invocation failed', { error: (err as Error).message });
            throw new BedrockError(`Bedrock invocation failed: ${(err as Error).message}`);
        }
    }
}

export const bedrockClient = new BedrockClient();