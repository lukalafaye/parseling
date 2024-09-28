"use client";

import { Bot, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { GenAreaChart } from "./gen/area-chart";



export function ChatBox() {

  const [input, setInput] = useState("");
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  const handleInputChange = (event) => {
    setInput(event.target.value);
  };
  
  const fetchCompletion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/completion", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Chat history: ${JSON.stringify(history)}
          
          
          
          New User request: ${input}`,
        }),
      });
      setInput("");
      setHistory(prevHistory => [
        ...prevHistory,
        { role: "user", content: input }
      ]);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setCompletion(data.text || JSON.stringify(data)); // Adjusted to handle response structure
        setHistory(prevHistory => [
          ...prevHistory,
          { role: "assistant", content: data.text || JSON.stringify(data) }
        ]);
        scrollToBottom();
      } else {
        throw new Error("Failed to fetch completion");
      }
    } catch (error) {
      console.error("Error fetching completion:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const [triggerFetch, setTriggerFetch] = useState(false);

  useEffect(() => {
    if (triggerFetch) {
      fetchCompletion();
      setTriggerFetch(false);  // Reset trigger after fetching
    }
  }, [triggerFetch]);  // Trigger fetchCompletion when triggerFetch changes
  
  const handleSubmit = (event) => {
    event.preventDefault();

      // Clear input after submitting
    setTriggerFetch(true);  // Set the trigger to fetch completion
  };
  
  


  const completionEndRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);


  const scrollToBottom = () => {
    completionEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  function handleKeyPress(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  }
  


  useEffect(() => {
    scrollToBottom();
  }, [completion]);



  useEffect(() => {
    if (textRef.current && textRef.current) {
      // reset the textarea height to auto to get the actual content height
      textRef.current.style.height = "auto";
      // set the height to the scrollHeight (actual content height)
      textRef.current.style.height = `${textRef.current.scrollHeight}px`;
    }
  }, [input]);


  console.log(completion)

  return (
    <div className=" no-scrollbar flex flex-col justify-between w-full items-center font-sans">
      <div
        className={`flex flex-col gap-2 overflow-y-scroll w-full no-scrollbar
      ${history.length < 0 && "invisible"}`}
      >
        {history.map((m) => (
          <div
            key={m.id}
           
          >
            {m.role == "user" ? (
              <div  className="flex flex-row md:gap-4 gap-2
              bg-white backdrop-blur-lg rounded-lg border border-neutral-200 p-3">
                <div className="w-[24px] h-[24px]">
                  <User size={24} color="black" />
                </div><MarkdownPreview
              wrapperElement={{
                "data-color-mode": "light",
              }}
              className="markdown-preview "
              source={m.content}
            />
              </div >
            ) : m.role == "assistant" ? (
              <div  className="flex flex-row md:gap-4 gap-2
              bg-white backdrop-blur-lg rounded-lg border border-neutral-200 p-3">
      <div className="w-[24px] h-[24px]">
  <Bot size={24} color="black" />
</div><div className="flex flex-col">
  
  <MarkdownPreview
    wrapperElement={{
      "data-color-mode": "light",
    }}
    className="markdown-preview"
    source={JSON.parse(m.content).mainComment}
  />
  {JSON.parse(m.content).elements.map((element, index) => (
    <div key={index} className="flex flex-col py-6 gap-4">
      <MarkdownPreview
        wrapperElement={{
          "data-color-mode": "light",
        }}
        className="markdown-preview"
        source={element.comment}
      />
      <div className="max-w-[600px]">
        <GenAreaChart chartData={element.chartData} />
      </div>
    </div>
  ))}
</div>
</div>

            ) : (
              "???"
            )}
          </div>
        ))}
        {history.length > 0 && <div ref={completionEndRef} />}
      </div>

      <div className=" w-full flex">
        <form
          onSubmit={handleSubmit}
          className={`${
            (isLoading) && "animate-pulse"
          } bg-white bottom-20  w-full border border-neutral-200 flex rounded-xl focus-within:shadow-xl shadow-md transition-all ease-in-out
      items-center overflow-hidden mb-4 min-h-[54px]`}
        >
          <textarea
            disabled={!!(isLoading)}
            ref={textRef}
            className="md:pl-6 pl-5 pr-4 py-4 w-full resize-none md:text-[15px] text-sm
          focus:outline-none no-scrollbar max-h-64"
            value={input}
            placeholder={
              !(isLoading)
                ? "Search patient data..."
                : `Let him cook!`
            }
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            rows={1}
          />
          <div className="flex flex-col h-full justify-end pb-2">
            <button
              disabled={isLoading}
              type="submit"
              className={`bg-emerald-400 ${
                !(isLoading) && "hover:bg-emerald-300"
              } rounded-md shadow-md mr-2 p-2`}
            >
              <Send size={20} color="white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
