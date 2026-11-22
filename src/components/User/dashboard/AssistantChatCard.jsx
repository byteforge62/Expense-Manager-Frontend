import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { FiCpu, FiInbox, FiSend } from "react-icons/fi";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";

import axiosInstance from "../../Utils/axiosInstance";
import { AICard } from "./AICard";

/**
 * --- FINANCIAL ASSISTANT ---
 * The only dashboard section with its own API call and state: the conversation,
 * the composer and the auto-scroll effect belong together and nothing outside
 * this card reads them.
 */

export const AssistantChatCard = () => {
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // Cognitive Chat: Send a manual query to the AI
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    try {
      setLoadingAI(true);
      const res = await axiosInstance.post("/ai/ask", { message: input });
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            res.data?.data?.reply ||
            "I encountered an error processing your request.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Communication failed. Please check your network.",
        },
      ]);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
        <Grid size={{ xs: 12, md: 6 }}>
          <AICard
            title="Financial assistant"
            icon={<FiCpu size={16} />}
            iconColor="warning.main"
          >
            <Box
              sx={{
                height: 260,
                overflowY: "auto",
                mb: 2,
                pr: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {messages.length === 0 && (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{ height: "100%", opacity: 0.6 }}
                >
                  <Box sx={{ color: "text.secondary", display: "flex", mb: 1 }}>
                    <FiInbox size={22} />
                  </Box>
                  <Typography
                    sx={{ fontSize: 12.5, fontWeight: 600, color: "text.secondary" }}
                  >
                    No conversation yet
                  </Typography>
                </Stack>
              )}
              {messages.map((msg, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "85%",
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                      boxShadow: 1,
                      bgcolor:
                        msg.role === "user" ? "cyan.main" : "action.hover",
                      color: msg.role === "user" ? "white" : "text.primary",
                      border: 1,
                      borderColor: "divider",
                      borderBottomRightRadius: msg.role === "user" ? 1 : 4,
                      borderBottomLeftRadius: msg.role === "ai" ? 1 : 4,
                    }}
                  >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </Box>
                </Box>
              ))}
              {loadingAI && (
                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Box
                    sx={{
                      bgcolor: "action.hover",
                      border: 1,
                      borderColor: "divider",
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      borderBottomLeftRadius: 1,
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                      Thinking…
                    </Typography>
                  </Box>
                </Box>
              )}
              <div ref={chatEndRef} />
            </Box>

            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask a question about your finances…"
                slotProps={{
                  input: {
                    sx: { borderRadius: 1.5, fontSize: "0.8rem" },
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={sendMessage}
                disabled={loadingAI || !input.trim()}
                aria-label="Send message"
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  borderRadius: "8px",
                  width: 40,
                  height: 40,
                  "&:hover": { bgcolor: "primary.dark" },
                  "&:disabled": { opacity: 0.4, color: "primary.contrastText" },
                }}
              >
                <FiSend size={16} />
              </IconButton>
            </Stack>
          </AICard>
        </Grid>
  );
};
