import dotenv from 'dotenv';

dotenv.config();

export interface DifyMessageOptions {
  query: string;
  user?: string;
  inputs?: Record<string, any>;
  conversationId?: string;
  appType?: 'chat' | 'workflow';
}

export interface DifyResponse {
  answer: string;
  conversationId?: string;
  messageId?: string;
  taskId?: string;
  latencyMs: number;
  metadata?: {
    usage?: any;
    retrieverResources?: any[];
  };
  raw?: any;
}

export interface DifyHealthStatus {
  connected: boolean;
  configured: boolean;
  provider: 'dify';
  apiUrl?: string;
  hasApiKey: boolean;
  error?: {
    code: string;
    message: string;
  };
}

export class DifyError extends Error {
  code: string;
  status?: number;

  constructor(code: string, message: string, status?: number) {
    super(message);
    this.name = 'DifyError';
    this.code = code;
    this.status = status;
  }
}

export class DifyService {
  private static getApiUrl(): string {
    const raw = process.env.DIFY_API_URL || 'https://api.dify.ai/v1';
    return raw.trim().replace(/\/+$/, '');
  }

  private static getApiKey(): string {
    return (process.env.DIFY_API_KEY || '').trim();
  }

  public static isConfigured(): boolean {
    return this.getApiKey().length > 0;
  }

  /**
   * Health check to test connectivity and configuration with Dify API
   */
  public static async healthCheck(): Promise<DifyHealthStatus> {
    const apiUrl = this.getApiUrl();
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return {
        connected: false,
        configured: false,
        provider: 'dify',
        apiUrl,
        hasApiKey: false,
        error: {
          code: 'DIFY_CONFIG_ERROR',
          message: 'Dify configuration is missing. Set DIFY_API_KEY in backend .env.'
        }
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Probe Dify parameters/info endpoint to verify token validity
      const res = await fetch(`${apiUrl}/parameters`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.status === 401 || res.status === 403) {
        return {
          connected: false,
          configured: true,
          provider: 'dify',
          apiUrl,
          hasApiKey: true,
          error: {
            code: 'DIFY_AUTH_ERROR',
            message: 'Dify rejected the API key. Check the API key in the backend environment.'
          }
        };
      }

      if (res.status === 404) {
        return {
          connected: false,
          configured: true,
          provider: 'dify',
          apiUrl,
          hasApiKey: true,
          error: {
            code: 'DIFY_NOT_FOUND',
            message: 'The configured Dify application or endpoint was not found.'
          }
        };
      }

      if (!res.ok) {
        return {
          connected: false,
          configured: true,
          provider: 'dify',
          apiUrl,
          hasApiKey: true,
          error: {
            code: 'DIFY_BAD_RESPONSE',
            message: `Dify returned HTTP ${res.status}: ${res.statusText}`
          }
        };
      }

      return {
        connected: true,
        configured: true,
        provider: 'dify',
        apiUrl,
        hasApiKey: true
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return {
          connected: false,
          configured: true,
          provider: 'dify',
          apiUrl,
          hasApiKey: true,
          error: {
            code: 'DIFY_TIMEOUT',
            message: 'Dify health check timed out after 10 seconds.'
          }
        };
      }

      return {
        connected: false,
        configured: true,
        provider: 'dify',
        apiUrl,
        hasApiKey: true,
        error: {
          code: 'DIFY_CONNECTION_ERROR',
          message: `AgentHeal could not connect to Dify at ${apiUrl}. Check network reachability.`
        }
      };
    }
  }

