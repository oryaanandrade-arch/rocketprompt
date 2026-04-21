import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`;

export function useChat(conversationId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

  // Load existing conversation messages
  const { data: existingMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!conversationId && !!user,
  });

  // Sync messages when data loads
  useEffect(() => {
    if (existingMessages && existingMessages.length > 0) {
      setMessages(existingMessages.map(m => ({ 
        id: m.id, 
        role: m.role as "user" | "assistant", 
        content: m.content 
      })));
    }
  }, [existingMessages]);

  // Create new conversation
  const createConversation = useMutation({
    mutationFn: async (title?: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: user.id,
          title: title || "Nova conversa",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Save message to database
  const saveMessage = useCallback(async (
    convId: string,
    role: "user" | "assistant",
    content: string
  ) => {
    if (!user) return;

    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      user_id: user.id,
      role,
      content,
    });
  }, [user]);

  // Stream chat response
  const streamChat = useCallback(async (
    userMessage: string,
    currentConvId?: string
  ): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado",
        variant: "destructive",
      });
      return null;
    }

    // Create conversation if needed
    let convId = currentConvId;
    if (!convId) {
      try {
        const conv = await createConversation.mutateAsync(userMessage.slice(0, 50));
        convId = conv.id;
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível criar a conversa",
          variant: "destructive",
        });
        return null;
      }
    }

    // Add user message to UI
    const userMsg: Message = { role: "user", content: userMessage };
    setMessages(prev => [...prev, userMsg]);

    // Save user message
    await saveMessage(convId, "user", userMessage);

    setIsStreaming(true);
    let assistantContent = "";

    try {
      const allMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      // Add empty assistant message
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastIdx = newMessages.length - 1;
                if (newMessages[lastIdx]?.role === "assistant") {
                  newMessages[lastIdx] = { ...newMessages[lastIdx], content: assistantContent };
                }
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant message
      await saveMessage(convId, "assistant", assistantContent);

      // Check for final prompt
      const promptMatch = assistantContent.match(/---PROMPT_FINAL_START---([\s\S]*?)---PROMPT_FINAL_END---/);
      if (promptMatch) {
        setGeneratedPrompt(promptMatch[1].trim());
      }

      queryClient.invalidateQueries({ queryKey: ["chat-messages", convId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      return convId;
    } catch (error) {
      console.error("Stream error:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar resposta",
        variant: "destructive",
      });
      // Remove failed assistant message
      setMessages(prev => prev.slice(0, -1));
      return convId || null;
    } finally {
      setIsStreaming(false);
    }
  }, [user, messages, saveMessage, createConversation, toast, queryClient]);

  // Save generated prompt
  const savePrompt = useMutation({
    mutationFn: async ({ title, content, convId }: { title: string; content: string; convId?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("generated_prompts")
        .insert({
          user_id: user.id,
          conversation_id: convId,
          title,
          prompt_content: content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Prompt salvo!",
        description: "Seu prompt foi salvo na biblioteca.",
      });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
    },
  });

  const resetChat = useCallback(() => {
    setMessages([]);
    setGeneratedPrompt(null);
  }, []);

  return {
    messages,
    isStreaming,
    isLoadingMessages,
    generatedPrompt,
    streamChat,
    savePrompt,
    resetChat,
    createConversation,
  };
}

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useGeneratedPrompts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["prompts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_prompts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
