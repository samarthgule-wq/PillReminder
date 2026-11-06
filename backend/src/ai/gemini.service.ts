import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { AiToolsService, ToolExecutionContext } from './ai-tools.service.js';

export interface ChatHistoryMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface ChatResult {
  reply: string;
  toolCalls?: Array<{ name: string; args: any }>;
  toolResults?: Array<{ name: string; result: any }>;
  modelUsed: string;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private aiClient: GoogleGenAI | null = null;
  private readonly configuredModel: string;

  constructor(private readonly toolsService: AiToolsService) {
    this.configuredModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    this.initializeClient();
  }

  private initializeClient() {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (apiKey && apiKey !== 'your_actual_gemini_api_key') {
      try {
        this.aiClient = new GoogleGenAI({ apiKey });
        this.logger.log(`Google GenAI initialized with model: ${this.configuredModel}`);
      } catch (err) {
        this.logger.error('Failed to instantiate GoogleGenAI client:', err);
        this.aiClient = null;
      }
    } else {
      this.logger.warn(
        'GEMINI_API_KEY is not set or using placeholder. GeminiService will provide informative diagnostics until key is configured.',
      );
    }
  }

  /**
   * System instruction adhering strictly to Section 7 guidelines.
   */
  private getSystemInstruction(context: ToolExecutionContext): string {
    return `
You are PillReminder AI, an intelligent, empathetic, and clinical-grade conversational assistant embedded within the PillReminder healthcare ecosystem.

CURRENT CONVERSATION CONTEXT:
- Authenticated User ID: "${context.userId}"
- User Role: "${context.userRole.toUpperCase()}"
- Current Date/Time: "${new Date().toUTCString()}"

CORE OBJECTIVE:
Assist the user with medication schedules, digital prescriptions, dose reminders, pharmacy inventory, caregiver oversight, or general medical and technical knowledge.

COMMUNICATION PRINCIPLES:
1. Speak warmly, respectfully, clearly, and concisely.
2. Structure responses with markdown headings, bullet points, or clean comparison tables where appropriate.
3. Understand natural language without requiring exact commands or structured syntax.
4. Maintain context across multi-turn questions (e.g. if the user says "what about tomorrow?", reference previous medicines).
5. Explain medical terminology simply without condescension.

APPLICATION DATA & TOOLS:
1. When asked about user-specific data (medicines, reminders, prescriptions, inventory, orders, family members), ALWAYS call the appropriate backend tool to retrieve factual records from PostgreSQL.
2. Never invent or assume a prescription, dosage, schedule, refill status, or stock availability.
3. If tool data shows zero records or empty results, state that clearly and offer assistance.
4. You cannot independently alter, prescribe, or delete medical records.

HEALTHCARE SAFETY GUARANTEES:
1. DO NOT diagnose medical conditions or diseases.
2. DO NOT independently prescribe or alter medications, strengths, or schedules.
3. DO NOT recommend stopping medications or taking double doses to make up for missed doses.
4. For dosage adjustments, adverse reactions, or missed dose clinical queries, explain what is recorded in the prescription instructions and advise consulting the prescribing doctor or licensed pharmacist.
5. In severe health emergencies, always instruct the user to contact emergency services (e.g., 911 or local emergency numbers) immediately.

ROLE SPECIFIC GUIDELINES:
- PATIENT: Focus on daily schedule, which medicines are taken or pending, instructions (e.g. with food, before bed), refill urgency, and pharmacy availability.
- DOCTOR: Focus on patient management, active prescriptions authored, adherence rates, and clinical notes.
- PHARMACY: Focus on inventory stock, low-stock warnings, order fulfillment, verification, and pricing.
- GUARDIAN: Focus on patient-authorized adherence tracking and friendly nudges, respecting consent boundaries.
`;
  }

