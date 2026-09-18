import re

with open('src/components/VoiceAssistantModal.tsx', 'r') as f:
    text = f.read()

# Fix speakFeedback to take onEnd and call it
target_speak = """  const speakFeedback = (text: string) => {
    if (!speakOutput || !synthRef.current) return;
    try {
      synthRef.current.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      synthRef.current.speak(utterance);
    } catch (e) {
      console.error("TTS failed:", e);
    }
  };"""

replace_speak = """  const speakFeedback = (text: string, onEnd?: () => void) => {
    if (!speakOutput || !synthRef.current) {
      if (onEnd) onEnd();
      return;
    }
    try {
      synthRef.current.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      if (onEnd) utterance.onend = onEnd;
      synthRef.current.speak(utterance);
    } catch (e) {
      console.error("TTS failed:", e);
      if (onEnd) onEnd();
    }
  };"""
text = text.replace(target_speak, replace_speak)

# Fix where speakFeedback is called in handleSendQuery
target_handle = """      setResult(cmdResult);
      setStatusMessage("Executing task...");
      speakFeedback(cmdResult.feedback);

      // Execute the task
      await executeAction(cmdResult);

    } catch (err: any) {"""

replace_handle = """      setResult(cmdResult);
      setStatusMessage("Executing task...");
      
      // Execute the task first
      await executeAction(cmdResult);
      
      // Speak and close
      speakFeedback(cmdResult.feedback, () => {
        handleClose();
      });

    } catch (err: any) {"""
text = text.replace(target_handle, replace_handle)


# Update NAVIGATE in VoiceAssistantModal to handle month for dashboard
target_nav = """        case "NAVIGATE": {
          if (params.path === "/report" && params.monthName) {
            navigate(`/report?month=${params.monthName}${params.yearValue ? `&year=${params.yearValue}` : ""}`);
          } else if (params.path) {
            navigate(params.path);
          }
          break;
        }"""

replace_nav = """        case "NAVIGATE": {
          if (params.path === "/report" && params.monthName) {
            navigate(`/report?month=${params.monthName}${params.yearValue ? `&year=${params.yearValue}` : ""}`);
          } else if (params.path === "/" && params.monthName) {
            navigate(`/?view=Monthly&month=${params.monthName}${params.yearValue ? `&year=${params.yearValue}` : ""}`);
          } else if (params.path) {
            navigate(params.path);
          }
          break;
        }"""
text = text.replace(target_nav, replace_nav)

with open('src/components/VoiceAssistantModal.tsx', 'w') as f:
    f.write(text)
