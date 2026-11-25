import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { FiCpu, FiSend } from "react-icons/fi";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";

import axiosInstance from "../../Utils/axiosInstance";
import { AICard } from "./AICard";

/**
 * --- FINANCIAL ASSISTANT ---
 * A correspondence column rather than a chat toy: the question is set like a
 * note, the answer as an indented reply. The conversation, composer and
 * auto-scroll live here; nothing outside this panel reads them.
 */

export const AssistantChatCard = () => {
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

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
    <AICard
      title="Financial assistant"
      icon={<FiCpu size={15} />}
      iconColor="warning.main"
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 60,
          maxHeight: 110,
          overflowY: "auto",
          pr: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ my: "auto", px: 1 }}>
            <Typography sx={{ fontSize: 11.5, fontWeight: 600 }}>
              No conversation yet
            </Typography>
            <Typography
              sx={{ mt: 0.35, fontSize: 11, color: "text.secondary", lineHeight: 1.5 }}
            >
              Ask about a category, a budget or the month so far. Replies are
              based on the records in your account.
            </Typography>
          </Box>
        )}

        {messages.map((msg, i) => (
          <Box
            key={i}
            sx={
              msg.role === "user"
                ? {
                    alignSelf: "flex-end",
                    maxWidth: "86%",
                    textAlign: "right",
                  }
                : {
                    alignSelf: "stretch",
                    pl: 1.75,
                    borderLeft: "2px solid",
                    borderColor: "primary.main",
                  }
            }
          >
            <Typography
              sx={{
                fontSize: 9,
                fontWeight: 600,
                color: "text.secondary",
                mb: 0.35,
              }}
            >
              {msg.role === "user" ? "You" : "FinTrack"}
            </Typography>
            <Box
              sx={{
                fontSize: 11.5,
                lineHeight: 1.5,
                color: msg.role === "user" ? "text.primary" : "text.secondary",
                "& p": { my: 0.35 },
                "& ul, & ol": { pl: 2, my: 0.5, textAlign: "left" },
              }}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </Box>
          </Box>
        ))}

        {loadingAI && (
          <Typography sx={{ fontSize: 11, color: "text.secondary", pl: 1.5 }}>
            Thinking…
          </Typography>
        )}

        <div ref={chatEndRef} />
      </Box>

      <Stack direction="row" spacing={0.75} sx={{ mt: 0.6, alignItems: "center" }}>
        <TextField
          fullWidth
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask a question about your finances…"
          variant="standard"
          slotProps={{
            input: {
              disableUnderline: false,
              sx: {
                fontSize: "0.78rem",
                pb: 0.5,
                "&:before": { borderColor: "divider" },
              },
            },
          }}
        />
        <IconButton
          onClick={sendMessage}
          disabled={loadingAI || !input.trim()}
          aria-label="Send message"
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "&:hover": { bgcolor: "primary.dark" },
            "&:disabled": { opacity: 0.35, color: "primary.contrastText" },
          }}
        >
          <FiSend size={15} />
        </IconButton>
      </Stack>
    </AICard>
  );
};