  /**
   * Tool / Function Declarations for Gemini API
   */
  private getToolDeclarations() {
    return [
      {
        functionDeclarations: [
          {
            name: 'get_my_profile',
            description: 'Get profile details and clinical summary for the authenticated user.',
            parameters: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_today_reminders',
            description: "Get today's scheduled, taken, snoozed, and pending medication reminders.",
            parameters: {
              type: 'object',
              properties: {
                patientId: {
                  type: 'string',
                  description: 'Optional patient ID (for authorized doctor or guardian).',
                },
              },
            },
          },
          {
            name: 'get_upcoming_reminders',
            description: 'Get upcoming scheduled reminders for the next several days.',
            parameters: {
              type: 'object',
              properties: {
                patientId: {
                  type: 'string',
                  description: 'Optional patient ID.',
                },
                daysAhead: {
                  type: 'number',
                  description: 'Number of days ahead to search.',
                },
              },
            },
          },
          {
            name: 'get_medication_history',
            description: 'Get self-reported dose history and adherence logs (taken, skipped, snoozed).',
            parameters: {
              type: 'object',
              properties: {
                patientId: {
                  type: 'string',
                  description: 'Optional patient ID.',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of history records to retrieve.',
                },
              },
            },
          },
          {
            name: 'get_active_prescriptions',
            description: 'Get currently active prescriptions with medicines, dosages, frequencies, and doctor notes.',
            parameters: {
              type: 'object',
              properties: {
                patientId: {
                  type: 'string',
                  description: 'Optional patient ID for authorized doctors or guardians.',
                },
              },
            },
          },
          {
            name: 'get_prescription_details',
            description: 'Get full clinical details for a specific prescription number or ID.',
            parameters: {
              type: 'object',
              properties: {
                prescriptionNumberOrId: {
                  type: 'string',
                  description: 'The prescription identifier (e.g. PR-89410-26 or rx-2026-001).',
                },
              },
              required: ['prescriptionNumberOrId'],
            },
          },
          {
            name: 'get_patient_adherence_summary',
            description: 'Get calculated adherence rate and dosage completion breakdown for a patient.',
            parameters: {
              type: 'object',
              properties: {
                patientId: {
                  type: 'string',
                  description: 'Optional patient ID.',
                },
              },
            },
          },
          {
            name: 'get_pharmacy_inventory',
            description: 'Get inventory stock, pricing, and availability from the pharmacy records.',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Filter inventory by medicine name.',
                },
                lowStockOnly: {
                  type: 'boolean',
                  description: 'If true, returns only items with low stock (quantity <= 10).',
                },
              },
            },
          },
          {
            name: 'search_available_medicines',
            description: 'Search for available medications across participating pharmacies.',
            parameters: {
              type: 'object',
              properties: {
                medicineName: {
                  type: 'string',
                  description: 'Name of the medicine to check.',
                },
              },
              required: ['medicineName'],
            },
          },
          {
            name: 'get_pending_orders',
            description: 'Get pending pharmacy orders awaiting pharmacist review, pickup, or fulfillment.',
            parameters: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_order_history',
            description: 'Get past completed pharmacy orders and purchase receipts.',
            parameters: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_guardian_activity',
            description: 'Get authorized family caregiver updates on linked member doses and refills.',
            parameters: {
              type: 'object',
              properties: {
                memberId: {
                  type: 'string',
                  description: 'Optional member ID to inspect.',
                },
              },
            },
          },
          {
            name: 'get_doctor_patients',
            description: 'Get list of patients linked to the authenticated doctor with clinical summaries.',
            parameters: {
              type: 'object',
              properties: {},
            },
          },
        ],
      },
    ];
  }

  /**
   * Dispatches a tool function call to AiToolsService
   */
  private async executeToolCall(name: string, args: any, context: ToolExecutionContext): Promise<any> {
    this.logger.log(`Executing tool: ${name} with args: ${JSON.stringify(args)}`);
    try {
      switch (name) {
        case 'get_my_profile':
          return await this.toolsService.getMyProfile(context);
        case 'get_today_reminders':
          return await this.toolsService.getTodayReminders(args || {}, context);
        case 'get_upcoming_reminders':
          return await this.toolsService.getUpcomingReminders(args || {}, context);
        case 'get_medication_history':
          return await this.toolsService.getMedicationHistory(args || {}, context);
        case 'get_active_prescriptions':
          return await this.toolsService.getActivePrescriptions(args || {}, context);
        case 'get_prescription_details':
          return await this.toolsService.getPrescriptionDetails(args || {}, context);
        case 'get_patient_adherence_summary':
          return await this.toolsService.getPatientAdherenceSummary(args || {}, context);
        case 'get_pharmacy_inventory':
          return await this.toolsService.getPharmacyInventory(args || {}, context);
        case 'search_available_medicines':
          return await this.toolsService.searchAvailableMedicines(args || {});
        case 'get_pending_orders':
          return await this.toolsService.getPendingOrders(context);
        case 'get_order_history':
          return await this.toolsService.getOrderHistory(context);
        case 'get_guardian_activity':
          return await this.toolsService.getGuardianActivity(args || {}, context);
        case 'get_doctor_patients':
          return await this.toolsService.getDoctorPatients(context);
        default:
          return { status: 'error', message: `Unknown tool function: ${name}` };
      }
    } catch (error: any) {
      this.logger.error(`Error executing tool ${name}:`, error);
      return { status: 'error', message: error?.message || 'Tool execution failed' };
    }
  }

  private async generateWithRetry(params: any, maxRetries = 2, delayMs = 700): Promise<any> {
    let lastErr: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.aiClient!.models.generateContent(params);
      } catch (err: any) {
        lastErr = err;
        if ((err?.status === 503 || err?.message?.includes('503')) && attempt < maxRetries) {
          this.logger.warn(`Gemini 503 spike on attempt ${attempt + 1}, retrying in ${delayMs * (attempt + 1)}ms...`);
          await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }
    throw lastErr;
  }

  /**
   * Main Conversational Method
   */
  async chat(
    message: string,
    history: ChatHistoryMessage[],
    context: ToolExecutionContext,
  ): Promise<ChatResult> {
    // If Gemini client is not initialized due to missing API key, provide smart local handler with real DB tools
    if (!this.aiClient) {
      return this.handleFallbackWithoutApiKey(message, context);
    }

    try {
      // 1. Format contents from conversation history
      const contents: any[] = history.map((m) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // Append latest user message
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const systemInstruction = this.getSystemInstruction(context);
      const tools = this.getToolDeclarations();

      let activeModel = this.configuredModel;
      let response: any;
      try {
        response = await this.generateWithRetry({
          model: activeModel,
          contents,
          config: {
            systemInstruction,
            tools: tools as any,
            temperature: 0.2, // Low temperature for high medical precision
          },
        });
      } catch (callErr: any) {
        if ((callErr?.status === 503 || callErr?.status === 404) && activeModel !== 'gemini-3.5-flash-lite') {
          this.logger.warn(`Model ${activeModel} returned ${callErr?.status}, falling back to gemini-3.5-flash-lite`);
          activeModel = 'gemini-3.5-flash-lite';
          response = await this.generateWithRetry({
            model: activeModel,
            contents,
            config: {
              systemInstruction,
              tools: tools as any,
              temperature: 0.2,
            },
          });
        } else {
          throw callErr;
        }
      }

      const toolCallsRecorded: Array<{ name: string; args: any }> = [];
      const toolResultsRecorded: Array<{ name: string; result: any }> = [];

      // 3. Handle Function Calling Loop (up to 4 iterations for chained tool use)
      let iterations = 0;
      while (response.functionCalls && response.functionCalls.length > 0 && iterations < 4) {
        iterations++;
        const functionCalls = response.functionCalls;
        this.logger.log(`Gemini requested ${functionCalls.length} function call(s) in iteration ${iterations}`);

        // Add model's tool request to contents (preserve thought_signature and original candidate content)
        if (response.candidates?.[0]?.content) {
          contents.push(response.candidates[0].content);
        } else {
          contents.push({
            role: 'model',
            parts: functionCalls.map((fc: any) => ({
              functionCall: {
                name: fc.name || 'unknown',
                args: fc.args,
              },
            })),
          });
        }

        // Execute all requested functions
        const toolResponseParts: any[] = [];
        for (const fc of functionCalls) {
          const funcName = fc.name || 'unknown';
          toolCallsRecorded.push({ name: funcName, args: fc.args });
          const toolResult = await this.executeToolCall(funcName, fc.args, context);
          toolResultsRecorded.push({ name: funcName, result: toolResult });

          toolResponseParts.push({
            functionResponse: {
              name: funcName,
              response: { result: toolResult },
            },
          });
        }

        // Add function responses to contents
        contents.push({
          role: 'user',
          parts: toolResponseParts,
        });

        // Send function responses back to Gemini for final answer synthesis
        response = await this.generateWithRetry({
          model: activeModel,
          contents,
          config: {
            systemInstruction,
            tools: tools as any,
            temperature: 0.2,
          },
        });
      }

      const replyText = response.text || 'I have reviewed your request, but could not produce a response.';

      return {
        reply: replyText,
        toolCalls: toolCallsRecorded.length > 0 ? toolCallsRecorded : undefined,
        toolResults: toolResultsRecorded.length > 0 ? toolResultsRecorded : undefined,
        modelUsed: activeModel,
      };
    } catch (error: any) {
      this.logger.error('Gemini API request failed:', error);
      return this.handleApiError(error, message, context);
    }
  }

  /**
   * Streaming Chat Method
   */
  async *chatStream(
    message: string,
    history: ChatHistoryMessage[],
    context: ToolExecutionContext,
  ): AsyncGenerator<{ chunk: string; isComplete?: boolean; toolInfo?: any }> {
    if (!this.aiClient) {
      const fallback = await this.handleFallbackWithoutApiKey(message, context);
      yield { chunk: fallback.reply, isComplete: true, toolInfo: fallback.toolResults };
      return;
    }

    try {
      // 1. First run the function calling check to resolve any required backend tools
      const result = await this.chat(message, history, context);
      
      // Yield tokens in clean readable increments for smooth streaming UX
      const words = result.reply.split(' ');
      let buffer = '';
      for (let i = 0; i < words.length; i++) {
        buffer += (i === 0 ? '' : ' ') + words[i];
        if (i % 3 === 0 || i === words.length - 1) {
          yield { chunk: buffer, isComplete: i === words.length - 1, toolInfo: result.toolResults };
          buffer = '';
          await new Promise((r) => setTimeout(r, 18)); // Smooth typing cadence
        }
      }
    } catch (error: any) {
      const handled = this.handleApiError(error, message, context);
      yield { chunk: handled.reply, isComplete: true };
    }
  }

  /**
   * Graceful Error Handler
   */
  private handleApiError(error: any, message: string, context: ToolExecutionContext): ChatResult {
    const errorStr = String(error?.message || error || '');

    if (errorStr.includes('API_KEY_INVALID') || errorStr.includes('API key not valid')) {
      return {
        reply: `### 🔑 Gemini API Key Configuration Required\n\nThe Google Gemini API reported that the configured \`GEMINI_API_KEY\` is invalid or expired.\n\n**Next Steps:**\n1. Generate an API key from Google AI Studio (https://aistudio.google.com/app/apikey).\n2. Update \`GEMINI_API_KEY\` in your \`backend/.env\` file.\n3. Restart the backend service.`,
        modelUsed: this.configuredModel,
      };
    }

    if (errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('quota') || errorStr.includes('429')) {
      return {
        reply: `### ⏳ Gemini API Rate Limit / Quota Exceeded\n\nThe Google Gemini API quota for the model **${this.configuredModel}** has temporarily reached its rate limit.\n\nPlease wait a few moments before sending another prompt, or verify your quota limits in Google AI Studio.`,
        modelUsed: this.configuredModel,
      };
    }

    return {
      reply: `### ⚠️ PillReminder AI Communication Notice\n\nI was unable to complete the request via the Gemini API (\`${error?.message || 'Network Timeout'}\`).\n\nPlease ensure your network connection and API key configurations are healthy.`,
      modelUsed: this.configuredModel,
    };
  }

  /**
   * Diagnostic Fallback when GEMINI_API_KEY is not yet populated
   * Safely fulfills application queries using actual database tools so the system remains functional!
   */
  private async handleFallbackWithoutApiKey(message: string, context: ToolExecutionContext): Promise<ChatResult> {
    const lower = message.toLowerCase();
    this.logger.log(`Executing database-backed offline assistance for prompt: "${message}"`);

    // Application query detection:
    if (lower.includes('today') || lower.includes('reminder') || lower.includes('schedule') || lower.includes('take today')) {
      const reminders = await this.toolsService.getTodayReminders({}, context);
      const items = (reminders as any).reminders || [];
      const listStr = items.map((r: any) => `- **${r.scheduledTime}** — **${r.medicineName}** (${r.strength}): ${r.dosage}. Status: \`${r.status.toUpperCase()}\`. (${r.instructions})`).join('\n');

      return {
        reply: `### 📋 Today's Medication Schedule\n\nHere are your actual medication records retrieved from PostgreSQL:\n\n${listStr || 'No pending reminders scheduled for today.'}\n\n> 💡 **Notice:** To enable dynamic conversational responses, set your \`GEMINI_API_KEY\` in \`backend/.env\`.`,
        toolResults: [{ name: 'get_today_reminders', result: reminders }],
        modelUsed: 'database-service',
      };
    }

    if (lower.includes('prescription') || lower.includes('rx') || lower.includes('prescribed')) {
      const rx = await this.toolsService.getActivePrescriptions({}, context);
      const list = (rx as any).prescriptions || [];
      const rxStr = list.map((p: any) => `#### Prescription #${p.prescriptionNumber} (${p.status})\n- **Doctor:** ${p.doctorName} (${p.doctorSpecialty})\n- **Diagnosis:** ${p.diagnosis}\n- **Medicines:**\n` + p.medicines.map((m: any) => `  - **${m.name}** (${m.strength}) — ${m.dosage}, ${m.frequency}`).join('\n')).join('\n\n');

      return {
        reply: `### 🩺 Active Prescriptions\n\n${rxStr || 'No active prescriptions found for your profile.'}\n\n> 💡 **Notice:** Add \`GEMINI_API_KEY\` in \`backend/.env\` for full natural-language synthesis.`,
        toolResults: [{ name: 'get_active_prescriptions', result: rx }],
        modelUsed: 'database-service',
      };
    }

    if (lower.includes('stock') || lower.includes('inventory') || lower.includes('low in stock')) {
      const inv = await this.toolsService.getPharmacyInventory({ lowStockOnly: lower.includes('low') }, context);
      const items = (inv as any).items || [];
      const invStr = items.map((i: any) => `- **${i.medicineName}** (${i.strength}): **${i.quantityInStock} units** in stock — ${i.unitPrice} ${i.isLowStock ? '⚠️ *LOW STOCK*' : '✅ Available'}`).join('\n');

      return {
        reply: `### 📦 Pharmacy Inventory Status\n\n${invStr || 'No matching inventory items found.'}`,
        toolResults: [{ name: 'get_pharmacy_inventory', result: inv }],
        modelUsed: 'database-service',
      };
    }

    if (lower.includes('order') || lower.includes('pending orders')) {
      const orders = await this.toolsService.getPendingOrders(context);
      const list = (orders as any).orders || [];
      const ordStr = list.map((o: any) => `- **Order #${o.orderNumber}** (${o.patientName}) — ${o.totalAmount} | Status: **${o.fulfillmentStatus}** (${o.deliveryType})`).join('\n');

      return {
        reply: `### 🛍️ Pharmacy Orders\n\n${ordStr || 'No pending orders.'}`,
        toolResults: [{ name: 'get_pending_orders', result: orders }],
        modelUsed: 'database-service',
      };
    }

    if (lower.includes('guardian') || lower.includes('family') || lower.includes('member')) {
      const activity = await this.toolsService.getGuardianActivity({}, context);
      return {
        reply: `### 🛡️ Family Guardian Oversight\n\n${JSON.stringify((activity as any).authorizedMember || activity, null, 2)}`,
        toolResults: [{ name: 'get_guardian_activity', result: activity }],
        modelUsed: 'database-service',
      };
    }

    if (lower.includes('patient') && context.userRole === 'doctor') {
      const patients = await this.toolsService.getDoctorPatients(context);
      const list = (patients as any).patients || [];
      const patStr = list.map((p: any) => `- **${p.fullName}** (${p.age}y): Adherence: **${p.adherenceRate}** | Conditions: ${p.chronicConditions.join(', ')}`).join('\n');

      return {
        reply: `### 👨‍⚕️ Clinical Patients Roster\n\n${patStr || 'No linked patients.'}`,
        toolResults: [{ name: 'get_doctor_patients', result: patients }],
        modelUsed: 'database-service',
      };
    }

    // Default conversational response
    return {
      reply: `Hello! I am **PillReminder AI**.\n\nI am currently running in live database mode. I can query real-time database records for:\n- **Today's medication schedule & reminders**\n- **Active prescriptions and dosages**\n- **Adherence history and missed doses**\n- **Pharmacy inventory stock & pending orders**\n- **Patient-authorized guardian oversight**\n\n> 🔑 **To unlock full Gemini intelligence:**\n> Set \`GEMINI_API_KEY=your_key\` in \`backend/.env\`.\n> Supported models: \`gemini-2.5-flash\` or \`gemini-2.0-flash\`.`,
      modelUsed: 'database-service',
    };
  }
}
