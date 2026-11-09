import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ChatMessageDto } from './dto/chat.dto';
import { containsProfanity, moderateText } from './assistant.moderation';
import { STYLE_BRIEF, STYLE_DETAILED, SYSTEM_PROMPT } from './assistant.prompt';

const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_MODEL = 'deepseek-flash';
const MAX_HISTORY = 6;
const MAX_REPLY_CHARS = 1500;
const REQUEST_TIMEOUT_MS = 20000;
const FALLBACK_REPLY = 'No pude armar una respuesta útil. ¿Podés reformular tu consulta sobre AuraBox?';

export type ChatDetail = 'brief' | 'detailed';

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);
  private dailyKey = '';
  private dailyCount = 0;

  private takeDailySlot(): boolean {
    const today = new Date().toISOString().slice(0, 10);
    if (this.dailyKey !== today) {
      this.dailyKey = today;
      this.dailyCount = 0;
    }
    const limit = Number(process.env.ASSISTANT_DAILY_LIMIT ?? 500);
    if (this.dailyCount >= limit) return false;
    this.dailyCount += 1;
    return true;
  }

  async chat(history: ChatMessageDto[], detail: ChatDetail = 'brief') {
    const recent = history.slice(-MAX_HISTORY);
    const last = recent[recent.length - 1];
    if (!last || last.role !== 'user') {
      throw new BadRequestException('El último mensaje debe ser del usuario');
    }

    const moderation = moderateText(last.content);
    if (!moderation.allowed) return { reply: moderation.reply ?? FALLBACK_REPLY, blocked: true };

    const cleanHistory = recent.filter(
      (message) => message.role === 'assistant' || moderateText(message.content).allowed,
    );

    const apiKey = (process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API || '').trim();
    if (!apiKey) {
      this.logger.error('DEEPSEEK_API_KEY no está configurada');
      throw new ServiceUnavailableException('El asistente no está disponible en este momento.');
    }

    if (!this.takeDailySlot()) {
      throw new ServiceUnavailableException('El asistente alcanzó su límite diario. Probá de nuevo mañana.');
    }

    const baseUrl = process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL;
    const model = process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
    const thinkingDisabled = (process.env.DEEPSEEK_THINKING ?? 'disabled') === 'disabled';
    const style = detail === 'detailed' ? STYLE_DETAILED : STYLE_BRIEF;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: `${SYSTEM_PROMPT}\n\n${style}` },
            ...cleanHistory.map((message) => ({ role: message.role, content: message.content })),
          ],
          max_tokens: detail === 'detailed' ? 700 : 400,
          temperature: 0.3,
          stream: false,
          ...(thinkingDisabled ? { thinking: { type: 'disabled' } } : {}),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.error(`DeepSeek respondió con estado ${response.status}`);
        throw new ServiceUnavailableException('El asistente no está disponible en este momento.');
      }

      const data: any = await response.json();
      const raw = data?.choices?.[0]?.message?.content;
      const text = typeof raw === 'string' ? raw.trim().slice(0, MAX_REPLY_CHARS) : '';

      if (!text || containsProfanity(text)) return { reply: FALLBACK_REPLY, blocked: false };
      return { reply: text, blocked: false };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      this.logger.error(`Error al consultar el asistente: ${(error as Error).name}`);
      throw new ServiceUnavailableException('El asistente no está disponible en este momento.');
    } finally {
      clearTimeout(timer);
    }
  }
}