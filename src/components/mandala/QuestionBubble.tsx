import React from "react";

interface QuestionBubbleProps {
  question: string;
}

const QuestionBubble: React.FC<QuestionBubbleProps> = ({ question }) => {
  return (
    <div className="bg-white border-2 border-blue-300 rounded-lg p-3 w-48 relative">
      <p className="text-blue-800 text-sm font-medium">{question}</p>
    </div>
  );
};

export default QuestionBubble;
