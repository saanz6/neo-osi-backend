// src\users\entities\user.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ChatMessage } from '../../chat/entities/chat-message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ default: 'Базовый' })
  tariff: string;

  @Column({ type: 'timestamp', nullable: true, default: null })
  last_generation_date: Date | null;

  @Column({ nullable: true, default: null })
  full_name: string;

  @Column({ nullable: true, default: null })
  phone: string;

  @Column({ default: 'resident' })
  role: 'resident' | 'admin' | 'accountant';

  @Column({ type: 'timestamp', nullable: true, default: null })
  subscription_expires_at: Date | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  password_reset_token: string | null;

  @Column({ type: 'timestamp', nullable: true, default: null })
  password_reset_expires: Date | null;

  @Column({ type: 'boolean', default: false })
  password_change_required: boolean;

  @Column({ type: 'int', default: 0 })
  generation_count: number;

  // --- ВОЗВРАЩАЕМ ЭТИ ПОЛЯ, НО ТОЛЬКО ДЛЯ ДОКУМЕНТОВ ---
  @Column({ type: 'varchar', nullable: true, default: null })
  doc_chat_template: string | null; // Новое имя

  @Column({ type: 'varchar', nullable: true, default: null })
  doc_chat_request_id: string | null; // Новое имя
  
  @Column({ type: 'integer', nullable: true, default: 0 })
  doc_chat_question_index: number; // Номер текущего вопроса (начиная с 0)

  @Column({ type: 'jsonb', nullable: true, default: {} })
  doc_chat_pending_data: Record<string, any>;

  // Добавляем связь с сообщениями чата
  @Column({ type: 'varchar', nullable: true, default: null })
  currentHashedRefreshToken?: string | null;
  
  @OneToMany(() => ChatMessage, (message) => message.user)
  chatMessages: ChatMessage[];
}