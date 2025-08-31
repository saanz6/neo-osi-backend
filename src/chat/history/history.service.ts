/**
 * @file src/chat/history/history.service.ts
 * @description Сервис для управления историей сообщений в чате с разделением по типам.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage, ChatMessageRole, ChatType } from '../entities/chat-message.entity';
import { User } from '../../users/entities/user.entity';
import { Content } from '@google/generative-ai';

@Injectable()
export class ChatHistoryService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  /**
   * Получает историю для конкретного типа чата.
   * @param userId - ID пользователя.
   * @param type - Тип чата ('chat' или 'document').
   */
  async getHistory(userId: number, type: ChatType): Promise<Content[]> {
    const messages = await this.chatMessageRepository.find({
      where: { user: { id: userId }, type: type }, // <-- Фильтруем по типу
      order: { createdAt: 'DESC' },
    });

    if (messages.length === 0) return [];

    const sortedMessages = messages.reverse();
    const firstUserIndex = sortedMessages.findIndex(msg => msg.role === ChatMessageRole.USER);
    if (firstUserIndex === -1) return [];

    const validHistory = sortedMessages.slice(firstUserIndex);
    return validHistory.map((msg) => ({
      role: msg.role as 'user' | 'model',
      parts: [{ text: msg.content }],
    }));
  }

  /**
   * Добавляет пару сообщений в историю для конкретного типа чата.
   * @param userId - ID пользователя.
   * @param userContent - Сообщение пользователя.
   * @param modelContent - Ответ модели.
   * @param type - Тип чата.
   */
  async addMessageToHistory(userId: number, userContent: string, modelContent: string, type: ChatType): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      console.error(`Попытка добавить историю для несуществующего пользователя с ID: ${userId}`);
      return;
    }

    const userMessage = this.chatMessageRepository.create({
      user,
      role: ChatMessageRole.USER,
      content: userContent,
      type: type, // <-- Указываем тип
    });

    const modelMessage = this.chatMessageRepository.create({
      user,
      role: ChatMessageRole.MODEL,
      content: modelContent,
      type: type, // <-- Указываем тип
    });

    await this.chatMessageRepository.save([userMessage, modelMessage]);
  }

  /**
   * Получает историю для фронтенда для конкретного типа чата.
   * @param userId - ID пользователя.
   * @param type - Тип чата.
   */
  async getHistoryForUser(userId: number, type: ChatType) {
    const messages = await this.chatMessageRepository.find({
      where: { user: { id: userId }, type: type }, // <-- Фильтруем по типу
      order: { createdAt: 'ASC' },
    });


    if (messages.length === 0) {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) return [];

      let welcomeMessageContent = '';

      if (type === ChatType.DOCUMENT) {
        welcomeMessageContent =
          `👋 Құжаттар-ЖИ қош келдіңіз!
      
      Мен сіздің құжаттарды жасау бойынша жеке көмекшіңізбін. Менің міндетім — біздің шаблондар тізімінен қажетті актіні немесе есепті жылдам әрі қатесіз дайындауға көмектесу.
      
      ---
      
      ⚙️ ПРОЦЕСС ҚАЛАЙ ӨТЕДІ?
      
      Мен сізге сұрақтарды біртіндеп қоятын боламын. Сіздің әрбір жауабыңыздан кейін, барлық қажетті ақпарат жиналғанша келесі сұрақты қоямын. Соңында мен сізге дайын .docx файлын жасаймын! 📄
      
      ---
      
      🚀 ҚАЛАЙ БАСТАУ КЕРЕК?
      
      1. Егер қандай құжат керегін білсеңіз:
         Оның атауын жазыңыз.
         Мысал: "Жұмыстарды қабылдау-тапсыру актісі керек"
      
      2. Егер сенімді болмасаңыз:
         Барлық қолжетімді нұсқаларды көрсетуді сұраңыз.
         Мысал: "Құжаттар тізімін көрсет"

      3. Егер басқа құжат бастағыңыз келсе:
         Маған бұл туралы хабарлаңыз.
         Мысал: "Жаңа құжат жасағым келеді"

      ---
      
      ⚠️ МАҢЫЗДЫ АҚПАРАТ:
      
      - Бас тарту: Егер құжат жасаудан бас тартсаңыз, "Бас тарту" немесе "Қажет емес" деп жазыңыз.
      - Кеңес алу: Мен тек дайын шаблондардан құжаттарды жасаймын. Егер сізде жалпы сұрақтар болса (мысалы, "Көршілер суға батырса не істеу керек?"), оларды "ЖИ-Чат" бөлімінде қойыңыз. 💬
      
      ---
      ---
      
      👋 ДОБРО ПОЖАЛОВАТЬ В ИИ-ДОКУМЕНТЫ!
      
      Я ваш ассистент по созданию документов. Моя задача — помочь вам быстро и без ошибок подготовить нужный акт или отчет из нашего списка шаблонов.
      
      ---
      
      ⚙️ КАК ПРОХОДИТ ПРОЦЕСС?
      
      Я буду задавать вам вопросы по одному. После каждого вашего ответа я задам следующий, пока мы не соберем всю необходимую информацию. В конце я сгенерирую для вас готовый .docx файл! 📄
      
      ---
      
      🚀 КАК НАЧАТЬ?
      
      1. Если вы знаете, какой документ вам нужен:
         Напишите его название.
         Пример: "Нужен акт приема-передачи работ"
      
      2. Если вы не уверены в точном названии:
         Попросите меня показать все доступные варианты.
         Пример: "Покажи список документов"
      
      3. Если хотите начать другой документ:
         Просто сообщите мне об этом.
         Пример: "Хочу сделать новый документ"
         
      ---
      
      ⚠️ ВАЖНЫЕ МОМЕНТЫ:
      
      - Отмена: Если вы передумали создавать документ, просто напишите "Отмена" или "Не хочу".
      - Консультации: Я — специалист по созданию документов из готовых шаблонов. Если у вас общие вопросы по ЖКХ (например, "Что делать, если затопили соседи?"), пожалуйста, задайте их в "ИИ-Чат". 💬
      `;
      }
      // --- ВОТ ТЕКСТ ДЛЯ ИИ-ЧАТА ---
      else if (type === ChatType.GENERAL) {
        welcomeMessageContent = `👋 ЖИ-Чатқа қош келдіңіз!

Мен NeoOSI — Қазақстандағы ПИК және ТКШ мәселелері бойынша сіздің сандық көмекшіңізбін.

---

🤖 МЕН ҚАЛАЙ КӨМЕКТЕСЕ АЛАМЫН?
Мен ҚР заңдары мен стандарттарына негізделген жалпы сұрақтарыңызға жауап бере аламын.
Сұрақтардың мысалдары:
- "Кондоминиум дегеніміз не?"
- "Пәтер иесінің міндеттері қандай?"
- "Көршілердің шуымен қалай күресуге болады?"

---

📄 ҚҰЖАТ ЖАСАУ КЕРЕК ПЕ?
Егер сізге акт, өтініш немесе есеп дайындау қажет болса, "ЖИ-Құжаттар" бөліміне өтіңіз. Ол жерде мен сізге бәрін кезең-кезеңімен ресімдеуге көмектесемін.

---
---

👋 ДОБРО ПОЖАЛОВАТЬ В ИИ-ЧАТ!

Я ваш цифровой помощник NeoOSI по вопросам ОСИ и ЖКХ в Казахстане.

---

🤖 ЧЕМ Я МОГУ ПОМОЧЬ?
Я могу ответить на ваши общие вопросы, основываясь на законах и стандартах РК.
Примеры вопросов:
- "Что такое кондоминиум?"
- "Какие обязанности у собственника квартиры?"
- "Как бороться с шумом от соседей?"

---

📄 НУЖНО СОЗДАТЬ ДОКУМЕНТ?
Если вам нужно подготовить акт, заявление или отчет, пожалуйста, перейдите в раздел "ИИ-Документы". Там я пошагово помогу вам все оформить.`;
      }

      if (welcomeMessageContent) {
        const welcomeMessage = this.chatMessageRepository.create({
          user,
          role: ChatMessageRole.MODEL,
          content: welcomeMessageContent,
          type: type,
        });
        await this.chatMessageRepository.save(welcomeMessage);
        return [{
          role: welcomeMessage.role,
          content: welcomeMessage.content,
          createdAt: welcomeMessage.createdAt,
        }];
      }
    }

    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
    }));
  }


  /**
 * Находит последнее сообщение пользователя и обновляет следующее за ним (пустое) сообщение модели.
 * @param userId - ID пользователя.
 *-  @param modelContent - Текст ответа модели для сохранения.
 * @param type - Тип чата.
 */
  async updateLastModelMessage(userId: number, modelContent: string, type: ChatType): Promise<void> {
    // 1. Находим самое последнее сообщение в чате для этого пользователя и типа
    const lastMessage = await this.chatMessageRepository.findOne({
      where: {
        user: { id: userId },
        type: type,
      },
      order: { createdAt: 'DESC' },
    });

    // 2. Проверяем, что это сообщение от пользователя и у него пустой ответ
    if (lastMessage && lastMessage.role === ChatMessageRole.USER) {
      // Это условие означает, что мы только что сохранили сообщение пользователя,
      // а сообщение модели для него еще не создано.
      // (В нашей новой логике мы сохраняем user message с пустым model message,
      // но для надежности лучше создать новое сообщение модели).

      const modelMessage = this.chatMessageRepository.create({
        user: lastMessage.user,
        role: ChatMessageRole.MODEL,
        content: modelContent,
        type: type,
      });
      await this.chatMessageRepository.save(modelMessage);

    } else if (lastMessage && lastMessage.role === ChatMessageRole.MODEL) {
      // Если последнее сообщение уже от модели, просто обновим его
      lastMessage.content = modelContent;
      await this.chatMessageRepository.save(lastMessage);
    } else {
      console.error(`[HistoryService] Не найдено предыдущее сообщение для обновления ответа модели для userId: ${userId}`);
    }
  }
}