  /**
   * Send a chat message to Dify API with retry logic and error mapping
   */
  public static async sendChatMessage(options: DifyMessageOptions): Promise<DifyResponse> {
    const apiUrl = this.getApiUrl();
    const apiKey = this.getApiKey();

    if (!apiKey) {
      throw new DifyError(
        'DIFY_CONFIG_ERROR',
        'Dify configuration is missing. Check DIFY_API_URL and DIFY_API_KEY in backend environment.'
      );
    }

    const appType = options.appType || (process.env.DIFY_APP_TYPE === 'workflow' ? 'workflow' : 'chat');
    const endpoint = appType === 'workflow' ? `${apiUrl}/workflows/run` : `${apiUrl}/chat-messages`;

    const requestBody = appType === 'workflow'
      ? {
          inputs: options.inputs || { query: options.query },
          response_mode: 'blocking',
          user: options.user || 'agentheal-user'
        }
      : {
          inputs: options.inputs || {},
          query: options.query,
          response_mode: 'blocking',
          conversation_id: options.conversationId || '',
          user: options.user || 'agentheal-user'
        };

    const maxRetries = 2;
    let attempt = 0;
    const startTime = Date.now();

    while (attempt <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const latencyMs = Date.now() - startTime;

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          const errMsg = errBody?.message || res.statusText || 'Unknown Dify error';

          // Non-retryable errors
          if (res.status === 401 || res.status === 403) {
            throw new DifyError(
              'DIFY_AUTH_ERROR',
              'Dify rejected the API key. Check the API key in the backend environment.',
              res.status
            );
          }

          if (res.status === 404) {
            throw new DifyError(
              'DIFY_NOT_FOUND',
              'The configured Dify application or endpoint was not found.',
              res.status
            );
          }

          if (res.status === 429) {
            throw new DifyError(
              'DIFY_RATE_LIMIT',
              'Dify rate limit reached. Please try again shortly.',
              res.status
            );
          }

          // Retryable server errors (502, 503, 504)
          if ((res.status >= 500 && res.status <= 504) && attempt < maxRetries) {
            attempt++;
            await new Promise(r => setTimeout(r, attempt * 600));
            continue;
          }

          throw new DifyError(
            'DIFY_BAD_RESPONSE',
            `Dify returned error ${res.status}: ${errMsg}`,
            res.status
          );
        }

        const data = await res.json();
        return this.parseResponse(data, appType, latencyMs);
      } catch (err: any) {
        if (err instanceof DifyError) {
          throw err;
        }

        if (err.name === 'AbortError') {
          throw new DifyError(
            'DIFY_TIMEOUT',
            'Dify took too long to respond (30s timeout).'
          );
        }

        if (attempt < maxRetries) {
          attempt++;
          await new Promise(r => setTimeout(r, attempt * 600));
          continue;
        }

        throw new DifyError(
          'DIFY_CONNECTION_ERROR',
          `AgentHeal could not connect to Dify at ${apiUrl}. Check that the Dify server is reachable.`
        );
      }
    }

    throw new DifyError('DIFY_CONNECTION_ERROR', 'Failed to connect to Dify after retries.');
  }

  /**
   * Parse responses from Dify Chat or Workflow APIs
   */
  public static parseResponse(data: any, appType: 'chat' | 'workflow', latencyMs: number): DifyResponse {
    if (!data) {
      throw new DifyError('DIFY_BAD_RESPONSE', 'Dify returned empty or null response.');
    }

    if (appType === 'workflow') {
      const outputs = data.data?.outputs || {};
      const answer = outputs.text || outputs.result || outputs.answer || JSON.stringify(outputs);
      return {
        answer: typeof answer === 'string' ? answer : JSON.stringify(answer),
        taskId: data.task_id || data.data?.id,
        latencyMs,
        metadata: {
          usage: data.data?.total_tokens ? { total_tokens: data.data.total_tokens } : undefined
        },
        raw: data
      };
    }

    // Chat application response format
    const answer = data.answer || '';
    return {
      answer,
      conversationId: data.conversation_id,
      messageId: data.message_id || data.id,
      taskId: data.task_id,
      latencyMs,
      metadata: {
        usage: data.metadata?.usage,
        retrieverResources: data.metadata?.retriever_resources
      },
      raw: data
    };
  }
}
