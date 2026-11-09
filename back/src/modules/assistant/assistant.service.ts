import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { Frequency } from '@prisma/client';
import { ChatMessageDto } from './dto/chat.dto';
import { containsProfanity, moderateText } from './assistant.moderation';
import { STYLE_BRIEF, STYLE_DETAILED, SYSTEM_PROMPT, buildExtractionPrompt } from './assistant.prompt';
import { ClubCard, ClubSearchFilters, ClubSearchService } from './club-search.service';

const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_MODEL = 'deepseek-flash';
const MAX_HISTORY = 6;
const MAX_REPLY_CHARS = 1500;
const REQUEST_TIMEOUT_MS = 20000;
const FALLBACK_REPLY = 'No pude armar una respuesta útil. ¿Podés reformular tu consulta sobre AuraBox?';
const FREQUENCIES = Object.values(Frequency) as string[];

export type ChatDetail = 'brief' | 'detailed';

interface ChatResult {
  reply: string;
  blocked: boolean;
  clubs?: ClubCard[];
}

interface CompleteOptions {
  maxTokens: number;
  temperature: number;
  json?: boolean;
}

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const looksLikeClubSearch = (text: string) => {
  const plain = normalize(text);
  const asks =
    /(recomend|sugeri|busco|buscando|quiero|necesito|conoces|conocen|hay (algun|alguna)|que clubes|encontrar|armame|ayudame a (buscar|encontrar))/.test(
      plain,
    );
  const topic = /(club|caja|box|suscrip|plan)/.test(plain);
  return asks && topic;
};

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);
  private dailyKey = '';
  private dailyCount = 0;

  constructor(private readonly clubSearch: ClubSearchService) {}

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

  private getApiKey(): string {
    const apiKey = (process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API || '').trim();
    if (!apiKey) {
      this.logger.error('DEEPSEEK_API_KEY no está configurada');
      throw new ServiceUnavailableException('El asistente no está disponible en este momento.');
    }
    return apiKey;
  }

  private async complete(messages: { role: string; content: string }[], options: CompleteOptions): Promise<string> {
    const apiKey = this.getApiKey();
    const baseUrl = process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL;
    const model = process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
    const thinkingDisabled = (process.env.DEEPSEEK_THINKING ?? 'disabled') === 'disabled';

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
          messages,
          max_tokens: options.maxTokens,
          temperature: options.temperature,
          stream: false,
          ...(thinkingDisabled ? { thinking: { type: 'disabled' } } : {}),
          ...(options.json ? { response_format: { type: 'json_object' } } : {}),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.error(`DeepSeek respondió con estado ${response.status}`);
        throw new ServiceUnavailableException('El asistente no está disponible en este momento.');
      }

      const data: any = await response.json();
      const raw = data?.choices?.[0]?.message?.content;
      return typeof raw === 'string' ? raw : '';
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      this.logger.error(`Error al consultar el asistente: ${(error as Error).name}`);
      throw new ServiceUnavailableException('El asistente no está disponible en este momento.');
    } finally {
      clearTimeout(timer);
    }
  }

  private parseFilters(raw: string, validCategoryIds: number[]): ClubSearchFilters | null {
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return null;
    }
    if (!data || data.search !== true) return null;

    const categoryId =
      Number.isInteger(data.categoryId) && validCategoryIds.includes(data.categoryId) ? (data.categoryId as number) : null;

    const keywords: string[] = Array.isArray(data.keywords)
      ? data.keywords
          .filter((keyword: unknown): keyword is string => typeof keyword === 'string')
          .map((keyword: string) => keyword.trim().slice(0, 30))
          .filter((keyword: string) => keyword.length >= 2)
          .slice(0, 4)
      : [];

    const maxPrice =
      typeof data.maxPrice === 'number' && Number.isFinite(data.maxPrice) && data.maxPrice > 0 ? data.maxPrice : null;

    const frequency =
      typeof data.frequency === 'string' && FREQUENCIES.includes(data.frequency) ? (data.frequency as Frequency) : null;

    if (categoryId === null && keywords.length === 0 && maxPrice === null && frequency === null) return null;
    return { categoryId, keywords, maxPrice, frequency };
  }

  private async tryClubSearch(text: string): Promise<ChatResult | null> {
    try {
      const categories = await this.clubSearch.listCategories();
      const raw = await this.complete(
        [
          { role: 'system', content: buildExtractionPrompt(categories, FREQUENCIES) },
          { role: 'user', content: text },
        ],
        { maxTokens: 200, temperature: 0, json: true },
      );
      const filters = this.parseFilters(
        raw,
        categories.map((category) => category.id),
      );
      if (!filters) return null;

      const clubs = await this.clubSearch.search(filters);
      if (clubs.length === 0) {
        return {
          reply:
            'No encontré clubes que coincidan con esos criterios por ahora. Probá con otro presupuesto u otra frecuencia, o mirá todos los clubes en [Explorar](/explore).',
          blocked: false,
          clubs: [],
        };
      }
      const plural = clubs.length > 1;
      return {
        reply: `Encontré ${clubs.length} ${plural ? 'clubes que se ajustan' : 'club que se ajusta'} a lo que buscás 👇 El precio es el del plan más económico de cada club.`,
        blocked: false,
        clubs,
      };
    } catch (error) {
      this.logger.error(`Falló la búsqueda de clubes: ${(error as Error).message}`);
      return null;
    }
  }

  async chat(history: ChatMessageDto[], detail: ChatDetail = 'brief'): Promise<ChatResult> {
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

    this.getApiKey();

    if (!this.takeDailySlot()) {
      throw new ServiceUnavailableException('El asistente alcanzó su límite diario. Probá de nuevo mañana.');
    }

    if (looksLikeClubSearch(last.content)) {
      const searchResult = await this.tryClubSearch(last.content);
      if (searchResult) return searchResult;
    }

    const style = detail === 'detailed' ? STYLE_DETAILED : STYLE_BRIEF;
    const raw = await this.complete(
      [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\n${style}` },
        ...cleanHistory.map((message) => ({ role: message.role, content: message.content })),
      ],
      { maxTokens: detail === 'detailed' ? 700 : 400, temperature: 0.3 },
    );

    const text = raw.trim().slice(0, MAX_REPLY_CHARS);
    if (!text || containsProfanity(text)) return { reply: FALLBACK_REPLY, blocked: false };
    return { reply: text, blocked: false };
  }
}