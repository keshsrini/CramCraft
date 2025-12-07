// Claude API client utility for CramCraft
// Handles authentication, request/response, error handling, and retry logic

import {
  getRateLimitErrorMessage,
  getAuthErrorMessage,
  getTimeoutErrorMessage,
  getInvalidResponseErrorMessage,
} from './errorHandling';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
  temperature?: number;
}

interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface ClaudeError {
  type: string;
  message: string;
}

export class ClaudeAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorType?: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ClaudeAPIError';
  }
}

export class ClaudeAPIClient {
  private apiKey: string;
  private apiUrl: string;
  private model: string;
  private maxRetries: number = 3;
  private baseDelay: number = 1000; // 1 second

  constructor() {
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY || '';
    // Use proxy in both dev and production
    // Dev: local Express server
    // Prod: Vercel (/api/claude/v1/messages) or Netlify (/.netlify/functions/claude)
    if (import.meta.env.DEV) {
      this.apiUrl = 'http://localhost:3001/api/claude/v1/messages';
    } else if (window.location.hostname.includes('netlify')) {
      this.apiUrl = '/.netlify/functions/claude';
    } else {
      this.apiUrl = '/api/claude/v1/messages'; // Vercel
    }
    this.model = import.meta.env.VITE_CLAUDE_MODEL || 'claude-sonnet-4-20250514';

    if (!this.apiKey) {
      throw new ClaudeAPIError(getAuthErrorMessage(), undefined, 'configuration_error', false);
    }
  }

  /**
   * Send a message to Claude API with retry logic
   */
  async sendMessage(
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      retries?: number;
    } = {}
  ): Promise<string> {
    const maxTokens = options.maxTokens || 4096;
    const temperature = options.temperature || 1.0;
    const maxRetries = options.retries !== undefined ? options.retries : this.maxRetries;

    const request: ClaudeRequest = {
      model: this.model,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
    };

    let lastError: ClaudeAPIError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(request);
        return this.extractTextFromResponse(response);
      } catch (error) {
        lastError = this.handleError(error);

        // Don't retry if error is not retryable
        if (!lastError.retryable) {
          throw lastError;
        }

        // Don't retry if this was the last attempt
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Calculate exponential backoff delay
        const delay = this.calculateBackoffDelay(attempt);
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError || new ClaudeAPIError('Unknown error occurred', undefined, 'unknown', false);
  }

  /**
   * Make the actual HTTP request to Claude API
   */
  private async makeRequest(request: ClaudeRequest): Promise<ClaudeResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout (2 minutes)

    console.log('🚀 Making request to:', this.apiUrl);
    
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      
      console.log('📥 Response status:', response.status);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage: string;
        
        // Provide user-friendly error messages
        if (response.status === 429) {
          errorMessage = getRateLimitErrorMessage();
        } else if (response.status === 401 || response.status === 403) {
          errorMessage = getAuthErrorMessage();
        } else if (response.status === 408) {
          errorMessage = getTimeoutErrorMessage();
        } else {
          errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new ClaudeAPIError(
          errorMessage,
          response.status,
          errorData.error?.type || 'http_error',
          this.isRetryableStatusCode(response.status)
        );
      }

      const data: ClaudeResponse = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ClaudeAPIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ClaudeAPIError(getTimeoutErrorMessage(), 408, 'timeout', true);
        }
        throw new ClaudeAPIError(
          `Network error: ${error.message}`,
          undefined,
          'network_error',
          true
        );
      }

      throw new ClaudeAPIError('Unknown error occurred', undefined, 'unknown', false);
    }
  }

  /**
   * Extract text content from Claude API response
   */
  private extractTextFromResponse(response: ClaudeResponse): string {
    if (!response.content || response.content.length === 0) {
      throw new ClaudeAPIError(getInvalidResponseErrorMessage(), undefined, 'empty_response', false);
    }

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent) {
      throw new ClaudeAPIError(getInvalidResponseErrorMessage(), undefined, 'invalid_response', false);
    }

    return textContent.text;
  }

  /**
   * Handle and categorize errors
   */
  private handleError(error: unknown): ClaudeAPIError {
    if (error instanceof ClaudeAPIError) {
      return error;
    }

    if (error instanceof Error) {
      return new ClaudeAPIError(error.message, undefined, 'unknown', false);
    }

    return new ClaudeAPIError('Unknown error occurred', undefined, 'unknown', false);
  }

  /**
   * Determine if an HTTP status code is retryable
   */
  private isRetryableStatusCode(statusCode: number): boolean {
    // Retry on rate limits, server errors, and timeouts
    return statusCode === 429 || statusCode === 408 || (statusCode >= 500 && statusCode < 600);
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    const delay = this.baseDelay * Math.pow(2, attempt);
    // Add jitter (random 0-1000ms) to prevent thundering herd
    const jitter = Math.random() * 1000;
    return delay + jitter;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const claudeApiClient = new ClaudeAPIClient();
